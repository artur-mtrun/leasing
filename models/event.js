const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Event = sequelize.define('event', {
 
    event_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
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
    is_del: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

module.exports = {Event};