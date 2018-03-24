import * as Joi from 'joi';
import {Request, ReplyWithContinue, RouteConfiguration} from 'hapi';

import {Napi} from '../triton/napi';

const routes: RouteConfiguration[] =  [
    {
        method: 'GET',
        path: '/triton/networks/{owner_uuid}',
        config: {
            description: 'Get all networks from napi for specified owner uuid',
            tags: ['api', 'napi'],
            notes: ['Fetches and returns all networks from Triton for specified owner uuid'],
            cors: true,
            validate: {
                params: {
                    owner_uuid: Joi.string().guid().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const napi: Napi = await request.app.getNewNapi();

            const networkOwnerUuid = request.params.owner_uuid;
            const networks = await napi.getAllNetworks(networkOwnerUuid);
            return {status: 0, message: 'success', data: networks};
        }
    }
];

export default routes;