import Config from './config';
import {UnitOfWork} from './db';

import * as Server from 'hapijs-starter';

const start = async function() {
    const config = new Config();
    const server = new Server.default();
    await server.startServer();
    const db = new UnitOfWork(server.app.logger);
} 

start();