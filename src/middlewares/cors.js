const cors = require('cors');
const config = require('../config/config');
// cors
const whitelist = [
  /manage-my-contact-service/,
  /manage-my-contacts/,
  /localhost/,
  /**
   * white listing domains here
   */
];

if (config.env === 'development') {
  whitelist.push(/localhost/); // for local
}
const allowedHeaders = ['content-type', 'authorization'];

function corsAllowedDomain(req, callback) {
  let reqOrigin = req.get('origin');
  let corsOptions = {
    origin: false,
    maxAge: 86400,
    allowedHeaders,
    credentials: true,
  };

  if (config.env === 'development') {
    corsOptions['credentials'] = true;
  }
  try {
    if (reqOrigin && reqOrigin.indexOf('http') == -1) {
      reqOrigin = `http://${reqOrigin}`;
    }
    reqOrigin = new URL(reqOrigin).hostname;
  } catch (err) {
    reqOrigin = '';
  }

  if (!reqOrigin || whitelist.map((r) => r.test(reqOrigin)).includes(true)) {
    corsOptions.origin = true;
  }
  callback(null, corsOptions);
}

module.exports = function (req, res, next) {
  if (req.header('X-Skip-Cors') !== 'true') {
    cors(corsAllowedDomain)(req, res, next);
  } else {
    next();
  }
};
