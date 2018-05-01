import * as _ from 'lodash';
import * as Joi from 'joi';
import {Request, ReplyWithContinue, RouteConfiguration} from 'hapi';

import {Vmapi} from '../triton/vmapi';
import { UnitOfWork } from '../db';

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
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const virtualMachineUuid = request.params.uuid;
            const virtualMachine = await vmapi.getVirtualMachineByUuid(virtualMachineUuid);
            return {status: 0, message: 'success', data: virtualMachine};
        }
    }, {
        method: 'GET',
        path: '/triton/vms/owner/{owner_uuid}',
        config: {
            description: 'Get virtual machines from VmApi by owner_uuid',
            tags: ['api', 'vmapi'],
            notes: ['Fetches and returns virtual machines by owner_uuid from Triton'],
            cors: true,
            validate: {
                params: {
                    owner_uuid: Joi.string().guid().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const ownerUuid = request.params.owner_uuid;
            const virtualMachines = await vmapi.getVirtualMachinesByOwnerUuid(ownerUuid);
            return {status: 0, message: 'success', data: virtualMachines};
        }
    }, {
        method: 'POST',
        path: '/triton/vms',
        config: {
            description: 'Create a new virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Creates a new virtual machine in Triton SDC'],
            cors: true,
            validate: {
                payload: {
                    virtualMachine: {
                        owner_uuid: Joi.string().guid().required(),
                        alias: Joi.string().required(),
                        networks: Joi.array().items(Joi.string().guid()),
                        brand: Joi.string().required(),
                        billing_id: Joi.string().guid().required(),
                        image_uuid: Joi.string().guid()
                    }
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const uow: UnitOfWork = await request.app.getNewUoW();
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const virtualMachine = request.payload.virtualMachine;

            // add ssh keys to virtual machine
            const user = await uow.usersRepository.getUserByOwnerUuid(virtualMachine.owner_uuid);
            const userSshKeys = await uow.sshKeyRepository.getAllSshKeysByUserId(user.id);
            const keys = _.map(userSshKeys, 'key');
            virtualMachine.customer_metadata = {
                root_authorized_keys: keys.join('\n')
            };

            const result = await vmapi.createVirtualMachine(virtualMachine);
            return {status: 0, message: 'success', data: result};
        }
    }, {
        method: 'PUT',
        path: '/triton/vms/{id}/start',
        config: {
            description: 'Start a virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Starts a virtual machine with the provided id'],
            cors: true,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                query: {
                    owner_id: Joi.string().guid().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const owner_id = request.query.owner_id;
            const vmId = request.params.id;


            const result = await vmapi.startVirtualMachine(owner_id, vmId);
            return {status: 0, message: 'success', data: result};
        }
    }, {
        method: 'PUT',
        path: '/triton/vms/{id}/stop',
        config: {
            description: 'Stop a virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Stops a virtual machine with the provided id'],
            cors: true,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                query: {
                    owner_id: Joi.string().guid().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const owner_id = request.query.owner_id;
            const vmId = request.params.id;


            const result = await vmapi.stopVirtualMachine(owner_id, vmId);
            return {status: 0, message: 'success', data: result};
        }
    }, {
        method: 'PUT',
        path: '/triton/vms/{id}/reboot',
        config: {
            description: 'Reboot a virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Reboots a virtual machine with the provided id'],
            cors: true,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                query: {
                    owner_id: Joi.string().guid().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const owner_id = request.query.owner_id;
            const vmId = request.params.id;


            const result = await vmapi.rebootVirtualMachine(owner_id, vmId);
            return {status: 0, message: 'success', data: result};
        }
    }, {
        method: 'PUT',
        path: '/triton/vms/{id}/addNetwork',
        config: {
            description: 'Add a virtual machine to a network',
            tags: ['api', 'vmapi'],
            notes: ['Adds a virtual machine with the provided id to the network with the provided network id'],
            cors: true,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                query: {
                    owner_id: Joi.string().guid().required(),
                    network_id: Joi.string().guid().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const owner_id = request.query.owner_id;
            const network_id = request.query.network_id;
            const vmId = request.params.id;


            const result = await vmapi.addVirtualMachineToNetwork(owner_id, vmId, network_id);
            return {status: 0, message: 'success', data: result};
        }
    }, {
        method: 'PUT',
        path: '/triton/vms/{id}/removeNetwork',
        config: {
            description: 'Remove a virtual machine from a network',
            tags: ['api', 'vmapi'],
            notes: ['Removes a virtual machine with the provided id from the network with the provided network id'],
            cors: true,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                query: {
                    owner_id: Joi.string().guid().required(),
                    network_id: Joi.string().guid().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const owner_id = request.query.owner_id;
            const network_id = request.query.network_id;
            const vmId = request.params.id;


            const result = await vmapi.removeNicFromVirtualMachine(owner_id, vmId, network_id);
            return {status: 0, message: 'success', data: result};
        }
    }, {
        method: 'DELETE',
        path: '/triton/vms/{id}',
        config: {
            description: 'Delete a virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Deletes a virtual machine with the provided id'],
            cors: true,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                query: {
                    owner_id: Joi.string().guid().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const owner_id = request.query.owner_id;
            const vmId = request.params.id;

            const result = await vmapi.deleteVirtualMachine(owner_id, vmId);
            return {status: 0, message: 'success', data: result};
        }
    }, {
        method: 'PUT',
        path: '/triton/vms/{id}/update',
        config: {
            description: 'Update a virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Update a virtual machine'],
            cors: true,
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                query: {
                    billing_id: Joi.string().guid().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const billing_id = request.query.billing_id;
            const vmId = request.params.id;

            const result = await vmapi.updateVirtualMachine(billing_id, vmId);
            return {status: 0, message: 'success', data: result};
        }
    }
];

export default routes;