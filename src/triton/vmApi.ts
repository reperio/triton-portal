import * as request from 'request-promise-native';
import {LoggerInstance} from 'winston';

/* 
    Documentation for vmapi: https://github.com/joyent/sdc-vmapi/blob/master/docs/index.md
*/

export class Vmapi {
    private _baseUrl: string;
    private _logger: LoggerInstance;

    constructor (ipAddress: string, logger: LoggerInstance) {
        this._baseUrl = `http://${ipAddress}/vms`;
        this._logger = logger;
    }

    async getAllVirtualMachines() {
        this._logger.info('Fetching virtual machines from VmApi');
        const options: request.OptionsWithUri = {
            uri: this._baseUrl,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const virtualMachines = JSON.parse(await request(options));
            return virtualMachines;
        } catch (err) {
            this._logger.error('Failed to fetch virtual machines from VmApi');
            this._logger.error(err);
            throw err;
        }
    }

    async getVirtualMachineByUuid(uuid: string) {
        this._logger.info(`Fetching virtual machine from VmApi with uuid: "${uuid}"`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${uuid}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const virtualMachine = JSON.parse(await request(options));
            return virtualMachine;
        } catch (err) {
            this._logger.error('Failed to fetch virtual machines from VmApi');
            this._logger.error(err);
            throw err;
        }
    }
}