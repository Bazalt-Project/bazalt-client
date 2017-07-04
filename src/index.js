'use strict';

if('undefined' === typeof Primus) {
    throw new Error('The Primus library is not defined!');
}

// Load dependencies
var Query                 = require('bazalt-query');
var Schema                = require('bazalt-schema');
var Model                 = require('bazalt-model');
var ModelQueryTransformer = require('bazalt-model-query-transformer');

// Load local files
var Config                   = require('./config');
var QueryRealtimeTransformer = require('./core/query-realtime-transformer');
var ModelSubscribeStatics    = require('./core/model-subscribe-statics');
var Realtime                 = require('./core/realtime');
var Utils                    = require('./core/utils');

// Instanciate the query transformer
var queryTransformer      = new QueryRealtimeTransformer();

// Initialize transformer
Model.transformer(ModelQueryTransformer);
Query.transformer(queryTransformer.transformer());

// Prepare statics
var modelSubscribeStatics = new ModelSubscribeStatics();

// Register statics
Model.statics(modelSubscribeStatics.statics());

// Private variables
var realtime    = null,
    initialized = false,
    token       = Utils.getToken(),
    models      = {},
    serverTime  = new Date(),
    clientTime  = serverTime;

// Bazalt Class
class Bazalt {

    static connect(callback) {
        // No more action if no token
        if(false === token)
        {
            return;
        }

        // Return realtime if already initialized
        if(null !== realtime)
        {
            
            return realtime;
        }
        
        // Connect to the server
        realtime = new Realtime(Bazalt.configuration.api + '?token=' + token);

        // Set the realtime
        queryTransformer.realtime(realtime);
        modelSubscribeStatics.realtime(realtime);

        // Listen bazalt for initialization
        realtime.on('bazalt:initialize', function(data) {

            // Register server time
            serverTime = new Date(data.time);

            // Register schemas
            for(let name in data.schemas)
            {
                let schema = Schema.fromJSON(data.schemas[name]);

                // Generate each Model
                models[name] = Model.generate(name, schema);
            }

            if(false === initialized)
            {
                initialized = true;

                // Start
                setTimeout(callback);
            }
        });

        return realtime;
    }

    static get models() {
        return Object.keys(models);
    }

    static model(modelName) {
        // Check for the existence of the model
        if(false === modelName in models)
        {
            throw new Error('There is no model with this name.');
        }

        return models[modelName];
    }

    // Return the offset between the client and the server
    static getOffsetTime() {
        return serverTime - clientTime;
    }

    // A static method to set the right environment
    static environment(environment) {

        // Check if the environment 
        if(environment in Config)
        {
            // Set the configuration
            Bazalt.configuration = Config[environment];
        }
    }
}

// Default environment
Bazalt.environment('production');

// Export Bazalt
module.exports = Bazalt;
