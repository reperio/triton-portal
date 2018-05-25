import * as request from 'request-promise-native';
import {LoggerInstance} from 'winston';

/* 
    Documentation for papi: https://github.com/joyent/sdc-papi/blob/master/docs/index.md
*/

export class Papi {
    private _baseUrl: string;
    private _logger: LoggerInstance;

    constructor (ipAddress: string, logger: LoggerInstance) {
        this._baseUrl = `http://${ipAddress}/packages`;
        this._logger = logger;
    }

    async getAllPackages() {
        this._logger.info('Fetching packages from papi');
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}?active=true`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const packages = JSON.parse(await request(options));
            return packages;
        } catch (err) {
            this._logger.error('Failed to fetch packages from papi');
            this._logger.error(err);
            throw err;
        }
    }

    async getPackageByUuid(uuid: string) {
        this._logger.info(`Fetching package from papi by uuid: ${uuid}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${uuid}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const _package = JSON.parse(await request(options));
            return _package;
        } catch (err) {
            this._logger.error('Failed to fetch package from papi');
            this._logger.error(err);
            throw err;
        }
    }
}