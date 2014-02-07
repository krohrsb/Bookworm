/**
 * Release DB Model
 * @param {object} sequelize - sequelize instance
 * @param {object} DataTypes - data types reference
 * @returns {Release}
 */
module.exports = function(sequelize, DataTypes) {
    var Release = sequelize.define('Release', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guid: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: ''
        },
        nzbTitle: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        providerName: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        providerType: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        link: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        grabs: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            validate: {
                isNumeric: true
            }
        },
        size: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            validate: {
                isNumeric: true
            }
        },
        review: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('wanted', 'available', 'downloaded', 'snatched', 'ignored'),
            defaultValue: 'available'
        },
        provider: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        directory: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        }
    }, {
        classMethods: {
            /**
             * Associate books with other models
             * @param {object} models - Reference to other models
             */
            associate: function(models) {
                Release.belongsTo(models.Book);
            },
            /**
             * Initialize hooks for this model
             * @param {object} models - Reference to other models, includes model emitter.
             */
            hooks: function (models) {
                "use strict";
                Release.hook('afterUpdate', function (release, next) {
                    models.emitter.emit('release/afterUpdate', release);
                    next(null, release);
                });
                Release.hook('beforeUpdate', function (newRelease, next) {
                    this.find({
                        where: {
                            id: newRelease.id
                        }
                    }).then(function (oldRelease) {
                        if (newRelease.status !== oldRelease.status) {
                            models.emitter.emit('release/statusUpdated', newRelease);
                        }
                        next(null, newRelease);
                    }, next);
                });
            }
        }
    });

    return Release;
};