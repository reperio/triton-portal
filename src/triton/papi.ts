import * as request from 'request-promise-native';
import {LoggerInstance} from 'winston';

/* 
    Documentation for papi: https://github.com/joyent/sdc-papi/blob/master/docs/index.md
*/

export class Papi {
    private _baseUrl: string;
    private _logger: LoggerInstance;

    constructor (ipAddress: string, logger: LoggerInstance) {
        this._baseUrl = `http://${ipAddress}/`;
        this._logger = logger;
    }

}