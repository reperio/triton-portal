import {BaseModel} from './baseModel';

export class User extends BaseModel {
    static get tableName() {
        return 'users';
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                id: {type: 'string'},
                username: {type: 'string'},
                password: {type: 'string'},
                firstName: {type: 'string'},
                lastName: {type: 'string'},
                createdAt: {type: 'string'},
                updatedAt: {type: 'string'}
            }
        };
    }
}