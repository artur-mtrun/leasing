//area_id , descript
const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

class Company extends Model {}

Company.init({
    company_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,    
        allowNull: false,
        primaryKey: true
    },
    company_descript: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {    
    sequelize,
    modelName: 'company'
});

module.exports = { Company };
