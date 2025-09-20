const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    //legacy contact platform
    PLATFORM_DOMAIN: Joi.string()
      .default('localhost')
      .description('the domain of the website for which cookie needs to be set'),

    //legacy contacts
    OAUTH_G_CLIENT_ID: Joi.string().required().description('legacy: google oauth client id'),
    OAUTH_G_CLIENT_SECRET: Joi.string().required().description('legacy: google oauth client secret'),
    OAUTH_G_REDIRECT_URL: Joi.string().required().description('legacy: google oauth redirect url'),

    //fit client
    OAUTH_G_CLIENT_ID_F: Joi.string().required().description('fit: google oauth client id'),
    OAUTH_G_CLIENT_SECRET_F: Joi.string().required().description('fit: google oauth client secret'),
    OAUTH_G_REDIRECT_URL_F: Joi.string().required().description('fit: google oauth redirect url'),

    //fit platform
    PLATFORM_DOMAIN_F: Joi.string()
    .default('localhost')
    .description('the domain of the website for which cookie needs to be set'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  domain: envVars.PLATFORM_DOMAIN,
  domain_fit: envVars.PLATFORM_DOMAIN_F,
  oauth: {
    google: {
      clientId: envVars.OAUTH_G_CLIENT_ID,
      clientSecret: envVars.OAUTH_G_CLIENT_SECRET,
      redirectUrl: envVars.OAUTH_G_REDIRECT_URL,
    },
    fit: {
      clientId: envVars.OAUTH_G_CLIENT_ID_F,
      clientSecret: envVars.OAUTH_G_CLIENT_SECRET_F,
      redirectUrl: envVars.OAUTH_G_REDIRECT_URL_F,
    },
  },
};
