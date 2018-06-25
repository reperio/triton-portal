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
            cors: true,
            auth: 'jwt',
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const users = await uow.usersRepository.getAllUsers();
            return users;
        }
    }, {
        method: 'GET',
        path: '/users/{id}',
        config: {
            description: 'Get user by id',
            tags: ['api', 'users'],
            notes: ['Fetches a user by the given id'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const userId = request.params.id;
            let user = await uow.usersRepository.getUserById(userId)
            user.password = null;
            return user;
        }
    }, {
        method: 'POST',
        path: '/users',
        config: {
            description: 'Create user',
            tags: ['api', 'users'],
            notes: ['Creates a user from the object sent in the body of the request'],
            cors: true,
            auth: false,
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

            const existingEmail = await uow.usersRepository.getUserByEmail(user.email);
            if (existingEmail !== undefined) {
                return h.response({message: 'This email is already in use.', data: null}).code(409);
            }

            const existingUsername = await uow.usersRepository.getUserByUsername(user.username);
            if (existingUsername !== undefined) {
                return h.response({message: 'This username is already in use.', data: null}).code(409);
            }

            const existingOwnerUuid = await uow.usersRepository.getUserByOwnerUuid(user.ownerUuid);
            if (existingOwnerUuid !== undefined) {
                return h.response({message: 'This owner uuid is already in use.', data: null}).code(409);
            }
            
            const result = await uow.usersRepository.createUser(user);
            return result;
        }
    }, {
        method: 'PUT',
        path: '/users/{id}',
        config: {
            description: 'Update user',
            tags: ['api', 'users'],
            notes: ['Update the user with the given id with new values'],
            cors: true,
            auth: 'jwt',
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
                        sshKeys: Joi.array().items(
                            Joi.object(
                                {
                                    key: Joi.string(),
                                    description: Joi.string()
                                }
                            ).optional())
                    }
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const userId = request.params.id;
            const newUser = request.payload.user;
            const user = await uow.usersRepository.getUserById(userId);

            if (user === null || !await bcrypt.compareSync(newUser.currentPassword, user.password)) {
                return h.response({message: 'Invalid password', data: null}).code(401);
            }

            const newEmail = await uow.usersRepository.getUserByEmail(user.email);
            if (newEmail !== undefined && newEmail.email !== user.email) {
                return h.response({message: 'This email is already in use.', data: null}).code(409);
            }

            const newUsername = await uow.usersRepository.getUserByUsername(user.username);
            if (newUsername !== undefined && newUsername.email !== user.email) {
                return h.response({message: 'This username is already in use.', data: null}).code(409);
            }

            if (newUser.newPassword !== undefined) {
                await uow.usersRepository.changePassword(userId, newUser.newPassword);
            }

            await uow.sshKeyRepository.deleteSshKeysByUserId(userId);
            await uow.sshKeyRepository.createSshKeys(userId, newUser.sshKeys);

            const updatedUser = await uow.usersRepository.updateUser(userId, newUser);

            return updatedUser;
        }
    }, 
    // {
    //     method: 'PUT',
    //     path: '/users/{id}/password',
    //     config: {
    //         description: 'Update user\'s password',
    //         tags: ['api', 'users'],
    //         notes: ['Updates the use\'r with the new value'],
    //         cors: true,
    //         auth: 'jwt',
    //         validate: {
    //             params: {
    //                 id: Joi.string().guid().required()
    //             },
    //             payload: {
    //                 user: {
    //                     password: Joi.string().required()
    //                 }
    //             },
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required()
    //            }).unknown()
    //         }
    //     },
    //     handler: async (request: Request, h: ReplyWithContinue) => {
    //         const uow: UnitOfWork = await request.app.getNewUoW();

    //         const userId = request.params.id;
    //         const password = request.payload.user.password;
    //         const result = await uow.usersRepository.changePassword(userId, password);
    //         return {status: 0, message: 'success', data: result};
    //     }
    // }, 
    {
        method: 'DELETE',
        path: '/users/{id}',
        config: {
            description: 'Delete user',
            tags: ['api', 'users'],
            notes: ['Deletes user with the specified id'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const userId = request.params.id;
            const result = await uow.usersRepository.deleteUserById(userId);
            return result;
        }
    }
];

export default routes;