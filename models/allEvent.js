const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const AllEvent = sequelize.define('all_event', {
    event_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    machinenumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    enrollnumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    in_out: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    event_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    event_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    indb: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    }
}, {
    tableName: 'all_events'
});

module.exports = { AllEvent }; 