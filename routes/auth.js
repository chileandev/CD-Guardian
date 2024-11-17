const express = require('express');
const passport = require('passport');
const router = express.Router();

// Login con Discord
router.get('/login', passport.authenticate('discord'));

// Callback de Discord
router.get(
  '/callback',
  passport.authenticate('discord', {
    failureRedirect: '/',
  }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

module.exports = router;
