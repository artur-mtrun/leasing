//area_id , descript
const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

class Area extends Model {}

Area.init({
    area_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,    
        allowNull: false,
        primaryKey: true
    },
    descript: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {    
    sequelize, // Przekazanie instancji Sequelize   
    modelName: 'area'
});

module.exports = {Area};