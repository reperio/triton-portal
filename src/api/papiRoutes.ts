import * as Joi from 'joi';
import {Request, ReplyWithContinue, RouteConfiguration} from 'hapi';

import {Papi} from '../triton/papi';

const routes: RouteConfiguration[] =  [
    {
        method: 'GET',
        path: '/triton/packages',
        config: {
            description: 'Get all packages from papi',
            tags: ['api', 'papi'],
            notes: ['Fetches and returns all packages from Triton'],
            cors: true,
            auth: 'jwt',
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const papi: Papi = await request.app.getNewPapi();

            try {
                const packages = await papi.getAllPackages();
                return h.response({message: 'success', data: packages}).code(200);
            }
            catch(err) {
                if (err.message === "The chosen package could not be found.") {
                    return h.response({message: err.message}).code(404);
                }
            }

        }
    },
    {
        method: 'GET',
        path: '/triton/packages/{uuid}',
        config: {
            description: 'Get individual package from papi',
            tags: ['api', 'papi'],
            notes: ['Fetches and returns a package from Triton'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    uuid: Joi.string().guid().required()
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const papi: Papi = await request.app.getNewPapi();
            const uuid = request.params.uuid;

            try {
                const _package = await papi.getPackageByUuid(uuid);
                return h.response({message: 'success', data: _package}).code(200);
            }
            catch(err) {
                if (err.message === "The chosen package could not be found.") {
                    return h.response({message: err.message}).code(404);
                }
            }
        }
    }
];

export default routes;