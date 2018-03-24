const Config = require('../../config');
const MockLogger = require('../mocks/logger');
import {Papi} from '../../triton/papi';

const logger = new MockLogger(false);
const config = new Config.default();
const papi = new Papi(config.default.tritonRoutes.papi, logger);

describe('Papi tests', () => {
    it ('Can fetch package list', async () => {
        const packages = await papi.getAllPackages();
        expect(packages.length).toBeGreaterThan(0);
    });
});