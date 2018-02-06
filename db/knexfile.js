const config = {
    development: {
        client: 'mysql',
        connection: {
            host: 'localhost',
            user: 'reperio',
            password: 'reperio',
            database: 'reperio_triton_portal_dev',
            dateStrings: true,
            typeCast: (field, next) => {
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
            host: 'localhost',
            user: 'reperio',
            password: 'reperio',
            database: 'reperio_triton_portal_test' + '_' + (Math.floor(Math.random() * (10000 - 1 + 1) + 1)).toString(),
            timezone: 'UTC',
            dateStrings: true,
            typeCast: (field, next) => {
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

module.exports = config;