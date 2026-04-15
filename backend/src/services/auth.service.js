const User = require('../models/User');
const AppError = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const { ROLES } = require('../config/roles');
const logger = require('../utils/logger');

class AuthService {
  async login(email, password) {
    // Find user with password
    const user = await User.findOne({ email, isDeleted: false }).select('+password');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status === 'inactive') {
      throw new AppError('Your account has been deactivated. Please contact an administrator.', 403);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token hash
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    logger.info(`User logged in: ${user.email} (${user.role})`);

    return { user: user.toSafeObject(), accessToken, refreshToken };
  }

  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('A user with this email already exists', 409);
    }

    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: ROLES.USER,
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user: user.toSafeObject(), accessToken, refreshToken };
  }

  async refreshTokens(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token required', 401);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await User.findOne({
      _id: decoded.id,
      refreshToken,
      isDeleted: false,
      status: 'active',
    });

    if (!user) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  async getMe(userId) {
    const user = await User.findById(userId)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!user) throw new AppError('User not found', 404);
    return user.toSafeObject();
  }
}

module.exports = new AuthService();
