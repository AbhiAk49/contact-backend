const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { AUTH_COOKIE, AUTH_COOKIE_REFRESH } = require('../config/constant');
const config = require('../config/config')

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.cookie(AUTH_COOKIE, tokens.access.token, {
    //domain: `.${config.domain}`,  //commented for public subdomain exceptions like netlify
    expires: tokens.access.expires,
    httpOnly: true,

    //need for chrome specific
    //secure: config === 'production',
    sameSite: config === 'production' ? 'None': 'Lax'
  });
  res.cookie(AUTH_COOKIE_REFRESH, tokens.refresh.token, {
    //domain: `.${config.domain}`,
    expires: tokens.refresh.expires,
    httpOnly: true,

    //secure: config === 'production',
    sameSite: config === 'production' ? 'None': 'Lax'
  });
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.cookie(AUTH_COOKIE, tokens.access.token, {
    //domain: `.${config.domain}`,
    expires: tokens.access.expires,
    httpOnly: true,

    //secure: config === 'production',
    sameSite: config === 'production' ? 'None': 'Lax'
  });
  res.cookie(AUTH_COOKIE_REFRESH, tokens.refresh.token, {
    //domain: `.${config.domain}`,
    expires: tokens.refresh.expires,
    httpOnly: true,

    //secure: config === 'production',
    sameSite: config === 'production' ? 'None': 'Lax'
  });

  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  const refreshToken = req?.cookies[AUTH_COOKIE_REFRESH] || req.body.refreshToken;
  await authService.logout(refreshToken);
  res.clearCookie(AUTH_COOKIE, {
    //domain: `.${config.domain}`,
    httpOnly: true,
    //secure: config === 'production',
    sameSite: config === 'production' ? 'None': 'Lax'
  });
  res.clearCookie(AUTH_COOKIE_REFRESH, {
    //domain: `.${config.domain}`,
    httpOnly: true,
    //secure: config === 'production',
    sameSite: config === 'production' ? 'None': 'Lax'
  });
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
