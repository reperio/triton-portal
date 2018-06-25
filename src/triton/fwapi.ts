import * as request from 'request-promise-native';
import {LoggerInstance} from 'winston';
import ErrorModel from '../models/errorModel';

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

    async getGlobalRules() {
        this._logger.info(`Fetching global firewall rules from fwapi`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/rules?global=true`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const rules = JSON.parse(await request(options));
            return rules;
        } catch (err) {
            this._logger.error('Failed to fetch global rules from fwapi');
            this._logger.error(err);

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }

            throw new Error('Connection timed out');
        }
    }

    async getRulesByUuid(uuid: string) {
        this._logger.info(`Fetching firewall rules from fwapi with uuid: "${uuid}"`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/rules?vm=${uuid}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const rules = JSON.parse(await request(options));
            return rules;
        } catch (err) {
            this._logger.error('Failed to fetch rules from fwapi');
            this._logger.error(err);

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }

            throw new Error('Connection timed out');
        }
    }

    async deleteRule(uuid: string, owner_uuid: string) {
        this._logger.info(`Deleting a firewall rule with uuid: ${uuid}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/rules/${uuid}?owner_uuid=${owner_uuid}`,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            let repsonse = await request(options);
            if (repsonse !== "") {
                const result = JSON.parse(repsonse);
                return result;
            }
            
            return "success";
        } catch (err) {
            this._logger.error('Failed to delete firewall rule');
            this._logger.error(err.message);

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }

            throw new Error('Connection timed out');
        }
    }

    async createRule(rule: any) {
        this._logger.info(`Creating a firewall rule`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/rules`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rule)
        };

        try {
            const network = JSON.parse(await request(options));
            return network;
        } catch (err) {
            this._logger.error('Failed to create the firewall rule');
            this._logger.error(err);

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                if (errorObj.code === "InvalidParameters") {
                    errorObj.errors.forEach((error: ErrorModel) => {
                        if (error.field === "rule") {
                            throw new Error(`Invalid rule format: ${error.message}`);
                        }
                    });
                }
            }

            throw new Error('Connection timed out');
        }
    }

    async updateRule(rule: any) {
        this._logger.info(`Updating firewall rule`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/rules/${rule.uuid}?enabled=${rule.enabled}&rule=${rule.rule}&owner_uuid=${rule.owner_uuid}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to update firewall rule');
            this._logger.error(err);

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                if (errorObj.code === "InvalidParameters") {
                    errorObj.errors.forEach((error: ErrorModel) => {
                        if (error.field === "rule") {
                            throw new Error(`Invalid rule format: ${error.message}`);
                        }
                    });
                }
            }
            
            throw new Error('Connection timed out');
        } 
    }
}