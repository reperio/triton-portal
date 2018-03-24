import * as bcrypt from 'bcryptjs';

import { UnitOfWork } from '../index';
import { User } from '../models/user';

export class UsersRepository {
    private uow: UnitOfWork;

    constructor(uow: UnitOfWork) {
        this.uow = uow;
    }

    async getAllUsers() {
        this.uow._logger.info('Fetching all users');

        const q = User.query(this.uow._transaction);

        const users = await q;
        return users;
    }

    async getUserById(id: string) {
        this.uow._logger.info(`Fetching user with id: ${id}`);

        const q = User.query(this.uow._transaction)
            .where('id', id);

        const users = await q;
        if (users.length > 1) {
            throw new Error('Too many results');
        }
        else if (users.length == 1) {
            return users[0];
        }
        return null;
    }

    async getUserByUsername(username: string) {
        this.uow._logger.info(`Fetching user with username: ${username}`);

        const q = User.query(this.uow._transaction)
            .where('username', username);

        const users = await q;
        if (users.length > 1) {
            throw new Error('Too many results');
        }
        else if (users.length == 1) {
            return users[0];
        }
        return null;
    }

    async getUserByEmail(email: string) {
        this.uow._logger.info(`Fetching user with email: ${email}`);

        const q = User.query(this.uow._transaction)
            .where('email', email);

        const users = await q;
        if (users.length > 1) {
            throw new Error('Too many results');
        }
        else if (users.length == 1) {
            return users[0];
        }
        return null;
    }

    //TODO create type for user
    async createUser(user: any) {
        this.uow._logger.info(`Creating new user: ${JSON.stringify(user)}`);

        try {
            const userModel = User.fromJson({
                username: user.username,
                password: await bcrypt.hash(user.password, 12),
                firstName: user.firstName,
                lastName: user.lastName,
				email: user.email
            });

            const q = User.query(this.uow._transaction)
                .insertAndFetch(userModel);

            const newUser = await q;
            return newUser;
        } catch (err) {
            this.uow._logger.error(err);
            throw err;
        }
    }

    //TODO create type for user
    async updateUser(userId: string, user: any) {
        this.uow._logger.info(`Updating user with id: ${userId}`);

        try {
            const userModel = User.fromJson({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
				email: user.email
            });

            const q = User.query(this.uow._transaction)
                .where('id', userId)
                .updateAndFetchById(userId, userModel);

            const updatedUser = await q;
            return updatedUser;
        } catch (err) {
            this.uow._logger.error(err);
            throw err;
        }
    }

    async changePassword(userId: string, newPassword: string) {
        this.uow._logger.info(`Updating password for user: ${userId}`);

        try {
            const userModel = User.fromJson({
                password: await bcrypt.hash(newPassword, 12)
            });

            const q = User.query(this.uow._transaction)
                .where('id', userId)
                .updateAndFetchById(userId, userModel);

            const updatedUser = await q;
            return updatedUser;
        } catch (err) {
            this.uow._logger.error(err);
            throw err;
        }
    }

    async deleteUserById(userId: string) {
        this.uow._logger.info(`Deleting user with id: ${userId}`);

        try {
            const q = User.query(this.uow._transaction)
                .where('id', userId)
                .delete();

            await q;
            return true;
        } catch (err) {
            this.uow._logger.error(err);
            throw err;
        }
    }
}