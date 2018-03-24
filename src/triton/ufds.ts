import * as request from 'request-promise-native';
import {LoggerInstance} from 'winston';

/* 
    Documentation for ufds api: https://github.com/joyent/sdc-ufds/blob/master/docs/index.md
*/

export class Ufds {
    private _baseUrl: string;
    private _logger: LoggerInstance;

    constructor (ipAddress: string, logger: LoggerInstance) {
        this._baseUrl = `http://${ipAddress}/`;
        this._logger = logger;
    }

}