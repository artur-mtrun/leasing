const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

class OperatorLog extends Model {}

OperatorLog.init({
    log_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    operator_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    action_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entity_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'operator_log'
});

module.exports = { OperatorLog }; 