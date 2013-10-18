/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 4:02 PM
 */


// Models
var Author = require('../../models/author');
var Book = require('../../models/book');


module.exports = function (db) {
    "use strict";

    Author.hasMany(Book, {
        as: 'getBooks',
        foreignKey: 'authorId'
    });

    Book.belongsTo(Author, {
        as: 'getAuthor',
        foreignKey: 'authorId'
    });

    //db.autoupdate();

   /* Author.create({guid: 'xyz', name: 'Bob Barker'}, function (err, author) {
        console.log(arguments);
        author.getBooks.create({guid: '123', title: 'test title'}, function () {
            console.log(arguments);
        });
    });*/

};