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

    async getAllImages() {
        this._logger.info('Fetching images from ImgApi');
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/images`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const images = JSON.parse(await request(options));
            return images;
        } catch (err) {
            this._logger.error('Failed to fetch images from ImgApi');
            this._logger.error(err);
            throw err;
        }
    }

    async getImageByUuid(uuid: string) {
        this._logger.info(`Fetching image from ImgApi with uuid: "${uuid}"`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/images/${uuid}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const image = JSON.parse(await request(options));
            return image;
        } catch (err) {
            this._logger.error('Failed to fetch image from ImgApi');
            this._logger.error(err);
            throw err;
        }
    }
}