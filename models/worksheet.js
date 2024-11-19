const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const { Account } = require('./account');
const { Company } = require('./company');

const Worksheet = sequelize.define('worksheet', {
    worksheet_id: {
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
    event_date: {   
        type: DataTypes.DATE,
        allowNull: false
    },
    in_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    out_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    work_time: {
        type: DataTypes.INTEGER,  // Przechowujemy czas w minutach
        allowNull: true
    },
    account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Account,
            key: 'account_id'
        }
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Company,
            key: 'company_id'
        }
    }
});

Worksheet.belongsTo(Account, { foreignKey: 'account_id' });
Worksheet.belongsTo(Company, { foreignKey: 'company_id' });

module.exports = { Worksheet };
