const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

class Operator extends Model {
}

Operator.init({
    operator_id: {
        type: DataTypes.INTEGER,    
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    area_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'operator'
});

Operator.prototype.comparePassword = function(candidatePassword) {
    return this.password === candidatePassword; 
};

module.exports = { Operator };
