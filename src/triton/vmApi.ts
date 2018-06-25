import * as request from 'request-promise-native';
import {LoggerInstance} from 'winston';
import ErrorModel from '../models/errorModel';
import ReactTableOptionsModel from '../models/reactTableOptionsModel';

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
        const oldUrl = `${this._baseUrl}?query=(%26(owner_uuid=${ownerId})(%21(state=destroyed)))`;

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

    async getVirtualMachinesByOwnerUuidCount(ownerId: string) {
        this._logger.info(`Fetching virtual machine from VmApi with owner_uuid: "${ownerId}"`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}?query=(%26(owner_uuid=${ownerId})(%21(state=destroyed)))`,
            method: 'HEAD',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const response = await request(options);
            return response;
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

        let payload = {};
        if (virtualMachine.brand === "kvm") {
            payload = {
                owner_uuid: virtualMachine.owner_uuid,
                alias: virtualMachine.alias,
                networks: virtualMachine.networks,
                brand: virtualMachine.brand, 
                billing_id: virtualMachine.billing_id,
                disks: [
                    {
                        image_uuid: virtualMachine.image_uuid
                    },
                    {
                        size: virtualMachine.quota
                    }
                ]
            };
        }
        else {
            payload = {
                owner_uuid: virtualMachine.owner_uuid,
                alias: virtualMachine.alias,
                networks: virtualMachine.networks,
                brand: virtualMachine.brand, 
                billing_id: virtualMachine.billing_id,
                image_uuid: virtualMachine.image_uuid
            };
        }

        const options: request.OptionsWithUri = {
            uri: this._baseUrl,
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
            this._logger.error('Failed to create vm');
            this._logger.error(err);

            const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));

            if (errorObj.message === "Invalid VM parameters") {
                errorObj.errors.forEach((error: ErrorModel) => {
                    if (error.field === "alias" && error.message === "Already exists for this owner_uuid") {
                        throw new Error('The virtual machine name already exists.');
                    }
                    else if (error.field === "alias" && error.message.includes("String does not match regexp")) {
                        throw new Error('The virtual machine name must not contain spaces or symbols (other than "." and "-").');
                    }
                });
            }
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
            const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
            if (!err.message.includes("vmadm.stop error: vmadm exited with code: 1 signal: null")) {
                //https://smartos.org/bugview/OS-5271
                this._logger.error('Failed to stop vm');
                this._logger.error(err);
                throw new Error(errorObj.message);
            }
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

    async updateVirtualMachineTags(uuid: string, tags:any) {
        this._logger.info(`Updating virtual machine tags for uuid: ${uuid}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${uuid}?action=update&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({tags})
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to update virtual machine tags');
            this._logger.error(err);

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }

            throw new Error('Connection timed out');
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

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                if (errorObj.message === "Invalid VM update parameters") {
                    errorObj.errors.map((error: ErrorModel) => {
                        if (error.field === "alias" && error.message === "Already exists for this owner_uuid") {
                            throw new Error('The virtual machine name already exists.');
                        }
                        else if (error.field === "alias" && error.message.includes("String does not match regexp")) {
                            throw new Error('The virtual machine name must not contain spaces or symbols (other than "." and "-").');
                        }
                    });
                }
                throw new Error(errorObj.message);
            }

            throw new Error('Connection timed out');
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

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }

            throw new Error('Connection timed out');
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
            
            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }

            throw new Error('Connection timed out');
        } 
    }

    async addNicsToVirtualMachine(vmId: string, networks: any[]) {
        const payload = {
            networks
        };

        this._logger.info(`Adding NICs to virtual machine: ${vmId}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=add_nics`,
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

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }

            throw new Error('Connection timed out');
        } 
    }

    async deleteNics(vmId: string, macs: string[]) {
        const payload = {
            macs
        };

        this._logger.info(`Removing NICs`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=remove_nics`,
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

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }

            throw new Error('Connection timed out');
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

            if (err.message.includes('StatusCodeError')) {
                const errorObj = JSON.parse(JSON.parse(err.message.substr(err.message.indexOf("-") + 1).trim()));
                throw new Error(errorObj.message);
            }

            throw new Error('Connection timed out');
        } 
    }
}