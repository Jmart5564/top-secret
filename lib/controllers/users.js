const { Router } = require('express');
// const authenticate = require('../middleware/authenticate');
// const authorize = require('../middleware/authorize');
// const User = require('../models/User');
const UserService = require('../services/UserService');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
  .post('/', async (req, res, next) => {
    try {
      const user = await UserService.create(req.body);
      res.json(user);
    }
    catch (e) {
      next(e);
    }
  })
  .post('/sessions', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const token = await UserService.signIn(({ email, password }));
      res
        .cookie(process.env.COOKIE_NAME, token, {
          httpOnly: true,
          maxAge: ONE_DAY_IN_MS,
        })
        .json({ message: 'Signed in successfully!' });
    }
    catch (e) {
      next(e);
    }
  })
  .delete('/sessions', (req, res) => {
    res.clearCookie(process.env.COOKIE_NAME, {
      httpOnly: true,
      maxAge: ONE_DAY_IN_MS,
    })
      .status(204)
      .send();
  });
