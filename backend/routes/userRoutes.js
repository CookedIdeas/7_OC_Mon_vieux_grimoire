const express = require('express');
const router = express.Router();

const userControllers = require('../controllers/userControllers');
const inputsValidators = require('../security/inputsValidators');
const limitAttempts = require('../security/reqRateLimiter');

router.post(
  '/signup',
  limitAttempts.signupAttemptsLimiter,
  inputsValidators.loginValidator,
  userControllers.signup
);
router.post(
  '/login',
  limitAttempts.loginAttemptsLimiterSlowBruteForce,
  limitAttempts.loginAttemptsLimiter,

  inputsValidators.loginValidator,
  userControllers.login
);

module.exports = router;
