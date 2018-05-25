import * as request from 'request-promise-native';
import {LoggerInstance} from 'winston';

/* 
    Documentation for vmapi: https://github.com/joyent/sdc-vmapi/blob/master/docs/index.md
*/

export class Vmapi {
    private _baseUrl: string;
    private _logger: LoggerInstance;

    constructor (ipAddress: string, logger: LoggerInstance) {
        this._baseUrl = `http://${ipAddress}/vms`;
        this._logger = logger;
    }

    async getAllVirtualMachines() {
        this._logger.info('Fetching virtual machines from VmApi');
        const options: request.OptionsWithUri = {
            uri: this._baseUrl,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const virtualMachines = JSON.parse(await request(options));
            return virtualMachines;
        } catch (err) {
            this._logger.error('Failed to fetch virtual machines from VmApi');
            this._logger.error(err);
            throw err;
        }
    }

    async getVirtualMachinesByOwnerUuid(ownerId: string) {
        this._logger.info(`Fetching virtual machine from VmApi with owner_uuid: "${ownerId}"`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}?query=(%26(owner_uuid=${ownerId})(%21(state=destroyed)))`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const virtualMachines = JSON.parse(await request(options));
            return virtualMachines;
        } catch (err) {
            this._logger.error('Failed to fetch virtual machines from VmApi with owner');
            this._logger.error(err);
            throw err;
        }
    }

    async getVirtualMachineByUuid(uuid: string) {
        this._logger.info(`Fetching virtual machine from VmApi with uuid: "${uuid}"`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${uuid}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const virtualMachine = JSON.parse(await request(options));
            return virtualMachine;
        } catch (err) {
            this._logger.error('Failed to fetch virtual machines from VmApi');
            this._logger.error(err);
            throw err;
        }
    }

    async createVirtualMachine(virtualMachine: any) {
        this._logger.info(`Creating new virtual machine: ${JSON.stringify(virtualMachine)}`);

        const options: request.OptionsWithUri = {
            uri: this._baseUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(virtualMachine)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to create vm');
            this._logger.error(err);

            const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));

            throw new Error(errorObj.message);
        }
    }

    async startVirtualMachine(ownerId: string, vmId: string) {
        const payload = {
            uuid: vmId,
            owner_uuid: ownerId,
            action: 'start'
        };

        this._logger.info(`Starting virtual machine: ${vmId}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=start&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to start vm');
            this._logger.error(err);

            const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
            throw new Error(errorObj.message);
        }
    }

    async stopVirtualMachine(ownerId: string, vmId: string) {
        const payload = {
            uuid: vmId,
            owner_uuid: ownerId,
            action: 'stop'
        };

        this._logger.info(`Stopping virtual machine: ${vmId}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=stop&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to stop vm');
            this._logger.error(err);

            const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
            throw new Error(errorObj.message);
        }
    }

    async rebootVirtualMachine(ownerId: string, vmId: string) {
        const payload = {
            uuid: vmId,
            owner_uuid: ownerId,
            action: 'reboot'
        };

        this._logger.info(`Rebooting virtual machine: ${vmId}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=reboot&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to reboot vm');
            this._logger.error(err);
            throw err;
        }
    }

    async deleteVirtualMachine(ownerId: string, vmId: string) {
        const payload = {
            uuid: vmId,
            owner_uuid: ownerId
        };

        this._logger.info(`Deleting virtual machine: ${vmId}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?owner_uuid=${ownerId}&sync=true`,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to delete vm');
            this._logger.error(err);

            const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
            throw new Error(errorObj.message);
        }
    }

    async renameVirtualMachine(vmId: string, alias: string) {
        const payload = {
            alias
        };

        this._logger.info(`Renaming virtual machine: ${vmId}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=update&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to edit vm');
            this._logger.error(err);
           
            const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
            throw new Error(errorObj.message);
        }
    }

    async resizeVirtualMachine(vmId: string, billing_id: string,) {
        const payload = {
            billing_id
        };

        this._logger.info(`Updating virtual machine sdc package: ${vmId} with ${JSON.stringify(payload)}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=update&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to edit vm');
            this._logger.error(err);

            const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
            throw new Error(errorObj.message);
        }
    }

    async reprovisionVirtualMachine(vmId: string, image_uuid: string) {
        const payload = {
            image_uuid: image_uuid
        };

        this._logger.info(`Reprovisioning virtual machine: ${vmId} with ${JSON.stringify(image_uuid)}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=reprovision&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to edit vm');
            this._logger.error(err);
            
            const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
            throw new Error(errorObj.message);
        } 
    }

    async addNicsToVirtualMachine(vmId: string, networks: any[]) {
        const payload = {
            networks
        };

        this._logger.info(`Adding NICs to virtual machine: ${vmId}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=add_nics&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to add NICs');
            this._logger.error(err);

            const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
            throw new Error(errorObj.message);
        } 
    }

    async deleteNics(vmId: string, macs: string[]) {
        const payload = {
            macs
        };

        this._logger.info(`Removing NICs`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=remove_nics&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to remove NICs');
            this._logger.error(err);

            const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
            throw new Error(errorObj.message);
        } 
    }

    async updateNics(vmId: string, nics: any[]) {
        const payload = {
            nics
        };

        this._logger.info(`Updating NICs`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=update_nics&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to update NICs');
            this._logger.error(err);
            
            const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
            throw new Error(errorObj.message);
        } 
    }
}