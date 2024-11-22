'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Najpierw usuwamy istniejący klucz obcy
      await queryInterface.removeConstraint('all_events', 'all_events_enrollnumber_fkey');

      // Dodajemy nowy klucz obcy z CASCADE
      await queryInterface.addConstraint('all_events', {
        fields: ['enrollnumber'],
        type: 'foreign key',
        name: 'all_events_enrollnumber_fkey',
        references: {
          table: 'employees',
          field: 'enrollnumber'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    } catch (error) {
      console.error('Migration Error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // W przypadku cofnięcia migracji, przywracamy oryginalny klucz obcy bez CASCADE
      await queryInterface.removeConstraint('all_events', 'all_events_enrollnumber_fkey');
      
      await queryInterface.addConstraint('all_events', {
        fields: ['enrollnumber'],
        type: 'foreign key',
        name: 'all_events_enrollnumber_fkey',
        references: {
          table: 'employees',
          field: 'enrollnumber'
        }
      });
    } catch (error) {
      console.error('Migration Error:', error);
      throw error;
    }
  }
};