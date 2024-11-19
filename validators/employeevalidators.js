const { body } = require('express-validator');
const { Card } = require('../models/card');
const { Employee } = require('../models/employee');
const { Company } = require('../models/company');

const addEmployeeValidators = [
    body('cardnumber').custom(async (value, { req }) => {
        console.log(req.body.area_id, value);
        const card = await Card.findOne({
            where: {
                cardnumber: value, 
                area_id: req.body.area_id
            }
        });
        if (!card) {
            console.log('Nr karty nie ma w systemie');
            throw new Error('Karty nie ma w systemie');
        }
        console.log('Nr karty jest w systemie', card.cardnumber);

        const employee = await Employee.findOne({
            where: {
                cardnumber: value, 
            }
        });
        console.log('pracownik', employee);
        console.log('karta', value);
        if (employee) {
            console.log('Karta jest już przypisana do pracownika');
            throw new Error('Karta jest już przypisana do pracownika', employee.nick);
        }
        else {
            console.log('Karta jest wolna');
            return true;
        }
    }),
    body('company_id')
        .optional() // Dodaj tę linię
        .notEmpty().withMessage('Proszę wybrać firmę')
        .isInt().withMessage('Nieprawidłowe ID firmy')
        .custom(async (value) => {
            const company = await Company.findByPk(value);
            if (!company) {
                throw new Error('Wybrana firma nie istnieje');
            }
            return true;
        }),
    // Tutaj możesz dodać więcej walidatorów, jeśli są potrzebne
];

const assignCardValidators = [
    body('cardnumber').custom(async (value, { req }) => {
        // Tutaj możesz dodać walidację specyficzną dla przypisywania karty
        // Na przykład, sprawdzenie czy karta istnieje i nie jest przypisana do innego pracownika
    }),
];

module.exports = {
    addEmployeeValidators,
    assignCardValidators
};
