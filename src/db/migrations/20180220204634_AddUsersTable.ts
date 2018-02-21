import * as Knex from "knex";

exports.up = function (knex: Knex): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            await knex.schema.createTable('users', (t) => {
                t.uuid('id')
                    .notNullable()
                    .primary();
                t.string('username')
                    .unique()
                    .notNullable();
                t.string('password')
                    .notNullable();
                t.string('firstName');
                t.string('lastName');
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
            await knex.schema.dropTable('users');
            
            resolve();
        } catch(err) {
            console.log(err);
            reject();
        }
    });
};
