const { Operator } = require('../models/operator');
const { Area } = require('../models/area');

exports.getOperators = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const operators = await Operator.findAll({
            include: [{ model: Area, as: 'Area', attributes: ['descript'] }]
        });
        res.render('operators/operator-list', {
            operators: operators,
            pageTitle: 'Operatory',
            path: '/operator-list',
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.postAddOperator = async (req, res, next) => {
    const { login, password, area_id, is_admin } = req.body;
    try {
        await Operator.create({
            login: login,
            password: password,
            area_id: parseInt(area_id),
            is_admin: is_admin === 'true'
        });
        res.redirect('/operator-list');         
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.getAddOperator = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const areas = await Area.findAll();
        res.render('operators/add-operator', {
            pageTitle: 'Dodaj operatora',
            path: '/add-operator',
            areas: [{ area_id: 0, descript: 'Wszystkie obszary' }, ...areas],
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.getEditOperator = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const operatorId = req.params.id;
        const operator = await Operator.findByPk(operatorId);
        const areas = await Area.findAll();
        
        if (!operator) {
            return res.status(404).send('Operator nie znaleziony');
        }

        res.render('operators/edit-operator', {
            pageTitle: 'Edytuj operatora',
            path: '/edit-operator',
            operator: operator,
            areas: [{ area_id: 0, descript: 'Wszystkie obszary' }, ...areas],
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (err) {
        console.error('Błąd podczas pobierania operatora:', err);
        next(err);
    }
};

exports.postEditOperator = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    const operatorId = req.params.id;
    const { login, password, area_id, is_admin } = req.body;
    
    try {
        const operator = await Operator.findByPk(operatorId);
        if (!operator) {
            return res.status(404).send('Operator nie znaleziony');
        }

        operator.login = login;
        if (password) {
            operator.password = password;
        }
        operator.area_id = parseInt(area_id);
        operator.is_admin = is_admin === 'true';

        await operator.save();
        res.redirect('/operator-list');
    } catch (err) {
        console.error('Błąd podczas aktualizacji operatora:', err);
        next(err);
    }
};

exports.postDeleteOperator = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    const operatorId = req.body.operatorId;
    
    try {
        await Operator.destroy({
            where: { operator_id: operatorId }
        });
        res.redirect('/operator-list');
    } catch (err) {
        console.error('Błąd podczas usuwania operatora:', err);
        next(err);
    }
};
