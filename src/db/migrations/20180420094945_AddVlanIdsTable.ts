import * as Knex from "knex";

exports.up = function (knex: Knex): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            await knex.schema.createTable('vlanIds', t => {
                t.uuid('id')
                    .notNullable()
                    .primary();
                t.uuid('ownerUuid')
                    .notNullable()
                    .references('ownerUuid')
                    .inTable('users')
                    .onDelete('restrict');
                t.integer('vlanId')
                .notNullable();
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
            await knex.schema.dropTable('vlanIds');
            
            resolve();
        } catch(err) {
            console.log(err);
            reject();
        }
    });
};