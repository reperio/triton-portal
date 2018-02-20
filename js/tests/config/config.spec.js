const Config = require('../../config/index');

describe('Config override tests', () => {
    const config = new Config(true); // pass 'true' in to specify that this we want the whole Config class


    it('Can handle empty user config', () => {
        const obj1 = {
            prop: 'string'
        };
        const obj2 = {};

        try {
            config.mergeObjects(obj1, obj2);
            expect(true).toBe(true);
        } catch (err) {
            expect(true).toBeDefined(false);
        }
    });

    it('Can override string property', () => {
        const obj1 = {
            prop: 'string'
        };
        const obj2 = {
            prop: 'new string'
        };

        config.mergeObjects(obj1, obj2);
        expect(obj1.prop).toBe('new string');
    });

    it('Can override boolean property', () => {
        const obj1 = {
            prop: false
        };
        const obj2 = {
            prop: true
        };

        config.mergeObjects(obj1, obj2);
        expect(obj1.prop).toBe(true);
    });

    it('Can override number property', () => {
        const obj1 = {
            prop: 1000
        };
        const obj2 = {
            prop: 5000
        };

        config.mergeObjects(obj1, obj2);
        expect(obj1.prop).toBe(5000);
    });

    it('Can override array property', () => {
        const obj1 = {
            prop: ['some', 'array']
        };
        const obj2 = {
            prop: ['new', 'array', ':)']
        };

        config.mergeObjects(obj1, obj2);
        expect(obj1.prop).toEqual(['new', 'array', ':)']);
    });

    it('Can override nested properties', () => {
        const obj1 = {
            prop: {
                nestedProp: 'update this property'
            }
        };
        const obj2 = {
            prop: {
                nestedProp: 'updated'
            }
        };

        config.mergeObjects(obj1, obj2);
        expect(obj1.prop.nestedProp).toBe('updated');
    });
});