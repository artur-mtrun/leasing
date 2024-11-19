'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('employees', 'cardnumber', {
      type: Sequelize.INTEGER,
      allowNull: true,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('employees', 'cardnumber', {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true
    });
  }
}; 