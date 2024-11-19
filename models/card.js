const Employee = require('./employee');
const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
class Card extends Model {}

Card.init({
    card_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    cardnumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    area_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize, // Przekazanie instancji Sequelize
    modelName: 'card'
});



module.exports = {Card};