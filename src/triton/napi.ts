import * as request from 'request-promise-native';
import {LoggerInstance} from 'winston';

/* 
    Documentation for napi: https://github.com/joyent/sdc-napi/blob/master/docs/index.md
*/

export class Napi {
    private _baseUrl: string;
    private _logger: LoggerInstance;

    constructor (ipAddress: string, logger: LoggerInstance) {
        this._baseUrl = `http://${ipAddress}/fabrics`;
        this._logger = logger;
    }

    async getFabricNetworks(owner_uuid: string, vlan_id: number) {
        this._logger.info(`Fetching fabric networks from napi with owner uuid: "${owner_uuid}" and vlan_id: "${vlan_id}"`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${owner_uuid}/vlans/${vlan_id}/networks`,
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

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }
            
            throw new Error('Connection timed out');
        }
    }

    async getFabricVlans(owner_uuid: string) {
        this._logger.info(`Fetching fabric vlans from napi with owner uuid: "${owner_uuid}"`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${owner_uuid}/vlans`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const networks = JSON.parse(await request(options));
            return networks;
        } catch (err) {
            this._logger.error('Failed to fetch vlans from napi');
            this._logger.error(err);

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }

            throw new Error('Connection timed out');
        }
    }

    async createFabricVlan(name: string, vlanId: number, owner_uuid: string) {
        this._logger.info(`Creating fabric vlan` + JSON.stringify({name, vlanId, owner_uuid}));

        const payload = {
            name: name,
            vlan_id: vlanId
        };

        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${owner_uuid}/vlans`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const fabric = JSON.parse(await request(options));
            return fabric;
        } catch (err) {
            this._logger.error('Failed to create fabric vlan');
            this._logger.error(err);

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }

            throw new Error('Connection timed out');
        }
    }

    async deleteFabricVlan(owner_uuid: string, vlanId: number) {
        this._logger.info(`Deleting fabric vlan` + JSON.stringify({vlanId, owner_uuid}));

        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${owner_uuid}/vlans/${vlanId}`,
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
            this._logger.error('Failed to delete fabric vlan');
            this._logger.error(err);

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }
            
            throw new Error('Connection timed out');
        }
    }

    async createFabricNetwork(network: any, vlan_id: number, owner_uuid: string) {
        this._logger.info(`Creating a fabric network`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${owner_uuid}/vlans/${vlan_id}/networks`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(network)
        };

        try {
            const network = JSON.parse(await request(options));
            return network;
        } catch (err) {
            this._logger.error('Failed to create fabric network');
            this._logger.error(err);

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }
            
            throw new Error('Connection timed out');
        }
    }

    async deleteFabricNetwork(owner_uuid: string, vlan_id: number, network_uuid: string) {
        this._logger.info(`Deleting a fabric network`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${owner_uuid}/vlans/${vlan_id}/networks/${network_uuid}`,
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
            this._logger.error('Failed to delete fabric network');
            this._logger.error(err.message);

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }

            throw new Error('Connection timed out');
        }
    }
}