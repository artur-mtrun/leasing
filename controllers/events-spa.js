exports.getEventsSPA = (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render('events/events-spa', {
        pageTitle: 'Events SPA',
        path: '/events-spa',
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin
    });
};