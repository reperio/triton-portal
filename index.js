const ReperioServer = require('hapijs-starter').default;
const Config = require('./config');

const start = async function () {
    try {
        const reperio_server = new ReperioServer({authEnabled: true, authSecret: Config.jsonSecret});

        reperio_server.app.config = Config;

        await reperio_server.startServer();
    } catch (err) {
        console.error(err);
    }
};

start();