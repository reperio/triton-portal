import {Request, ReplyWithContinue} from 'hapi';

import * as API from './api';
const Config = require('./config');
import {Server} from 'hapijs-starter';
import {UnitOfWork} from './db';
import {Vmapi} from './triton/vmApi';
import {Papi} from './triton/papi';
import {Napi} from './triton/napi';
const jwt = require("jsonwebtoken");

const validateFunc = async function (decoded: any, request: Request) {
    // put the current user id on the request so we can use it for permission checking
    request.app.currentUserId = decoded.currentUserId;
    return { isValid: true };
};


const start = async function() {
    const config = new Config.default();
    const server = new Server({statusMonitor: false, authEnabled: true, authSecret: config.default.jsonSecret, authValidateFunc: validateFunc, corsOrigins: ['*']});

    // register swagger and it's required plugins
    await server.registerAdditionalPlugin(require('inert'));
    await server.registerAdditionalPlugin(require('vision'));
    const swaggerPluginPackage = {
        plugin: require('hapi-swagger'),
        options: {
            grouping: 'tags',
            sortEndpoints: 'method',
            host: 'localhost:3000'
        }
    };
    await server.registerAdditionalPlugin(swaggerPluginPackage);

    // register api routes
    const apiPluginPackage = {
        plugin: API.default,
        options: {},
        routes: {
            prefix: '/api'
        }
    };
    await server.registerAdditionalPlugin(apiPluginPackage);

    // add method to get UoW off of the request
    await server.registerExtension({
        type: 'onRequest',
            method: async (request: Request, h: ReplyWithContinue) => {
                request.app.uows = [];
        
                request.app.getNewUoW = async () => {
                    const uow = new UnitOfWork(server.app.logger);
                    request.app.uows.push(uow);
                    return uow;
                };

                return h.continue;
            }
    });

    // add method to get VmApi handler off of the request
    await server.registerExtension({
        type: 'onRequest',
            method: async (request: Request, h: ReplyWithContinue) => {
                request.app.getNewVmApi = async () => {
                    const vmApi = new Vmapi(config.default.tritonRoutes.vmapi, server.app.logger);
                    return vmApi;
                };

                return h.continue;
            }
    });

    // add method to get Papi handler off of the request
    await server.registerExtension({
        type: 'onRequest',
            method: async (request: Request, h: ReplyWithContinue) => {
                request.app.getNewPapi = async () => {
                    const papi = new Papi(config.default.tritonRoutes.papi, server.app.logger);
                    return papi;
                };

                return h.continue;
            }
    });

    // add method to get Napi handler off of the request
    await server.registerExtension({
        type: 'onRequest',
            method: async (request: Request, h: ReplyWithContinue) => {
                request.app.getNewNapi = async () => {
                    const napi = new Napi(config.default.tritonRoutes.napi, server.app.logger);
                    return napi;
                };

                return h.continue;
            }
    });

    await server.startServer();
} 

start();