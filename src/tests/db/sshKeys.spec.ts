import * as Knex from 'knex';

import * as UoW from '../shared/db';

const knexConfig = require('../../db/knexfile').test;
const knex = Knex(knexConfig);
const connection = knex.client.connectionSettings;



describe('Ssh Key Tests', () => {
    // initialize uow
    const uow = UoW.default;

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

    it('Can create ssh key', async () => {
        const users = await uow.usersRepository.getAllUsers();
        const sshKey = {
            key: 'test',
            userId: users[0].id,
            description: 'test key'
        };
        const result = await uow.sshKeyRepository.createSshKey(sshKey);
        expect(result.key).toBe('test');
    });

    it ('Can fetch ssh keys by userId', async () => {
        const users = await uow.usersRepository.getAllUsers();
        const sshKeys = await uow.sshKeyRepository.getAllSshKeysByUserId(users[0].id);
        expect(sshKeys.length).toBe(1);
    });

    it('Can delete ssh key', async () => {
        const users = await uow.usersRepository.getAllUsers();
        const keys = await uow.sshKeyRepository.getAllSshKeysByUserId(users[0].id);
        const result = await uow.sshKeyRepository.deleteSshKeyById(keys[0].id);
        expect(result).toBe(true);
    });

    it ('Can delete all ssh keys for a user', async () => {
        const users = await uow.usersRepository.getAllUsers();
        await uow.sshKeyRepository.createSshKey({
            key: 'test',
            userId: users[0].id,
            description: 'test key'
        });
        await uow.sshKeyRepository.createSshKey({
            key: 'test2',
            userId: users[0].id,
            description: 'test key 2'
        });
        await uow.sshKeyRepository.createSshKey({
            key: 'test3',
            userId: users[0].id,
            description: 'test key 3'
        });

        const result = await uow.sshKeyRepository.deleteSshKeysByUserId(users[0].id);
        expect(result).toBe(true);
    });
});