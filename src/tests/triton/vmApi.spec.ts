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
        const virtualMachine = await vmApi.getVirtualMachineByUuid('ffd72e67-511a-cc12-f1db-a61bb68f822b');
        expect(virtualMachine.alias).toBe('leo-web-qa');
    });


});