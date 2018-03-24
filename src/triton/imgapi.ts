import * as request from 'request-promise-native';
import {LoggerInstance} from 'winston';

/* 
    Documentation for imgapi: https://github.com/joyent/sdc-imgapi/blob/master/docs/index.md
*/

export class Imgapi {
    private _baseUrl: string;
    private _logger: LoggerInstance;

    constructor (ipAddress: string, logger: LoggerInstance) {
        this._baseUrl = `http://${ipAddress}/`;
        this._logger = logger;
    }

}