import * as Knex from "knex";

exports.up = function (knex: Knex): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            await knex.schema.table('users', (t) => {
                t.string('ownerUuid')
                    .unique()
                    .nullable();
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
                t.dropColumns('ownerUuid')
            });
            resolve();
        } catch(err) {
            console.log(err);
            reject();
        }
    });
};