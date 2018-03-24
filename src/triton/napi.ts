import * as request from 'request-promise-native';
import {LoggerInstance} from 'winston';

/* 
    Documentation for napi: https://github.com/joyent/sdc-napi/blob/master/docs/index.md
*/

export class Napi {
    private _baseUrl: string;
    private _logger: LoggerInstance;

    constructor (ipAddress: string, logger: LoggerInstance) {
        this._baseUrl = `http://${ipAddress}/networks`;
        this._logger = logger;
    }

    async getAllNetworks(owner_uuid: string) {
        this._logger.info(`Fetching networks from napi with owner uuid: "${owner_uuid}"`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}?owner_uuid=${owner_uuid}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const networks = JSON.parse(await request(options));
            return networks;
        } catch (err) {
            this._logger.error('Failed to fetch networks from napi');
            this._logger.error(err);
            throw err;
        }
    }

}