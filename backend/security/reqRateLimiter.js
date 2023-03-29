const rateLimit = require('express-rate-limit');

exports.loginAttemptsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  statusCode: 430,
  message:
    'Too many accounts created from this IP, please try again after 10 minutes',
});

exports.loginAttemptsLimiterSlowBruteForce = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message:
    'Too many accounts created from this IP, please try again after 1 day',
});

exports.signupAttemptsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});
