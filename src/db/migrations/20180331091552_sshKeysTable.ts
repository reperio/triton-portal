import * as Knex from "knex";

exports.up = function (knex: Knex): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            await knex.schema.createTable('sshKeys', t => {
                t.uuid('id')
                    .notNullable()
                    .primary();
                t.text('key', 'longtext')
                    .notNullable();
                t.uuid('userId')
                    .notNullable()
                    .references('id')
                    .inTable('users')
                    .onDelete('restrict');
                t.string('description');
                t.dateTime('createdAt');
                t.dateTime('updatedAt');
            });
            
            resolve();
        } catch(err) {
            console.log(err);
            reject();
        }
    });
};

exports.down = function (knex: Knex): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            await knex.schema.dropTable('sshKeys');
            
            resolve();
        } catch(err) {
            console.log(err);
            reject();
        }
    });
};