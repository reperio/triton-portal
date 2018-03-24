import * as request from 'request-promise-native';
import {LoggerInstance} from 'winston';

/* 
    Documentation for napi: https://github.com/joyent/sdc-napi/blob/master/docs/index.md
*/

export class Napi {
    private _baseUrl: string;
    private _logger: LoggerInstance;

    constructor (ipAddress: string, logger: LoggerInstance) {
        this._baseUrl = `http://${ipAddress}/`;
        this._logger = logger;
    }

}