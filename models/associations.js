const { Company } = require('./company');
const { Employee } = require('./employee');
const { Worksheet } = require('./worksheet');
const { Account } = require('./account');
const { Card } = require('./card');
const { Area } = require('./area');
const { Operator } = require('./operator');
const { Machine } = require('./machine');
const { AllEvent } = require('./allEvent');
const { OperatorLog } = require('./operatorLog');
const { Event } = require('./event');

// Istniejące asocjacje
Employee.belongsTo(Company, { foreignKey: 'company_id', as: 'Company' });
Company.hasMany(Employee, { foreignKey: 'company_id', as: 'Employees' });

// Dodaj tę asocjację
Employee.belongsTo(Area, { foreignKey: 'area_id', as: 'Area' });
Area.hasMany(Employee, { foreignKey: 'area_id', as: 'Employees' });

// Nowe asocjacje dla Worksheet
Company.hasMany(Worksheet, { foreignKey: 'company_id', as: 'Worksheets' });
Worksheet.belongsTo(Company, { foreignKey: 'company_id', as: 'Company' });

Worksheet.belongsTo(Account, { foreignKey: 'account_id', as: 'Account' });
Account.hasMany(Worksheet, { foreignKey: 'account_id', as: 'Worksheets' });

// Powiązanie między Employee a Worksheet
Employee.hasMany(Worksheet, { foreignKey: 'enrollnumber', sourceKey: 'enrollnumber' });
Worksheet.belongsTo(Employee, { foreignKey: 'enrollnumber', targetKey: 'enrollnumber' });


Card.belongsTo(Employee, { 
  foreignKey: 'cardnumber', 
  targetKey: 'cardnumber', 
  as: 'Employee',
  constraints: false 
});
Employee.hasOne(Card, { 
  foreignKey: 'cardnumber', 
  sourceKey: 'cardnumber', 
  as: 'Card',
  constraints: false 
});


Card.belongsTo(Area, { foreignKey: 'area_id', as: 'Area' });
Area.hasMany(Card, { foreignKey: 'area_id', as: 'Cards' });


Operator.belongsTo(Area, { foreignKey: 'area_id', as: 'Area' });
Area.hasMany(Operator, { foreignKey: 'area_id', as: 'Operators' });

// Dodaj tę asocjację
Machine.belongsTo(Area, { foreignKey: 'area_id', as: 'Area' });
Area.hasMany(Machine, { foreignKey: 'area_id', as: 'Machines' });

// Dodaj asocjację między AllEvent a Employee
AllEvent.belongsTo(Employee, { 
    foreignKey: 'enrollnumber', 
    targetKey: 'enrollnumber',
    as: 'Employee'
});
Employee.hasMany(AllEvent, { 
    foreignKey: 'enrollnumber', 
    sourceKey: 'enrollnumber',
    as: 'AllEvents'
});

// Dodaj asocjacje dla logów
OperatorLog.belongsTo(Operator, { foreignKey: 'operator_id', as: 'Operator' });
Operator.hasMany(OperatorLog, { foreignKey: 'operator_id', as: 'Logs' });

// Relacja Worksheet - Account
Worksheet.belongsTo(Account, {
    foreignKey: 'account_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Account.hasMany(Worksheet, {
    foreignKey: 'account_id'
});

module.exports = { Company, Employee, Worksheet, Account, Card, Area, Operator, Machine, AllEvent, OperatorLog, Event };
