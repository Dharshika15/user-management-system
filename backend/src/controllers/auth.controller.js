const authService = require('../services/auth.service');
const { setRefreshTokenCookie, clearRefreshTokenCookie } = require('../utils/jwt');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await authService.login(email, password);

      setRefreshTokenCookie(res, refreshToken);

      res.json({
        success: true,
        message: 'Logged in successfully',
        data: { user, accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);

      setRefreshTokenCookie(res, refreshToken);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: { user, accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(refreshToken);

      setRefreshTokenCookie(res, newRefreshToken);

      res.json({
        success: true,
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.user._id);
      clearRefreshTokenCookie(res);

      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user._id);
      res.json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
