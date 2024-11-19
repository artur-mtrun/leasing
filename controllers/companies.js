const { Company } = require('../models/company');

exports.getCompanies = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const companies = await Company.findAll();
        res.render('companies/company-list', {
            companies: companies,
            pageTitle: 'Firmy',
            path: '/company-list',
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (err) {
        console.error('Błąd podczas pobierania firm:', err);
        next(err);
    }
};

exports.getAddCompany = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render('companies/add-company', {
        pageTitle: 'Dodaj firmę',
        path: '/add-company',
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin
    });
};

exports.postAddCompany = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const company = await Company.create({
            company_descript: req.body.company_descript
        });
        res.redirect('/company-list');
    } catch (err) {
        console.error('Błąd podczas dodawania firmy:', err);
        next(err);
    }
};

exports.postRemoveCompany = async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const companyId = req.body.companyId;
        await Company.destroy({
            where: {
                company_id: companyId
            }
        });
        res.redirect('/company-list');
    } catch (error) {
        console.error('Błąd podczas usuwania firmy:', error);
        res.status(500).send('Wystąpił błąd podczas usuwania firmy');
    }
};

exports.getEditCompany = async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const companyId = req.params.id;
        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).send('Firma nie znaleziona');
        }
        res.render('companies/edit-company', { 
            company: company,
            pageTitle: 'Edytuj firmę',
            path: '/edit-company/' + companyId,
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (error) {
        console.error('Błąd podczas pobierania firmy do edycji:', error);
        res.status(500).send('Wystąpił błąd podczas pobierania firmy do edycji');
    }
};

exports.postEditCompany = async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const companyId = req.params.id;
        const updatedCompany = {
            company_descript: req.body.company_descript
        };
        await Company.update(updatedCompany, {
            where: { company_id: companyId }
        });
        res.redirect('/company-list');
    } catch (error) {
        console.error('Błąd podczas aktualizacji firmy:', error);
        res.status(500).send('Wystąpił błąd podczas aktualizacji firmy');
    }
};

