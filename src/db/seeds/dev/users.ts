import * as bcrypt from 'bcryptjs';
import * as Knex from "knex";
import {v4} from 'uuid';

exports.seed = function (knex: Knex): Promise<any> {
    return new Promise ((resolve) => {
        knex('users').del().then(() => {
            knex('users').insert([
                {
                    id: v4(), 
                    username: 'admin',
                    password: bcrypt.hashSync('password', 12),
                    firstName: 'admin',
                    lastName: 'user',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ]).then(() => { resolve();});
        });
    });
};
