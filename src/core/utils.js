'use strict';

class Utils {

    static getToken() {
        // Get element
        var element = document.querySelector('script[data-token][data-name="Bazalt"]');

        // Prevent no token
        if(!element)
        {
            return false;
        }

        return element.getAttribute('data-token');
    }

    static guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
}

module.exports = Utils;
