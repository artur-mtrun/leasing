const { OperatorLog } = require('../models/associations');

exports.logAction = async (operatorId, actionType, entityType, entityId, details) => {
    try {
        console.log('Próba zapisania logu:', {
            operator_id: operatorId,
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
            details: details
        });

        if (!operatorId) {
            console.error('Brak operator_id w sesji!');
            return;
        }

        const log = await OperatorLog.create({
            operator_id: operatorId,
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
            details: details
        });

        console.log('Log zapisany pomyślnie:', log.toJSON());
    } catch (error) {
        console.error('Błąd podczas logowania akcji:', error);
    }
}; 