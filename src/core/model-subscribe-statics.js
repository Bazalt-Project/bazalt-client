'use strict';

var Model = require('bazalt-model');

// The Model Statics for subscribe
class ModelSubscribeStatics {

    realtime(realtime) {
        this.$__realtime = realtime;
    }

    subscribe(callback) {

        // Send the subscription request to the server
        this.$__realtime.send('bazalt:subscribe', { model: this.modelName }, callback);
    }

    unsubscribe(callback) {

        // Send the unsubscription request to the server
        this.$__realtime.send('bazalt:unsubscribe', { model: this.modelName }, callback);
    }

    statics() {
        var self = this;

        return {
            subscribe:   this.subscribe,
            unsubscribe: this.unsubscribe
        };
    }
}

module.exports = ModelSubscribeStatics;
