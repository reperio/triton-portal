import * as Knex from 'knex';

import * as UoW from '../shared/db';

const knexConfig = require('../../db/knexfile').test;
const knex = Knex(knexConfig);
const connection = knex.client.connectionSettings;



describe('User Tests', () => {
    // initialize uow
    const uow = UoW.default;

    // set timeout to 15 seconds
    // this.setTimeout(15000);

    // create test database 
    beforeAll(async () => {
        return new Promise (async resolve => {           
            const conn = {
                host: connection.host,
                user: connection.user,
                password: connection.password
            };

            const knex_tmp = require('knex')({ client: 'mysql', connection: conn});
            await knex_tmp.raw(`CREATE DATABASE ${connection.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;`);
            await knex_tmp.destroy();
            await knex.migrate.latest(knexConfig);
            await knex.seed.run(knexConfig);
            resolve();
        });
    });

    // destroy test database
    afterAll(async () => {
        return new Promise(async resolve => {
            const conn = {
                host: connection.host,
                user: connection.user,
                password: connection.password
            };
    
            const knex_tmp = require('knex')({ client: 'mysql', connection: conn});
            await knex.destroy();
            await knex_tmp.raw(`DROP DATABASE ${connection.database};`);
            await knex_tmp.destroy();
            resolve();
        });
    });

    it('Should return seeded user', async () => {
        const users = await uow.usersRepository.getAllUsers();
        expect(users.length).toBe(1);
    });

    it('Can insert user', async () => {
        const user = {
            username: 'test',
            password: 'test',
            firstName: 'Test',
            lastName: 'User',
            email: 'example@test.com'
        };
        const newUser = await uow.usersRepository.createUser(user);
        expect(newUser.username).toBe(user.username);
    });

    it('Should return two users', async () => {
        const users = await uow.usersRepository.getAllUsers();
        expect(users.length).toBe(2);
    });

    it('Can get user by username', async () => {
        const user = await uow.usersRepository.getUserByUsername('test');
        expect(user).not.toBe(null);
    });

    it('Can get user by id', async () => {
        const user = await uow.usersRepository.getUserByUsername('test');
        const result = await uow.usersRepository.getUserById(user.id);
        expect(result.username).toBe('test');
    });

    it('Can update user', async () => {
        const user = await uow.usersRepository.getUserByUsername('test');
        user.firstName = 'FIRSTNAME';
        user.lastName = 'LASTNAME';
        const updatedUser = await uow.usersRepository.updateUser(user.id, user);
        expect(updatedUser.firstName).toBe('FIRSTNAME');
    }); 

    it('Can update password', async () => {
        const user = await uow.usersRepository.getUserByUsername('test');
        const result = await uow.usersRepository.changePassword(user.id, 'NewPassword');
        expect(result.password).not.toBe(user.password);
    });

    it('Can delete user', async () => {
        const user = await uow.usersRepository.getUserByUsername('test');
        const result = await uow.usersRepository.deleteUserById(user.id);
        expect(result).toBe(true);
    });
});