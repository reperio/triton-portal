import * as Joi from 'joi';
import {Request, ReplyWithContinue, RouteConfiguration} from 'hapi';
import * as bcrypt from 'bcryptjs';

import {UnitOfWork} from '../db';

const routes: RouteConfiguration[] =  [
    {
        method: 'POST',
        path: '/auth',
        config: {
            auth: false,
            description: 'Log user in',
            cors: true,
            validate: {
                payload: {
                    email: Joi.string().required(),
                    password: Joi.string().required()
                }
            },
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();

            const user = await uow.usersRepository.getUserByEmail(request.payload.email);

            if (user === null || !await bcrypt.compareSync(request.payload.password, user.password)) {
                return h.response('unauthorized').code(401);
            }

            request.app.currentUserId = user.id;
            return h.continue;
        }
    }
];

export default routes;