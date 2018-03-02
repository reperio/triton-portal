import * as Joi from 'joi';
import {Request, ResponseToolkit, ServerRoute} from 'hapi';

import {VmApi} from '../triton/vmApi';

const routes: ServerRoute[] =  [
    {
        method: 'GET',
        path: '/triton/vms',
        config: {
            description: 'Get all virtual machines from VmApi',
            tags: ['api', 'VmApi'],
            notes: ['Fetches and returns all virtual machines from Triton'],
            cors: true
        },
        //TODO request should use type 'Request' but fails on getNewVmApi()
        handler: async(request: any, h: ResponseToolkit) => {
            const vmApi: VmApi = await request.app.getNewVmApi();

            const virtualMachines = await vmApi.getAllVirtualMachines();
            return {status: 0, message: 'success', data: virtualMachines};
        }
    }, {
        method: 'GET',
        path: '/triton/vms/{uuid}',
        config: {
            description: 'Get all virtual machines from VmApi',
            tags: ['api', 'VmApi'],
            notes: ['Fetches and returns all virtual machines from Triton'],
            cors: true,
            validate: {
                params: {
                    uuid: Joi.string().guid().required()
                }
            }
        },
        //TODO request should use type 'Request' but fails on getNewVmApi()
        handler: async(request: any, h: ResponseToolkit) => {
            const vmApi: VmApi = await request.app.getNewVmApi();

            const virtualMachineUuid = request.params.uuid;
            const virtualMachine = await vmApi.getVirtualMachineByUuid(virtualMachineUuid);
            return {status: 0, message: 'success', data: virtualMachine};
        }
    }
];

export default routes;