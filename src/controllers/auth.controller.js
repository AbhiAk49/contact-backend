const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { AUTH_COOKIE, AUTH_COOKIE_REFRESH } = require('../config/constant');
const config = require('../config/config');
const logger = require('../config/logger');
const { generateGoogleUserToken } = require('../services/token.service');

/**
 * The function creates options for setting a cookie in JavaScript, including the expiration date,
 * HTTP-only flag, secure flag, and same-site attribute.
 * @param token - The `token` parameter is an object that contains information about the token,
 * including its expiration date.
 * @returns The function `createSetCookiOptions` returns an object with the following properties:
 */
const createSetCookiOptions = (token) => {
  return {
    //domain: `.${config.domain}`,  //commented for public subdomain exceptions like netlify
    expires: token.expires,
    httpOnly: true,

    //need for chrome specific
    secure: config.env === 'production',
    //sameSite: config.env === 'production' ? 'none' : 'lax',
    sameSite: 'lax'
  };
};

/**
 * The function creates options for clearing cookies in a JavaScript application.
 * @returns An object with the properties `httpOnly`, `secure`, and `sameSite`.
 */
const createClearCookiOptions = () => {
  return {
    //domain: `.${config.domain}`,
    httpOnly: true,
    secure: config.env === 'production',
    //sameSite: config.env === 'production' ? 'none' : 'lax',
    sameSite: 'lax'
  };
};

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.cookie(AUTH_COOKIE, tokens.access.token, createSetCookiOptions(tokens.access.token));
  res.cookie(AUTH_COOKIE_REFRESH, tokens.refresh.token, createSetCookiOptions(tokens.refresh.token));
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.cookie(AUTH_COOKIE, tokens.access.token, createSetCookiOptions(tokens.access.token));
  res.cookie(AUTH_COOKIE_REFRESH, tokens.refresh.token, createSetCookiOptions(tokens.refresh.token));
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  const refreshToken = req?.cookies[AUTH_COOKIE_REFRESH] || req.body.refreshToken;
  await authService.logout(refreshToken);
  res.clearCookie(AUTH_COOKIE, createClearCookiOptions());
  res.clearCookie(AUTH_COOKIE_REFRESH, createClearCookiOptions());
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

const verifyGoogleOauth = catchAsync(async (req, res) => {
  const code = req.query.code;
  if (!code) throw new ApiError(httpStatus.BAD_REQUEST, 'Code Missing!');
  try {
    const { id_token, access_token } = await authService.getGoogleOauth(code);
    const tokens = await generateGoogleUserToken(id_token, access_token);
    res.cookie(AUTH_COOKIE, tokens.access.token, createSetCookiOptions(tokens.access.token));
    res.cookie(AUTH_COOKIE_REFRESH, tokens.refresh.token, createSetCookiOptions(tokens.refresh.token));
    res.redirect(`${config.domain}`);
  } catch (error) {
    logger.error('Failed to authorize google user!');
    res.redirect(`${config.domain}oauth/error`);
  }
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
  verifyGoogleOauth,
};
