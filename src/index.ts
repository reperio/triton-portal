import * as Server from 'hapijs-starter';

import * as API from './api';
const Config = require('./config');
import {UnitOfWork} from './db';
import {VmApi} from './triton/vmApi';


const start = async function() {
    const config = new Config.default();
    const server = new Server.default();

    // register swagger and it's required plugins
    await server.registerAdditionalPlugin(require('inert'));
    await server.registerAdditionalPlugin(require('vision'));
    const swaggerPluginPackage = {
        plugin: require('hapi-swagger'),
        options: {
            grouping: 'tags',
            sortEndpoints: 'method'
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
            method: async (request, h) => {
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
            method: async (request, h) => {        
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