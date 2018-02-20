import * as Server from 'hapijs-starter';

const start = async function() {
    const server = new Server.default();
    await server.startServer();
} 

start();