'use strict';

// Load local dependencies
var AsyncQueue = require('./async-queue');
var Utils      = require('./utils');

// Private variables
var realtime,
    initialized = false,
    connected   = false,
    retry       = 1,
    callbackSet = {};

// Reconnect method
function reconnect() {
    retry *= 1.3;

    if(false === connected)
    {
        // Retry after
        setTimeout(
            realtime.open.bind(realtime),
            Math.round(1000 * retry)
        );
    }
}

// Create an async queue to deserve data
var queue = new AsyncQueue(function(data, next) {
    realtime.write(data);

    console.log('Sent:', data);

    next();
});

// Be sure to cut of data sending during disconnection
queue.setNext(function() {
    return initialized && connected;
});

class Realtime {
    constructor(url) {
        // Connect the library
        realtime = Primus.connect(url);

        // Listen all messages
        realtime.on('data', function(data) {
            console.log('Received:', data);

            // Check reserved event
            if(!data || !data.event || realtime.reserved(data.event)) return;

            // Get the identifier
            var identifier = data.identifier;

            // If there is an identifier, check for a callback
            if(identifier && identifier in callbackSet)
            {
                var callback = callbackSet[identifier].callback;

                // Check if the callback is a function
                if('function' === typeof callback)
                {
                    // Async callback
                    setTimeout(function() {
                        try {
                            // Execute the callback
                            callback(data);

                        } catch(ex) {
                            // Log any error
                            console.log('Error during callback:', ex);
                        }
                    }, 0);
                }

                // Remove it from the list
                delete callbackSet[identifier];
            }

            realtime.emit.call(realtime, data.event, data);
        });

        // Listen for connection
        realtime.on('open', function() {
            retry       = 1;
            connected   = true;
            initialized = true;
        });

        // Listen for end
        realtime.on('end', function closed() {
            // Set as not connected and reconnect
            connected = false;

            reconnect();
        });
    }

    send(eventName, data, callback) {
        // If there a function instead of data
        if('function' === typeof data)
        {
            callback = data;
            data     = {};
        }

        // If no data, initialize data
        if(!data)
        {
            data = {};
        }

        // Check for callback
        if('function' === typeof callback)
        {
            var identifier;

            // Generate unique identifier
            do {
                // Generate an Id for the callback
                identifier = Utils.guid();

                // Loop while the identifier is active
            } while(identifier in callbackSet);

            // Set the identifier in the message
            data.identifier = identifier;

            // Register the callback for the identifier
            callbackSet[identifier] = {
                identifier: identifier,
                callback:   callback,
                register:   new Date()
            };
        }

        // Define basic message
        data.event = eventName;

        // Push data in the queue
        queue.push(data);
    }

    on(eventName, callback) {
        realtime.on(eventName, callback);
    }

    once(eventName, callback) {
        realtime.once(eventName, callback);
    }
}

module.exports = Realtime;
