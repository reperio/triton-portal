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
                    updatedAt: new Date(),
                    email: 'test@test.com',
                    ownerUuid: '6dc1861a-3087-477e-94e3-9a8475d95f65'
                }
            ]).then(() => { resolve();});
        });
    });
};
