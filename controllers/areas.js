const { Area } = require('../models/area');

exports.getAreas = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    Area.findAll()
    .then(areas => {
        res.render('areas/area-list', {
            areas: areas,
            pageTitle: 'Lista obszarów',
            path: '/area-list',
            isAuthenticated: req.session.isLoggedIn, 
            isAdmin: req.session.isAdmin
        });
    })
    .catch(err => {
        console.log(err);
        next(err);
    });
};
exports.getAddArea = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render('areas/add-area', {
        pageTitle: 'Dodaj obszar',
        path: '/add-area',
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin
    });
};  
exports.postAddArea = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    const descript = req.body.descript;
    if (!descript || descript.trim() === '') {
        return res.status(400).render('areas/add-area', {
            pageTitle: 'Dodaj obszar',
            path: '/add-area',
            errorMessage: 'Opis obszaru nie może być pusty.',
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    }
    const area = new Area({
        descript: descript
    });

    area.save()
    .then(result => {
        res.redirect('/area-list'); 
    })
    .catch(err => {
        console.log(err);
        next(err);
    });
};

exports.getEditArea = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    const areaId = req.params.areaId;
    Area.findByPk(areaId)
        .then(area => {
            if (!area) {
                return res.redirect('/area-list');
            }
            res.render('areas/edit-area', {
                pageTitle: 'Edytuj obszar',
                path: '/edit-area',
                area: area,
                isAuthenticated: req.session.isLoggedIn,
                isAdmin: req.session.isAdmin
            });
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};

exports.postEditArea = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    const areaId = req.body.areaId;
    const updatedDescript = req.body.descript;
    Area.findByPk(areaId)
        .then(area => {
            if (!area) {
                return res.redirect('/area-list');
            }
            area.descript = updatedDescript;
            return area.save();
        })
        .then(result => {
            res.redirect('/area-list');
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};

exports.postDeleteArea = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    const areaId = req.body.areaId;
    Area.findByPk(areaId)
        .then(area => {
            if (!area) {
                return res.redirect('/area-list');
            }
            return area.destroy();
        })
        .then(result => {
            res.redirect('/area-list');
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};
