const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ROLES, canManageUser } = require('../config/roles');
const logger = require('../utils/logger');

class UserService {
  async getAllUsers(query, actorRole) {
    const {
      page = 1,
      limit = 10,
      search = '',
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter = { isDeleted: false };

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) filter.role = role;
    if (status) filter.status = status;

    // Managers cannot see admins
    if (actorRole === ROLES.MANAGER) {
      filter.role = { $ne: ROLES.ADMIN };
    }

    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken -__v')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
        hasNextPage: skip + parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1,
      },
    };
  }

  async getUserById(id, actor) {
    const user = await User.findOne({ _id: id, isDeleted: false })
      .select('-password -refreshToken -__v')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!user) throw new AppError('User not found', 404);

    // Check if actor can view this user
    if (actor.role !== ROLES.ADMIN && actor.role !== ROLES.MANAGER) {
      if (actor._id.toString() !== id) {
        throw new AppError('You do not have permission to view this user', 403);
      }
    }

    // Manager cannot view admins
    if (actor.role === ROLES.MANAGER && user.role === ROLES.ADMIN) {
      throw new AppError('You do not have permission to view this user', 403);
    }

    return user;
  }

  async createUser(userData, createdBy) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) throw new AppError('A user with this email already exists', 409);

    const user = await User.create({
      ...userData,
      createdBy: createdBy._id,
      updatedBy: createdBy._id,
    });

    logger.info(`User created: ${user.email} by ${createdBy.email}`);
    return user.toSafeObject();
  }

  async updateUser(id, updateData, actor) {
    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) throw new AppError('User not found', 404);

    // Check permissions
    if (!canManageUser(actor.role, user.role)) {
      throw new AppError('You do not have permission to update this user', 403);
    }

    // Only admin can change roles
    if (updateData.role && actor.role !== ROLES.ADMIN) {
      throw new AppError('Only admins can change user roles', 403);
    }

    // Prevent setting role higher than actor's own role
    if (updateData.role === ROLES.ADMIN && actor.role !== ROLES.ADMIN) {
      throw new AppError('You cannot assign admin role', 403);
    }

    const allowedFields = ['name', 'email', 'role', 'status'];
    if (actor.role === ROLES.ADMIN) allowedFields.push('role', 'status');
    
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    user.updatedBy = actor._id;
    await user.save();

    logger.info(`User ${user.email} updated by ${actor.email}`);
    return user.toSafeObject();
  }

  async updateProfile(userId, updateData, currentUser) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User not found', 404);

    if (updateData.name) user.name = updateData.name;

    if (updateData.password) {
      const isValid = await user.comparePassword(updateData.currentPassword);
      if (!isValid) throw new AppError('Current password is incorrect', 400);
      user.password = updateData.password;
    }

    user.updatedBy = currentUser._id;
    await user.save();

    logger.info(`Profile updated for: ${user.email}`);
    return user.toSafeObject();
  }

  async deleteUser(id, actor) {
    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) throw new AppError('User not found', 404);

    // Cannot delete yourself
    if (actor._id.toString() === id) {
      throw new AppError('You cannot delete your own account', 400);
    }

    // Cannot delete another admin unless you're admin
    if (user.role === ROLES.ADMIN && actor.role !== ROLES.ADMIN) {
      throw new AppError('You do not have permission to delete this user', 403);
    }

    await user.softDelete(actor._id);
    logger.info(`User ${user.email} soft-deleted by ${actor.email}`);
  }

  async getUserStats() {
    const [total, byRole, byStatus] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      User.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const roleStats = {};
    byRole.forEach(({ _id, count }) => { roleStats[_id] = count; });

    const statusStats = {};
    byStatus.forEach(({ _id, count }) => { statusStats[_id] = count; });

    return { total, byRole: roleStats, byStatus: statusStats };
  }
}

module.exports = new UserService();
