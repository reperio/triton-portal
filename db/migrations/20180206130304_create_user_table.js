
exports.up = async function(knex, Promise) {
    await knex.transaction(async (tx) => {
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
            }).transacting(tx);
    
            await tx.commit();
        } catch(err) {
            console.log(err);
            await tx.rollback();
        }
    });
};

exports.down = async function(knex, Promise) {
    await knex.transaction(async (tx) => {
        try {
            await knex.schema.dropTable('users').transacting(tx);
    
            await tx.commit();
        } catch(err) {
            console.log(err);
            await tx.rollback();
        }
    });
};
