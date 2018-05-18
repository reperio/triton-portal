import * as Joi from 'joi';
import {Request, ReplyWithContinue, RouteConfiguration} from 'hapi';
import {Napi} from '../triton/napi';
import {UnitOfWork} from '../db';

const routes: RouteConfiguration[] =  [
    {
        method: 'GET',
        path: '/triton/fabrics/{owner_uuid}/vlans/{vlan_id}/networks',
        config: {
            description: 'Get all fabric networks from napi for specified owner uuid and vlan id',
            tags: ['api', 'napi'],
            notes: ['Fetches and returns all fabric networks from Triton for specified owner uuid and vlan id'],
            cors: true,
            validate: {
                params: {
                    owner_uuid: Joi.string().guid().required(),
                    vlan_id: Joi.number().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const napi: Napi = await request.app.getNewNapi();

            const owner_uuid = request.params.owner_uuid;
            const vlan_id = parseInt(request.params.vlan_id);
            const networks = await napi.getFabricNetworks(owner_uuid, vlan_id);
            return {status: 0, message: 'success', data: networks};
        }
    },{
        method: 'GET',
        path: '/triton/fabrics/{owner_uuid}/vlans',
        config: {
            description: 'Get all fabric vlans from napi for specified owner uuid',
            tags: ['api', 'napi'],
            notes: ['Fetches and returns all fabric vlans from Triton for specified owner uuid'],
            cors: true,
            validate: {
                params: {
                    owner_uuid: Joi.string().guid().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const napi: Napi = await request.app.getNewNapi();
            const uow: UnitOfWork = await request.app.getNewUoW();

            const owner_uuid = request.params.owner_uuid;
            const networks = await napi.getFabricVlans(owner_uuid);
            const storedVlanIds = (await uow.vlanIdsRepository.getAllByOwnerUuid(owner_uuid)).map((network:any) => network.vlanId);
            const existingVlanIds: any[] = networks.map((network:any) => network.vlan_id);

            existingVlanIds.forEach((vlanId:number) => {
                if (!storedVlanIds.includes(vlanId)) {
                    uow.vlanIdsRepository.createVlanId(owner_uuid, vlanId);
                }
            });

            return {status: 0, message: 'success', data: networks};
        }
    },{
        method: 'POST',
        path: '/triton/fabrics/{owner_uuid}/vlans/{vlan_id}/networks',
        config: {
            description: 'Create a fabric network',
            tags: ['api', 'napi'],
            notes: ['Creates a fabric network'],
            cors: true,
            validate: {
                params: {
                    owner_uuid: Joi.string().guid().required(),
                    vlan_id: Joi.number().required()
                },
                payload: {
                    fabricNetwork: {
                        name: Joi.string().required(),
                        subnet: Joi.string().required(),
                        provision_start_ip: Joi.string().required(),
                        provision_end_ip: Joi.string().required(),
                        gateway: Joi.string().optional(),
                        resolvers: Joi.array().items(Joi.string()).optional(),
                        description: Joi.string().optional()
                    }
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const napi: Napi = await request.app.getNewNapi();

            Joi.array().items(Joi.object({
                key: Joi.string().required()
            })).required().min(0)

            const owner_uuid = request.params.owner_uuid;
            const vlan_id = parseInt(request.params.vlan_id);

            const networks = await napi.createFabricNetwork(request.payload.fabricNetwork, vlan_id, owner_uuid);
            return {status: 0, message: 'success', data: networks};
        }
    },{
        method: 'POST',
        path: '/triton/fabrics/{owner_uuid}/vlans',
        config: {
            description: 'Create a fabric vlan',
            tags: ['api', 'napi'],
            notes: ['Creates a fabric vlan'],
            cors: true,
            validate: {
                params: {
                    owner_uuid: Joi.string().guid().required()
                },
                payload: {
                    fabricVLan: {
                        name: Joi.string().required(),
                        description: Joi.string().optional()
                    }
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const napi: Napi = await request.app.getNewNapi();
            const uow: UnitOfWork = await request.app.getNewUoW();
            const owner_uuid = request.params.owner_uuid;

            const currentVlanIds = (await uow.vlanIdsRepository.getAllByOwnerUuid(owner_uuid)).map(x => x.vlanId).sort();
            let newVlanId = 2;
            while (currentVlanIds.includes(newVlanId)) {
                newVlanId++;
            }

            await uow.vlanIdsRepository.createVlanId(owner_uuid, newVlanId);
            
            const fabricVLan = await napi.createFabricVlan(request.payload.fabricVLan.name, newVlanId, owner_uuid);
            return {status: 0, message: 'success', data: fabricVLan};
        }
    },{
        method: 'DELETE',
        path: '/triton/fabrics/{owner_uuid}/vlans/{vlan_id}',
        config: {
            description: 'Delete a fabric vlan',
            tags: ['api', 'napi'],
            notes: ['Deletes a fabric vlan'],
            cors: true,
            validate: {
                params: {
                    owner_uuid: Joi.string().guid().required(),
                    vlan_id: Joi.number().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const napi: Napi = await request.app.getNewNapi();
            const uow: UnitOfWork = await request.app.getNewUoW();
            const owner_uuid = request.params.owner_uuid;
            const vlan_id = parseInt(request.params.vlan_id);

            await uow.vlanIdsRepository.deleteVlanId(owner_uuid, vlan_id);

            const result = await napi.deleteFabricVlan(owner_uuid, vlan_id);
            
            return {status: 0, message: 'success', data: result};
        }
    },{
        method: 'DELETE',
        path: '/triton/fabrics/{owner_uuid}/vlans/{vlan_id}/networks/{network_uuid}',
        config: {
            description: 'Delete a fabric network',
            tags: ['api', 'napi'],
            notes: ['Deletes a fabric network'],
            cors: true,
            validate: {
                params: {
                    owner_uuid: Joi.string().guid().required(),
                    vlan_id: Joi.number().required(),
                    network_uuid: Joi.string().guid().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const napi: Napi = await request.app.getNewNapi();
            const owner_uuid = request.params.owner_uuid;
            const vlan_id = parseInt(request.params.vlan_id);
            const network_uuid = request.params.network_uuid;

            try {
                const result = await napi.deleteFabricNetwork(owner_uuid, vlan_id, network_uuid);
                return h.response({message: 'Success', data: result}).code(200);

            } catch (err) {
                if (err.message === "network must have no NICs provisioned") {
                    return h.response({message: 'This network is being used and cannot be deleted.', data: null}).code(400);
                }
            }
        }
    }
];

export default routes;