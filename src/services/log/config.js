/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 9:53 AM
 */
module.exports = {
    config: {
        lineOffset: 1,
        levels: {
            emergency: 0,
            alert: 1,
            critical: 2,
            error: 3,
            warning: 4,
            notice: 5,
            info: 6,
            debug: 7,

            emerg: 0,
            crit: 2,
            err: 3,
            warn: 4,
            note: 5,

            default: 6
        }
    }
};