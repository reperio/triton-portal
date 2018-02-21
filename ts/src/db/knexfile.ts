const Config = require('../config').default;
const config: any = new Config();
const dbConfig = config.default.db;

const knexConfig = {
    development: {
        client: 'mysql',
        connection: {
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            dateStrings: true,
            typeCast: (field: any, next: any) => {
                //Convert 0 and 1 to true/false values
                if (field.type === 'TINY' && field.length === 1) {
                    let value = field.string();
                    return value ? (value === '1') : null;
                }
                return next();
            }
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: __dirname + '/migrations'
        },
        seeds: {
            directory: __dirname + '/seeds/dev'
        }
    },
    test: {
        client: 'mysql',
        connection: {
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database + '_' + (Math.floor(Math.random() * (10000 - 1 + 1) + 1)).toString(),
            timezone: 'UTC',
            dateStrings: true,
            typeCast: (field: any, next: any) => {
                //Convert 0 and 1 to true/false values
                if (field.type === 'TINY' && field.length === 1) {
                    let value = field.string();
                    return value ? (value === '1') : null;
                }
                return next();
            }
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: __dirname + '/migrations'
        },
        seeds: {
            directory: __dirname + '/seeds/test'
        }
    }
};

module.exports = knexConfig;