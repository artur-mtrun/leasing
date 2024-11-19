//machine_id, machinenumber, descript , area_id, ip, port 
const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

class Machine extends Model {}

Machine.init({
    machine_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    machinenumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    descript: {
        type: DataTypes.STRING,
        allowNull: false
    },
    area_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ip: {
        type: DataTypes.STRING,
        allowNull: false
    },
    port: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize, // Przekazanie instancji Sequelize   
    modelName: 'machine'
});

module.exports = {Machine};