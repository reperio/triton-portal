import * as request from 'request-promise-native';
import {LoggerInstance} from 'winston';

/* 
    Documentation for fwapi: https://github.com/joyent/sdc-fwapi/blob/master/docs/index.md
*/

export class Fwapi {
    private _baseUrl: string;
    private _logger: LoggerInstance;

    constructor (ipAddress: string, logger: LoggerInstance) {
        this._baseUrl = `http://${ipAddress}/`;
        this._logger = logger;
    }

}