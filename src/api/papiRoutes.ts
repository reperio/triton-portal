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
            cors: true
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const papi: Papi = await request.app.getNewPapi();

            const packages = await papi.getAllPackages();
            return {status: 0, message: 'success', data: packages};
        }
    }
];

export default routes;