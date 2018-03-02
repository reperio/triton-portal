import * as Knex from 'knex';
import {Model} from 'objection';
import {LoggerInstance} from 'winston';

import {UsersRepository} from './repositories/usersRepository';

const KnexConfig = require('./knexfile');

export class UnitOfWork {
    private _knex: Knex;
    public _logger: LoggerInstance;
    public _transaction: Knex.Transaction;

    private _usersRepository: UsersRepository;

    constructor(logger: LoggerInstance) {
        this._logger = logger;
        const env = process.env.NODE_ENV || 'development';

        const dbConfig: any = KnexConfig;
        this._knex = Knex(dbConfig[env]);
        Model.knex(this._knex);

        // automatic debug logging for queries
        this._knex.on('query', (query: any) => this._logger.debug(query.sql));
    }

    // transaction helpers
    async beginTransaction() {
        if (this._transaction !== null) {
            throw new Error('Cannot begin transaction, a transaction already exists for this unit of work');
        }
        
        await new Promise(resolve => {
            this._knex.transaction(trx => {
                this._transaction = trx;
                resolve();
            });
        });
    }

    async commitTransaction() {
        if (this._transaction === null) {
            throw new Error('Cannot commit transaction, a transaction does not exist for this unit of work');
        }
        await this._transaction.commit();
        this._transaction = null;
    }

    async rollbackTransaction() {
        if (this._transaction === null) {
            throw new Error('Cannot rollback transaction, a transaction does not exist for this unit of work');
        }
        await this._transaction.rollback();
        this._transaction = null;
    }

    get inTransaction() {
        return this._transaction !== null;
    }

    // repositories
    get usersRepository(): UsersRepository {
        return this._usersRepository = this._usersRepository || new UsersRepository(this);
    }
}