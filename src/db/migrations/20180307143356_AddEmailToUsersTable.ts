import * as Knex from "knex";

exports.up = function (knex: Knex): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            await knex.schema.table('users', (t) => {
                t.string('email')
                    .unique()
                    .notNullable();
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
            await knex.schema.table('users', (t) => {
                t.dropColumns('email')
            });
            resolve();
        } catch(err) {
            console.log(err);
            reject();
        }
    });
};
