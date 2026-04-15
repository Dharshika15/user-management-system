const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
  createUserValidator,
  updateUserValidator,
  updateProfileValidator,
  getUsersQueryValidator,
} = require('../validators/user.validator');
const { validate } = require('../middleware/validate.middleware');
const { ROLES } = require('../config/roles');

// All routes require authentication
router.use(protect);

// Profile routes (any authenticated user)
router.get('/profile', userController.getStats); // reused below — defined as /me instead
router.patch('/me', updateProfileValidator, validate, userController.updateProfile);

// Admin/Manager routes
router.get(
  '/',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  getUsersQueryValidator,
  validate,
  userController.getAllUsers
);

router.get(
  '/stats',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  userController.getStats
);

router.post(
  '/',
  restrictTo(ROLES.ADMIN),
  createUserValidator,
  validate,
  userController.createUser
);

router.get('/:id', userController.getUserById);

router.patch(
  '/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  updateUserValidator,
  validate,
  userController.updateUser
);

router.delete(
  '/:id',
  restrictTo(ROLES.ADMIN),
  userController.deleteUser
);

module.exports = router;
