const bcrypt = require('bcryptjs');

class UsersRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async getAllUsers() {
        this.uow._logger.info('Fetching all users');

        const q = this.uow._models.User
            .query(this.uow._transaction);

        const users = await q;
        return users;
    }

    async getUserById(id) {
        this.uow._logger.info(`Fetching user with id: ${id}`);

        const q = this.uow._models.User
            .query(this.uow._transaction)
            .findById(id);

        const users = await q;
        if (users.length > 1) {
            throw new Error('Too many results');
        }
        return users[0];
    }

    async getUserByUsername(username) {
        this.uow._logger.info(`Fetching user with username: ${username}`);

        const q = this.uow._models.User
            .query(this.uow._transaction)
            .where('username', username);
        
        const users = await q;
        if (users.length > 1) {
            throw new Error('Too many results');
        }
        return users[0];
    }

    async createUser(user) {
        this.uow._logger.info(`Creating new user: ${JSON.stringify(user)}`);

        try {
            const userModel = this.uow._models.User.fromJson({
                username: user.username,
                password: await bcrypt.hash(user.password, 12),
                firstName: user.firstName,
                lastName: user.lastName
            });

            const q = this.uow._models.User
                .query(this.uow._transaction)
                .insert(userModel)
                .returning('*');

            const newUser = await q;
            return newUser;
        } catch (err) {
            this.uow._logger.error('Failed to create user');
            this.uow._logger.error(err);
            throw err;
        }
    }

    async updateUser(userId, user) {
        this.uow._logger.info(`Updating user with id: ${userId}`);
        try {
            const userModel = this.uow._models.User.fromJson({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            });

            const q = this.uow._models.User
                .query(this.uow._transaction)
                .where('id', userId)
                .patch(userModel)
                .returning('*');

            const updatedUser = await q;
            return updatedUser;
        } catch (err) {
            this.uow._logger.error('Failed to update user');
            this.uow._logger.error(err);
            throw err;
        }
    }

    async changePassword(userId, newPassword) {
        this.uow._logger.info(`Updating password for user: ${userId}`);
        try {
            const userModel = this.uow._models.User.fromJson({
                password: await bcrypt.hash(newPassword, 12)
            });

            const q = this.uow._models.User
                .query(this.uow._transaction)
                .where('id', userId)
                .patch(userModel)
                .returning('*');
            
            const updatedUser = await q;
            return updatedUser;
        } catch (err) {
            this.uow._logger.error('Failed to update password for user');
            this.uow._logger.error(err);
            throw err;
        }
    }

    async deleteUserById(userId) {
        this.uow._logger.info(`Deleting user with id: ${userId}`);
        try {
            const q = this.uow._models.User
                .query(this.uow._transaction)
                .where('id', userId)
                .delete();

            await q;
            return true;
        } catch (err) {
            this.uow._logger.error('Failed to delete user');
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = UsersRepository;