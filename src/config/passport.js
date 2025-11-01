const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { AUTH_COOKIE, AUTH_COOKIE_F } = require('./constant')
const { tokenTypes } = require('./tokens');
const { User } = require('../models');


const tokenExtractor = function (req) {
  let token = null;
  const bearerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (bearerToken) {
    token = bearerToken;
  } else if (req?.cookies) {
    token = req.cookies[AUTH_COOKIE] || req.cookies[AUTH_COOKIE_F];
  }
  return token;
};

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: tokenExtractor,
};


const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
