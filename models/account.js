//area_id , descript
const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

class Account extends Model {}

Account.init({
    account_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,    
        allowNull: false,
        primaryKey: true
    },
    account_number:{
        type: DataTypes.STRING,
        allowNull: false
    },
    account_descript: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {    
    sequelize, // Przekazanie instancji Sequelize   
    modelName: 'account'
});

module.exports = {Account};