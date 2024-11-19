const express = require('express');
const router = express.Router();

router.get('/events-spa', (req, res) => {
  res.render('events/events-spa', {
    pageTitle: 'Events SPA',
    path: '/events-spa',
    isAuthenticated: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin
  });
});

router.get('/worksheets-spa', (req, res) => {
  res.render('events/worksheets-spa', {
    pageTitle: 'Worksheets SPA',
    path: '/worksheets-spa',
    isAuthenticated: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin
  });
});

router.get('/events-count', (req, res) => {
  res.render('events/events-count', {
    pageTitle: 'Events Count',
    path: '/events-count',
    isAdmin: req.session.isAdmin, // lub jakkolwiek sprawdzasz uprawnienia admina
    isAuthenticated: req.session.isLoggedIn
  });
});

router.get('/worksheet-report', (req, res) => {
  res.render('events/worksheet-report', {
    pageTitle: 'Raport arkusza roboczego',
    path: '/worksheet-report',
    isAuthenticated: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin
  });
});

module.exports = router;
