const uuid = require('uuid').v4;
const bcrypt = require('bcryptjs');
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {
          id: uuid(), 
          username: 'admin',
          password: bcrypt.hashSync('password', 12),
          firstName: 'admin',
          lastName: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    });
};
