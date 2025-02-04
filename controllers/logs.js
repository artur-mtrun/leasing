const { OperatorLog, Operator } = require('../models/associations');
const { Sequelize } = require('sequelize');

exports.getLogs = async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        const searchTerm = req.query.search;

        const where = {};
        const includeWhere = {};

        if (searchTerm) {
            where[Sequelize.Op.or] = [
                { action_type: { [Sequelize.Op.iLike]: `%${searchTerm}%` } },
                { entity_type: { [Sequelize.Op.iLike]: `%${searchTerm}%` } },
                { details: { [Sequelize.Op.iLike]: `%${searchTerm}%` } },
                Sequelize.where(
                    Sequelize.col('Operator.login'),
                    { [Sequelize.Op.iLike]: `%${searchTerm}%` }
                )
            ];
        }

        const { count, rows } = await OperatorLog.findAndCountAll({
            where: where,
            include: [{
                model: Operator,
                as: 'Operator',
                attributes: ['login'],
                where: includeWhere,
                required: false
            }],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset
        });

        const totalPages = Math.ceil(count / limit);

        res.render('logs/logs-list', {
            pageTitle: 'Logi operatorów',
            path: '/logs-list',
            logs: rows,
            currentPage: page,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            searchTerm: searchTerm,
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Błąd serwera');
    }
}; 