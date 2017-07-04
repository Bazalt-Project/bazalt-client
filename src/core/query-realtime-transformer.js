'use strict';

var Query = require('bazalt-query');

// The Query Transformer Over Realtime
class QueryRealtimeTransformer {

    realtime(realtime) {
        this.$__realtime = realtime;
    }

    executeQuery(query, callback) {
        if(false === query instanceof Query)
        {
            throw new Error('The given object is not an instance of `Query`.');
        }

        // Send the query to the server
        this.$__realtime.send('bazalt:query', query.toObject(), function(response) {
            if('function' === typeof callback)
            {
                // Transform response to error / result format
                callback(response.error, response.result);
            }
        });
    }

    transformer() {
        var self = this;

        // Return the transformer for Query
        return function(callback) {
            // Transfer the query
            self.executeQuery(this, callback);
        };
    }
}

module.exports = QueryRealtimeTransformer;
