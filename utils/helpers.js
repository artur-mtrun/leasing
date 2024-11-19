const { Employee } = require('../models/employee');
const { validationResult } = require('express-validator');

// Funkcja pomocnicza do sprawdzania autoryzacji
exports.checkAuth = (req, res) => {
    if (!req.session.isLoggedIn) {
        res.redirect('/login');
        return false;
    }
    return true;
};

// Funkcja pomocnicza do obsługi błędów walidacji
exports.handleValidationErrors = (req, errors) => {
    if (!errors.isEmpty()) {
        console.log('Błędy walidacji:');
        console.log(errors.array());
        req.session.flashError = errors.array()[0].msg;
        return true; // Zwracamy true, jeśli są błędy
    }
    return false; // Zwracamy false, jeśli nie ma błędów
};

// Funkcja pomocnicza do renderowania widoku z obsługą błędów
exports.renderViewWithError = (res, viewName, data) => {
    const flashError = data.req.session.flashError;
    delete data.req.session.flashError;
    res.render(viewName, {
        ...data,
        errorMessage: flashError || null,
        session: data.req.session
    });
};

// Funkcja pomocnicza do pobierania ostatniego numeru pracownika
exports.getLastEmployeeNumber = async () => {
    const lastEmployee = await Employee.findOne({
        order: [['enrollnumber', 'DESC']],
    });
    return lastEmployee && lastEmployee.enrollnumber 
        ? lastEmployee.enrollnumber + 1 
        : 20001;
};
