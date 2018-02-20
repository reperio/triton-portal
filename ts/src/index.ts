import {Config} from './config';

import * as Server from 'hapijs-starter';

const start = async function() {
    const config = new Config();
    console.log(JSON.stringify(config));
    const server = new Server.default();
    await server.startServer();
} 

start();