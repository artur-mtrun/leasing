const { AllEvent } = require('../models/allEvent');
const { Employee } = require('../models/employee');
const { Op } = require('sequelize');

exports.getAllEventsPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 100;
        const offset = (page - 1) * limit;

        let whereClause = {};
        
        if (req.query.date) {
            whereClause.event_date = {
                [Op.eq]: new Date(req.query.date)
            };
        }
        
        if (req.query.enrollnumber) {
            whereClause.enrollnumber = req.query.enrollnumber;
        }
        
        if (req.query.indb !== undefined) {
            whereClause.indb = req.query.indb;
        }

        const { count, rows: events } = await AllEvent.findAndCountAll({
            where: whereClause,
            include: [{
                model: Employee,
                as: 'Employee',
                attributes: ['nick', 'enrollnumber']
            }],
            order: [
                ['event_date', 'DESC'],
                ['event_time', 'DESC']
            ],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.render('events/all-events', {
            events,
            currentPage: page,
            totalPages,
            date: req.query.date || '',
            enrollnumber: req.query.enrollnumber || '',
            indb: req.query.indb || '',
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin,
            pageTitle: 'Wszystkie wydarzenia',
            path: '/all-events'
        });
    } catch (error) {
        console.error('Błąd podczas pobierania wydarzeń:', error);
        res.redirect('/');
    }
}; 