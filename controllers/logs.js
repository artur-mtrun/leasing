const { OperatorLog, Operator } = require('../models/associations');

exports.getLogs = async (req, res) => {
    try {
        const logs = await OperatorLog.findAll({
            include: [{
                model: Operator,
                as: 'Operator',
                attributes: ['login']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.render('logs/logs-list', {
            pageTitle: 'Logi operatorów',
            path: '/logs-list',
            logs: logs,
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Błąd serwera');
    }
}; 