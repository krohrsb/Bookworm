/**
 * Author DB Model
 * @param {object} sequelize - sequelize instance
 * @param {object} DataTypes - data types reference
 * @returns {Author}
 */
module.exports = function(sequelize, DataTypes) {
    var Author = sequelize.define('Author', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guid: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        name: {
            type: DataTypes.TEXT,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        link: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        apiLink: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        image: {
            type: DataTypes.TEXT,
            defaultValue: '/img/no-image.gif',
            allowNull: false
        },
        imageSmall: {
            type: DataTypes.TEXT,
            defaultValue: '/img/no-image.gif',
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('paused', 'active'),
            defaultValue: 'active'
        },
        provider: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        }
    }, {
        classMethods: {
            /**
             * Associate authors with other models
             * @param {object} models - Reference to other models
             */
            associate: function(models) {
                'use strict';
                Author.hasMany(models.Book, {onDelete: 'cascade'});
            },
            /**
             * Initialize hooks for this model
             * @param {object} models - Reference to other models, includes model emitter.
             */
            hooks: function(models) {
                "use strict";
                Author.hook('afterUpdate', function (author, next) {
                    models.emitter.emit('author/afterUpdate', author);
                    next(null, author);
                });
            }
        },
        instanceMethods: {}
    });

    return Author;
};