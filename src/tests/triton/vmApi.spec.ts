const Config = require('../../config');
const MockLogger = require('../mocks/logger');
import {VmApi} from '../../triton/vmApi';

const logger = new MockLogger(false);
const config = new Config.default();
const vmApi = new VmApi(config.default.triton.vmApiIpAddress, logger);

describe('VmApi tests', () => {
    it ('Can fetch virtual machines list', async () => {
        const virtualMachines = await vmApi.getAllVirtualMachines();
        expect(virtualMachines.length).toBeGreaterThan(0);
    });

    it('Can fetch specific virtual machine by uuid', async () => {
        const virtualMachine = await vmApi.getVirtualMachineByUuid('ffa17b90-e99d-eb25-eec0-a91b85f4eaaf');
        expect(virtualMachine.alias).toBe('cpc-iis-01');
    });


});