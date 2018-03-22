import {Request, ReplyWithContinue} from 'hapi';

import * as API from './api';
const Config = require('./config');
import {Server} from 'hapijs-starter';
import {UnitOfWork} from './db';
import {VmApi} from './triton/vmApi';


const start = async function() {
    const config = new Config.default();
    const server = new Server({statusMonitor: false});

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
                    const vmApi = new VmApi(config.default.triton.vmApiIpAddress, server.app.logger);
                    return vmApi;
                };

                return h.continue;
            }
    });

    await server.startServer();
} 

start();