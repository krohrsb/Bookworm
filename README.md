# NOTICE

I am currently rewriting this on a bitbucket account right now. I wanted to learn/practice a few things and just wanted a change of pace.

[Bookworm@Bitbucket](https://bitbucket.org/blackbarn/bookworm)

Still writing the back-end, so it isn't really usable yet. The main difference is, it uses MongoDB instead of SQLite. It also has the latest express and a different API.


# Bookworm

Bookworm is a Book NZB searcher and grabber. In likeness with the Couchpotato, Sickbeard and Headphones applications.

It is built with NodeJS, ExpressJS and AngularJS with Sequelize (using sqlite) and many other libraries and tools.

It (currently) utilizes the vast Public Google Books API for book information.

Add your favorite authors, mark books as wanted, search nzb providers for these books and download them with SABnzbd!

Get notified with Notify My Android or Pushover!

_Currently only Newznab providers are supported for search providers, and SABNzbd for download providers. More to be implemented in the future._

### WARNING!!
**_Bookworm can be considered in Alpha, it is still in active development. Don't expect it to be perfect :)_**

## Additional Information

### Google Books

Google Books has a vast database of information. However due to this some results may be inaccurate or unreliable. Use the 'exclude' feature to remove books from view that you do not care about.

Google enforces a requests per day limit on the Google Books API.
[Reference](http://productforums.google.com/forum/#!msg/books-api/64GYbc9sRW4/jD8CNdpcPhMJ)
The limit is 1000 Requests per day.

You may need to set up a [Google API Console](https://code.google.com/apis/console/) account to retrieve a Google Books API Key.

It will come with 1000 requests/day quota, you can request more if you wish via an online form.

You can place your API key in the settings of Bookworm.

### Features

Bookworm currently only supports newznab providers for searching, SABnzbd for downloading and Notify My Android/Pushover for notifications. This is simply what has been done so far as it is what I use.

Some current wishlist items for the future:
* GoodReads integration
* Book format profiles (specify pdf, epub, mobi) etc.
* Automatic updating via git
* Proper database schema updates

## Getting Started

You will need a few things (currently) in order to set up Bookworm.

* Git http://git-scm.com/
* Node (NPM is included) http://nodejs.org/download/
* Bower https://github.com/twitter/bower
* Gulp http://gulpjs.com/

Once you have those dependencies set up, clone the repo and initialize.

Clone Repo
```
git clone https://github.com/blackbarn/Bookworm.git;
```
Navigate into Bookworm directory
```
cd Bookworm;
```
Install NPM and Bower dependencies
```
npm install && bower install;
```
Build the project
```
gulp;
```

Now that it is initialized, you can start it up!
```
node bin/bookworm.js;
```
or
```
gulp server;
```
or whatever method you wish to use to start up a node script. (supervisor, forever, etc)

For a 'production' environment:

_note, you have a different config json file per environment_

Using gulp server task:
```
gulp --production;
gulp server --production;
```

Using something else:
```
gulp --production;
NODE_ENV=production node bin/bookworm.js; #or whichever command you are using.
```

It defaults to listening on port 3000, but you can change this in the settings.

## API Docs
Bookworm makes use of Swagger to document and publish its API.

To access, start up Bookworm as you would normally and access the local swagger instance:
```
http://host:port/swagger
e.g.,
http://localhost:3000/swagger
```
Once there, you should see the example api. To browse Bookworm's fill in the URL with:
```
http://host:port/api/doc
e.g.,
http://localhost:3000/api/doc
```
Lastly, input your API key (can be found in the general settings page or in your config file) and hit "Explore".

## License
Copyright (c) 2012 Kyle Brown
Licensed under the MIT license.
