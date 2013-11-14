/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 10:47 AM
 */
module.exports = function (app) {
    "use strict";
    app.set('views', __dirname + '/../../views');
    app.set('view engine', 'jade');
    app.set('view options', {
        layout: false
    });
    app.disable('etag');

};
