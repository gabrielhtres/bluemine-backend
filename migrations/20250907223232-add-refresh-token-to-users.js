'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'currentHashedRefreshToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'currentHashedRefreshToken');
  },
};