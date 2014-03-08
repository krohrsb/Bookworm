/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 3/4/14 3:18 PM
 */
var jsonMask = require('json-mask');
var compile = jsonMask.compile;
var filter = jsonMask.filter;

module.exports = function (options) {
    options = options || {};

    /**
     * Take an object and filter it creating a partial.
     * @param {Object} obj - object to filter
     * @param {String} fields - json-mask compliant filter string.
     * @returns {Object}
     */
    function partialResponse(obj, fields) {
        // if no fields, don't filter. Otherwise filter the object with the fields.
        if (!fields) {
            return obj;
        } else if (options.exclude) {
            if (filter(obj, compile(options.exclude)) === null) {
                return filter(obj, compile(fields));
            } else {
                return obj;
            }
        } else {
            return filter(obj, compile(fields));
        }
    }

    /**
     * Wrap the original function with additional logic.
     * @param {Function} original - Original function, e.g., res.json
     * @returns {Function}
     */
    function wrap(original) {
        // returning a wrapped function.
        return function () {
            // get the query param that contains the filter list.
            var param = this.req.query[options.query || 'fields'];

            //if only one argument, user is not specifying status code along with data.
            if (arguments.length === 1) {
                //call the original function with the filtered data (first arg)
                original(partialResponse(arguments[0], param));
            } else if (arguments.length === 2) {
                //we have two arguments, user is sending status code along with data, handle accordingly.
                if (typeof arguments[1] === 'number') {
                    original(arguments[1], partialResponse(arguments[0], param));
                } else {
                    original(arguments[0], partialResponse(arguments[1], param));
                }
            }
        };
    }

    /**
     * Middleware function which masks the json/jsonp
     */
    return function (req, res, next) {
        if (!res.__isJSONMaskWrapped) {
            res.json = wrap(res.json.bind(res));
            res.jsonp = wrap(res.jsonp.bind(res));
            res.__isJSONMaskWrapped = true;
        }
        next();
    };
};
