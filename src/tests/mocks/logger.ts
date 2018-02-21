class Logger {
    public enabled: boolean;

    constructor(enabled: boolean) {
        this.enabled = enabled;
    }

    info(message: string) {
        if (this.enabled) console.log('INFO: ' + message || '');
    }

    warn(message: string) {
        if (this.enabled) console.log('WARN: ' + message || '');
    }

    error(message: string) {
        if (this.enabled) console.log('ERROR: ' + message || '');
    }

    debug(message: string) {
        if (this.enabled) console.log('DEBUG: ' + message || '');
    }
}

module.exports = Logger;