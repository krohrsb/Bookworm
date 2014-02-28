/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 9:33 AM
 */
module.exports = {
    database: {
        path: 'database/bookworm.db',
        backupDir: 'database/backups/'
    },
    loggers: {
        file: {
            path: 'logs/bookworm.log',
            enabled: true,
            maxFiles: 6,
            maxSize: 102400,
            debug: false
        },
        console: {
            enabled: true,
            debug: true
        }
    },
    server: {
        port: 3000,
        host: '0.0.0.0',
        apiKey: '',
        username: '',
        password: ''
    },
    searchers: {
        newznab: {
            retention: 2000,
            frequency: 720,
            enabled: false,
            cache: 60000,
            ignoredWords: '',
            hosts: []
        },
        googleBooks: {
            newCheckFrequency: 1440,
            ignoredWords: '',
            apiKey: '',
            cache: 60000,
            language: 'en',
            filters: {
                isbn: true,
                description: true,
                languages: 'en'
            },
            pagingLimits: {
                searchBooks: 1,
                searchAuthors: 1,
                searchNewBooks: 1,
                refreshAuthor: 2
            }
        }
    },
    notifiers: {
        nma: {
            enabled: false,
            onSnatch: false,
            onDownload: false,
            priority: 0,
            apiKey: ''
        },
        pushover: {
            enabled: false,
            onSnatch: false,
            onDownload: false,
            priority: 0,
            apiKey: '',
            userKey: ''
        }
    },
    downloaders: {
        sabnzbd: {
            enabled: false,
            host: '',
            username: '',
            password: '',
            apiKey: '',
            category: ''
        }
    },
    postProcessor: {
        frequency: 10,
        downloadDirectory: '',
        destinationDirectory: '',
        folderFormat: '$Author-$Title($Year)',
        fileFormat: '$Author-$Title($Year)',
        keepOriginalFiles: true,
        directoryPermissions: '0755',
        opfName: 'metadata.opf'
    }
};