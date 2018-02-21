const fs = require('fs');
const path = require('path');
const basename = path.basename(module.filename);

const plugin = {
    name: 'portal-api-routes',
    register: (server: any, options: any) => {
        fs
            .readdirSync(__dirname)
            .filter(function(fileName: string) {
                return (fileName.indexOf('.') !== 0) && (fileName !== basename) && (fileName.slice(-3) === '.js');
            })
            .forEach(function(fileName: string) {
                server.route(require(path.join(__dirname, fileName)).default);
            });
    }
};

export default plugin;