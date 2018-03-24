import * as Joi from 'joi';
import {Request, ReplyWithContinue, RouteConfiguration} from 'hapi';

import {Vmapi} from '../triton/vmapi';

const routes: RouteConfiguration[] =  [
    {
        method: 'GET',
        path: '/triton/vms',
        config: {
            description: 'Get all virtual machines from VmApi',
            tags: ['api', 'vmapi'],
            notes: ['Fetches and returns all virtual machines from Triton'],
            cors: true
        },
        //TODO request should use type 'Request' but fails on getNewVmApi()
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const virtualMachines = await vmapi.getAllVirtualMachines();
            return {status: 0, message: 'success', data: virtualMachines};
        }
    }, {
        method: 'GET',
        path: '/triton/vms/{uuid}',
        config: {
            description: 'Get all virtual machines from VmApi',
            tags: ['api', 'vmapi'],
            notes: ['Fetches and returns all virtual machines from Triton'],
            cors: true,
            validate: {
                params: {
                    uuid: Joi.string().guid().required()
                }
            }
        },
        //TODO request should use type 'Request' but fails on getNewVmApi()
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const virtualMachineUuid = request.params.uuid;
            const virtualMachine = await vmapi.getVirtualMachineByUuid(virtualMachineUuid);
            return {status: 0, message: 'success', data: virtualMachine};
        }
    }
];

export default routes;