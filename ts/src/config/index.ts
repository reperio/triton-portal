import * as fs from 'fs';
import * as path from 'path';
import { EWOULDBLOCK } from 'constants';

export class Config {
    constructor() {
        const configName = process.env.NODE_ENV || 'development';
        const defaultConfig = require(`./${configName}`);
        const backupConfig = defaultConfig;
        try {
            const userConfig = require(`./${configName}.user`);
            this.mergeObjects(defaultConfig, userConfig);
        } catch (err) {
            return backupConfig;
        }

        return defaultConfig;
    }

    mergeObjects(obj1: any, obj2: any) {
        for (const property of Object.keys(obj1)) {
            if (obj2.hasOwnProperty(property)) {
                const prop1Type = this.getPropertyType(obj1, property);
                const prop2Type = this.getPropertyType(obj2, property);
    
                if (prop1Type === 'object') {
                    // call mergeObject to merge the nested properties
                    this.mergeObjects(obj1[property], obj2[property]);
                } else if (prop1Type === 'array') {
                    // make a new copy of the array and assign it to obj1
                    obj1[property] = obj2[property].slice();
                } else {
                    // assign obj1 property to the value of obj2 property 
                    obj1[property] = obj2[property];
                }
            }
        }
    }

    getPropertyType(obj: any, property: any) {
        if (typeof obj[property] !== 'object') {
            return typeof obj[property];
        } else if (Array.isArray(obj[property])) {
            return 'array';
        } 
        return 'object';
    }
}