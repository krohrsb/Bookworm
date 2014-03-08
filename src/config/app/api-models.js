/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 3/5/14 2:21 PM
 */
module.exports = {
    Log: {
        id: 'Log',
        properties: {
            date: {
                type: 'string'
            },
            args: {
                type: 'array'
            },
            levelNumber: {
                type: 'integer'
            },
            levelName: {
                type: 'string'
            },
            line: {
                type: 'string'
            },
            method: {
                type: 'string'
            },
            file: {
                type: 'string'
            }
        }
    },
    MetadataLinks: {
        id: 'MetadataLinks',
        properties: {
            self: {
                type: 'string'
            },
            base: {
                type: 'string'
            },
            pagingRemoved: {
                type: 'string'
            },
            first: {
                type: 'string'
            },
            previous: {
                type: 'string'
            },
            last: {
                type: 'string'
            }
        }
    },
    Metadata: {
        id: 'Metadata',
        properties: {
            links: {
                type: 'MetadataLinks'
            }
        }
    },
    LogResult: {
        id: 'LogResult',
        properties: {
            data: {
                type: 'array',
                items: {
                    $ref: 'Log'
                }
            },
            _metadata: {
                type: 'Metadata'
            }
        }
    }
};