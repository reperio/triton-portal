import * as _ from 'lodash';
import * as Joi from 'joi';
import {Request, ReplyWithContinue, RouteConfiguration} from 'hapi';

import {Vmapi} from '../triton/vmapi';
import { UnitOfWork } from '../db';

import nic from '../models/nicModel';
import ErrorModel from '../models/errorModel';

const routes: RouteConfiguration[] =  [
    {
        method: 'GET',
        path: '/triton/vms',
        config: {
            description: 'Get all virtual machines from VmApi',
            tags: ['api', 'vmapi'],
            notes: ['Fetches and returns all virtual machines from Triton'],
            cors: true,
            auth: 'jwt',
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const virtualMachines = await vmapi.getAllVirtualMachines();
            return h.response({message: 'success', data: virtualMachines}).code(200);
        }
    }, {
        method: 'GET',
        path: '/triton/vms/{uuid}',
        config: {
            description: 'Get a virtual machine from VmApi',
            tags: ['api', 'vmapi'],
            notes: ['Fetches and returns a virtual machine from Triton'],
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
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const virtualMachineUuid = request.params.uuid;
            try {
                const virtualMachine = await vmapi.getVirtualMachineByUuid(virtualMachineUuid);
                return h.response({message: 'success', data: virtualMachine}).code(200);
            } catch (err) {
                return h.response({message: 'The virtual machine could not be found'}).code(404);
            }
        }
    }, {
        method: 'GET',
        path: '/triton/vms/owner/{owner_uuid}',
        config: {
            description: 'Get virtual machines from VmApi by owner_uuid',
            tags: ['api', 'vmapi'],
            notes: ['Fetches and returns virtual machines by owner_uuid from Triton'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    owner_uuid: Joi.string().guid().required()
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();
            const ownerUuid = request.params.owner_uuid;

            try {
                const virtualMachines = await vmapi.getVirtualMachinesByOwnerUuid(ownerUuid);
                return h.response({message: 'success', data: virtualMachines}).code(200);
            } catch (err) {
                return h.response({message: 'There was a problem getting your virtual machines.'}).code(400);
            }
        }
    }, {
        method: 'POST',
        path: '/triton/vms',
        config: {
            description: 'Create a new virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Creates a new virtual machine in Triton SDC'],
            cors: true,
            auth: 'jwt',
            validate: {
                payload: {
                    virtualMachine: {
                        owner_uuid: Joi.string().guid().required(),
                        alias: Joi.string().required(),
                        networks: Joi.array().items(Joi.object({
                            ipv4_uuid: Joi.string().guid(),
                            primary: Joi.boolean()
                        })
                        ).min(1).required(),
                        brand: Joi.string().required(),
                        billing_id: Joi.string().guid().required(),
                        image_uuid: Joi.string().guid().required(),
                        quota:  Joi.number().required()
                    }
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
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

            try {
                const result = await vmapi.createVirtualMachine(virtualMachine);
                return h.response({message: 'Success', data: result}).code(200);
            } catch (err) {
                if (err.message === 'The virtual machine name already exists.') {
                    return h.response({message: err.message}).code(409);
                }
                return h.response({message: err.message}).code(400);
            }
        }
    }, {
        method: 'PUT',
        path: '/triton/vms/{id}/start',
        config: {
            description: 'Start a virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Starts a virtual machine with the provided id'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                query: {
                    owner_id: Joi.string().guid().required()
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const owner_id = request.query.owner_id;
            const vmId = request.params.id;

            try {
                const result = await vmapi.startVirtualMachine(owner_id, vmId);
                return h.response({message: 'Success', data: result}).code(200);
            } catch (err) {
                if (err.message === "Cannot start a VM from a 'running' state") {
                    return h.response({message: "Cannot start a VM that's already running"}).code(400);
                }
            }
        }
    }, {
        method: 'PUT',
        path: '/triton/vms/{id}/stop',
        config: {
            description: 'Stop a virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Stops a virtual machine with the provided id'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                query: {
                    owner_id: Joi.string().guid().required()
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const owner_id = request.query.owner_id;
            const vmId = request.params.id;

            try {
                const result = await vmapi.stopVirtualMachine(owner_id, vmId);
                return h.response({message: 'Success', data: result}).code(200);
            } catch (err) {
                return h.response({message: err.message}).code(400);
            }
        }
    }, {
        method: 'PUT',
        path: '/triton/vms/{id}/reboot',
        config: {
            description: 'Reboot a virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Reboots a virtual machine with the provided id'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                query: {
                    owner_id: Joi.string().guid().required()
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();
            const owner_id = request.query.owner_id;
            const vmId = request.params.id;

            const result = await vmapi.rebootVirtualMachine(owner_id, vmId);
            return h.response({status: 0, message: 'success', data: result}).code(200);
        }
    }, {
        method: 'DELETE',
        path: '/triton/vms/{id}',
        config: {
            description: 'Delete a virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Deletes a virtual machine with the provided id'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                query: {
                    owner_id: Joi.string().guid().required()
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const owner_id = request.query.owner_id;
            const vmId = request.params.id;

            try {
                const result = await vmapi.deleteVirtualMachine(owner_id, vmId);
                return h.response({message: 'Success', data: true}).code(200);
            } catch (err) {
                return h.response({message: err.message}).code(400);
            }
        }
    }, {
        method: 'PUT',
        path: '/triton/vms/{id}/reprovision',
        config: {
            description: 'Reprovision a virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Reprovision a virtual machine'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                payload: {
                    virtualMachine: {
                        image_uuid: Joi.string().guid().required()
                    }
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const virtualMachine = request.payload.virtualMachine;
            const virtualMachineUuid = request.params.id;
            const image_uuid = virtualMachine.image_uuid;

            try {
                const result = await vmapi.reprovisionVirtualMachine(virtualMachineUuid, image_uuid);
                return h.response({message: 'Success', data: result}).code(200);
            } catch (err) {
                return h.response({message: err.message}).code(400);
            }
        }
    }, {
        method: 'PUT',
        path: '/triton/vms/{id}/rename',
        config: {
            description: 'Rename a virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Rename a virtual machine'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                payload: {
                    virtualMachine: {
                        alias: Joi.string().required()
                    }
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const virtualMachine = request.payload.virtualMachine;
            const virtualMachineUuid = request.params.id;
            const alias = virtualMachine.alias;

            try {
                const result = await vmapi.renameVirtualMachine(virtualMachineUuid, alias);
                return h.response({message: 'Success', data: result}).code(200);
            } catch (err) {
                return h.response({message: err.message}).code(400);
            }
        }
    }, {
        method: 'PUT',
        path: '/triton/vms/{id}/resize',
        config: {
            description: 'Resize a virtual machine',
            tags: ['api', 'vmapi'],
            notes: ['Resize a virtual machine'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                payload: {
                    virtualMachine: {
                        billing_id: Joi.string().guid().required()
                    }
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const virtualMachine = request.payload.virtualMachine;
            const virtualMachineUuid = request.params.id;
            const billing_id = virtualMachine.billing_id;

            try {
                const result = await vmapi.resizeVirtualMachine(virtualMachineUuid, billing_id);
                return h.response({message: 'Success', data: result}).code(200);
            } catch (err) {
                return h.response({message: err.message}).code(400);
            }
        }
    }, {
        method: 'POST',
        path: '/triton/vms/{id}/nics',
        config: {
            description: 'Update a vms NICs',
            tags: ['api', 'vmapi'],
            notes: ['Update a vms NICs'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    id: Joi.string().guid().required()
                },
                payload: {
                    nics: Joi.array().items(
                        Joi.object({
                            uuid: Joi.string().guid().required(),
                            primary: Joi.boolean().required(),
                            mac: Joi.string().allow('').optional()
                        })
                        .optional()
                    )
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const vmapi: Vmapi = await request.app.getNewVmApi();

            const nics = request.payload.nics;
            const virtualMachineUuid = request.params.id;
            const uow: UnitOfWork = await request.app.getNewUoW();

            const currentNics = (await vmapi.getVirtualMachineByUuid(virtualMachineUuid)).nics;

            let toAdd:any = [];
            let toDelete:string[] = [];
            let toUpdate:any = [];     
            
            nics.map((newNic: any) => {
                if (newNic.mac === "") {
                    //add
                    toAdd.push({uuid: newNic.uuid, primary: newNic.primary});
                }
             });

            const newNicMacs = nics.map((nic:any) => nic.mac);
            currentNics.map((currentNic: any) => {
                if (!newNicMacs.includes(currentNic.mac)) {
                    //delete
                    toDelete.push(currentNic.mac);
                }
                else {
                    const similarNic = nics.filter((nic:any) => nic.mac === currentNic.mac)[0];
                    if (similarNic.uuid !== currentNic.network_uuid) {
                        //update through deletion and addition
                        toDelete.push(currentNic.mac);
                        toAdd.push({uuid: similarNic.uuid, primary: similarNic.primary});
                    }
                    else if (similarNic.primary !== (currentNic.primary !== undefined ? currentNic.primary : false)) {
                        //update
                        toUpdate.push({mac: similarNic.mac, primary: similarNic.primary});
                    }
                }
            });

            try {
                if (toDelete.length > 0) {
                    await vmapi.deleteNics(virtualMachineUuid, toDelete);
                }
    
                if (toAdd.length > 0) {
                    await vmapi.addNicsToVirtualMachine(virtualMachineUuid, toAdd);
                }
    
                if (toUpdate.length > 0) {
                    await vmapi.updateNics(virtualMachineUuid, toUpdate);
                }
            } catch (err) {
                return h.response({message: err.message}).code(400);
            }

            return h.response({message: 'Success', data: true}).code(200);
        }
    }
];

export default routes;