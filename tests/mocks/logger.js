class Logger {
    constructor(enabled) {
        this.enabled = enabled;
    }

    info(message) {
        if (this.enabled) console.log('INFO: ' + message || '');
    }

    warn(message) {
        if (this.enabled) console.log('WARN: ' + message || '');
    }

    error(message) {
        if (this.enabled) console.log('ERROR: ' + message || '');
    }

    debug(message) {
        if (this.enabled) console.log('DEBUG: ' + message || '');
    }
}

module.exports = Logger;