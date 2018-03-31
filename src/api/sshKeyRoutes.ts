import * as Joi from 'joi';
import {Request, ReplyWithContinue, RouteConfiguration} from 'hapi';

import { UnitOfWork } from '../db';

const routes: RouteConfiguration[] =  [
    {
        method: 'GET',
        path: '/users/{userId}/sshKeys',
        config: {
            description: 'Get all ssh keys by user id',
            tags: ['api', 'ssh keys'],
            notes: ['Fetches a list of ssh keys tied to the provided user id'],
            cors: true,
            validate: {
                params: {
                    userId: Joi.string().guid().required()
                }
            }
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const sshKeys = await uow.sshKeyRepository.getAllSshKeysByUserId(request.params.userId);
            return {status: 0, message: 'success', data: sshKeys};
        }
    }, {
        method: 'POST',
        path: '/users/{userId}/sshKeys',
        config: {
            description: 'Creates a new ssh key',
            tags: ['api', 'ssh keys'],
            notes: ['Inserts a new ssh key into the database'],
            cors: true,
            validate: {
                params: {
                    userId: Joi.string().guid().required()
                },
                payload: {
                    sshKey: {
                        key: Joi.string().required(),
                        description: Joi.string().required()
                    }
                }
            }
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const key = request.payload.sshKey;
            key.userId = request.params.userId;

            const sshKey = await uow.sshKeyRepository.createSshKey(key);
            return {status: 0, message: 'success', data: sshKey};
        }
    }, {
        method: 'DELETE',
        path: '/users/{userId}/sshKeys',
        config: {
            description: 'Deletes all ssh keys for a user',
            tags: ['api', 'ssh keys'],
            notes: ['Deletes all of the ssh keys tied to the provided userId'],
            cors: true,
            validate: {
                params: {
                    userId: Joi.string().guid().required()
                }
            }
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const result = await uow.sshKeyRepository.deleteSshKeysByUserId(request.params.userId);
            return {status: 0, message: 'success', data: result};
        }
    }, {
        method: 'DELETE',
        path: '/users/{userId}/sshKeys/{id}',
        config: {
            description: 'Deletes specific ssh key',
            tags: ['api', 'ssh keys'],
            notes: ['Deletes the ssh key with the provided id'],
            cors: true,
            validate: {
                params: {
                    userId: Joi.string().guid().required(),
                    id: Joi.string().guid().required()
                }
            }
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const result = await uow.sshKeyRepository.deleteSshKeyById(request.params.id);
            return {status: 0, message: 'success', data: result};
        }
    }
];

export default routes;