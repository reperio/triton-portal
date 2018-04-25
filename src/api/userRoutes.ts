import * as Joi from 'joi';
import {Request, ReplyWithContinue, RouteConfiguration} from 'hapi';
import * as bcrypt from 'bcryptjs';
import {UnitOfWork} from '../db';

const routes: RouteConfiguration[] =  [
    {
        method: 'GET',
        path: '/users',
        config: {
            description: 'Get all users',
            tags: ['api', 'users'],
            notes: ['Fetches and returns all users from the database'],
            cors: true
        },
        //TODO request should use type 'Request' but fails on getNewUoW()
        handler: async(request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const users = await uow.usersRepository.getAllUsers();
            return {status: 0, message: 'success', data: users};
        }
    }, {
        method: 'GET',
        path: '/users/{id}',
        config: {
            description: 'Get user by id',
            tags: ['api', 'users'],
            notes: ['Fetches a user by the given id'],
            cors: true,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                }
            }
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const userId = request.params.id;
            const sshKeys = await uow.sshKeyRepository.getAllSshKeysByUserId(userId);
            let user = await uow.usersRepository.getUserById(userId)
            uow._logger.info(JSON.stringify(user));
            user.password = null;
            return {status: 0, message: 'success', data: user};
        }
    }, {
        method: 'POST',
        path: '/users',
        config: {
            description: 'Create user',
            tags: ['api', 'users'],
            notes: ['Creates a user from the object sent in the body of the request'],
            cors: true,
            validate: {
                payload: {
                    user: {
                        username: Joi.string().required(),
                        password: Joi.string().required(),
                        firstName: Joi.string().required(),
                        lastName: Joi.string().required(),
                        email: Joi.string().required(),
                        ownerUuid: Joi.string().guid().required()
                    }
                }   
            }
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const user = request.payload.user;
            const result = await uow.usersRepository.createUser(user);
            return {status: 0, message: 'success', data: result};
        }
    }, {
        method: 'PUT',
        path: '/users/{id}',
        config: {
            description: 'Update user',
            tags: ['api', 'users'],
            notes: ['Update the user with the given id with new values'],
            cors: true,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                payload: {
                    user: {
                        email: Joi.string().required(),
                        currentPassword: Joi.string().required(),
                        username: Joi.string().required(),
                        newPassword: Joi.string().optional(),
                        firstName: Joi.string().required(),
                        lastName: Joi.string().required(),
                        ownerUuid: Joi.string().guid().required(),
                        sshKeys: Joi.array().items(
                            Joi.object(
                                {
                                    key: Joi.string(),
                                    description: Joi.string()
                                }
                            ).optional())
                    }
                }   
            }
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const userId = request.params.id;
            const newUser = request.payload.user;
            const user = await uow.usersRepository.getUserById(userId);

            if (newUser.newPassword !== undefined) {
                if (user === null || !await bcrypt.compareSync(newUser.currentPassword, user.password)) {
                    return h.response('unauthorized').code(401);
                }
                await uow.usersRepository.changePassword(userId, newUser.newPassword);
            }

            await uow.sshKeyRepository.deleteSshKeysByUserId(userId);
            await uow.sshKeyRepository.createSshKeys(userId, newUser.sshKeys);

            const updatedUser = await uow.usersRepository.updateUser(userId, newUser);

            return {status: 0, message: 'success', data: updatedUser};
        }
    }, {
        method: 'PUT',
        path: '/users/{id}/password',
        config: {
            description: 'Update user\'s password',
            tags: ['api', 'users'],
            notes: ['Updates the use\'r with the new value'],
            cors: true,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                payload: {
                    user: {
                        password: Joi.string().required()
                    }
                }   
            }
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const userId = request.params.id;
            const password = request.payload.user.password;
            const result = await uow.usersRepository.changePassword(userId, password);
            return {status: 0, message: 'success', data: result};
        }
    }, {
        method: 'DELETE',
        path: '/users/{id}',
        config: {
            description: 'Delete user',
            tags: ['api', 'users'],
            notes: ['Deletes user with the specified id'],
            cors: true,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                }
            }
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const userId = request.params.id;
            const result = await uow.usersRepository.deleteUserById(userId);
            return {status: 0, message: 'success', data: result};
        }
    }
];

export default routes;