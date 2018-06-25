import * as _ from 'lodash';
import * as Joi from 'joi';
import {Request, ReplyWithContinue, RouteConfiguration} from 'hapi';
import { UnitOfWork } from '../db';
import { Fwapi } from '../triton/fwapi';
import ErrorModel from '../models/errorModel';

const routes: RouteConfiguration[] =  [
    {
        method: 'GET',
        path: '/triton/firewall/{uuid}',
        config: {
            description: 'Get firewall rules from imgApi',
            tags: ['api', 'fwapi'],
            notes: ['Fetches and returns an image from Triton'],
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
            const fwapi: Fwapi = await request.app.getNewFwApi();

            const vm_uuid = request.params.uuid;
            try {
                const rules = await fwapi.getRulesByUuid(vm_uuid);
                const globalRules = await fwapi.getGlobalRules();

                return h.response({message: 'success', data: rules.concat(globalRules)}).code(200);
            }
            catch(err) {
                return h.response({message: err.message}).code(404);
            }
        }
    }, {
        method: 'POST',
        path: '/triton/firewall/{owner_uuid}',
        config: {
            description: 'Update a firewalls rules',
            tags: ['api', 'fwapi'],
            notes: ['Update a firewalls rules'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    owner_uuid: Joi.string().guid().required()
                },
                payload: {
                    firewallRules: Joi.array().items(
                        Joi.object({
                            enabled: Joi.boolean().required(),
                            rule: Joi.string().required(),
                            uuid: Joi.string().guid().required().allow(''),
                            owner_uuid: Joi.string().guid().required().allow('')
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
            const fwapi: Fwapi = await request.app.getNewFwApi();
            const uow: UnitOfWork = await request.app.getNewUoW();

            const owner_uuid = request.params.owner_uuid;
            const newRules = request.payload.firewallRules;

            try {    
                const currentRules = await fwapi.getRulesByUuid(owner_uuid);
            
                const currentRuleUuids = currentRules.map((currentRule: any) => currentRule.uuid);
                await Promise.all(newRules
                    .filter((newRule: any) =>  !currentRuleUuids.includes(newRule.uuid))
                    .map(async (newRule: any) => {
                        return await fwapi.createRule({
                            rule: newRule.rule,
                            enabled: newRule.enabled,
                            owner_uuid: newRule.owner_uuid
                        });
                    }));

                const newRuleUuids= newRules.map((newRule:any) => newRule.uuid);
                await Promise.all(currentRules.map(async (currentRule: any) => {
                    if (!newRuleUuids.includes(currentRule.uuid)) {
                        //delete
                        await fwapi.deleteRule(currentRule.uuid, currentRule.owner_uuid);
                    }
                    else {
                        const similarRule = newRules.find((newRule:any) => newRule.uuid === currentRule.uuid);
                        if (similarRule.rule !== currentRule.rule || similarRule.enabled !== currentRule.enabled) {
                            //update
                            await fwapi.updateRule({
                                uuid: similarRule.uuid,
                                enabled: similarRule.enabled,
                                rule: similarRule.rule,
                                owner_uuid: similarRule.owner_uuid
                            });
                        }
                    }
                }));

                return true;
            } catch (err) {
                return h.response({message: err.message}).code(400);
            }
        }
    }
];

export default routes;