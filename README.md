# Bookworm

Bookworm is a Book NZB Searcher and Grabber.

It utilizes the vast Public Google Books API for book information.

It is built with NodeJS, ExpressJS and AngularJS with JugglingDB (Sqlite) as a store.

Add your favorite authors, mark books as wanted, search nzb providers for these books and download them with SABnzbd!

_Currently only Newznab providers are supported for search providers, and SABNzbd for download providers. More to be implemented in the future._

_Bookworm can be considered in Alpha, it is still in active development and should be used at your own risk, it may not work for you_

## Notes/Tips

Google Books has a vast database of information. However due to this some results may be inaccurate or unreliable. Use the 'exclude' feature to remove books from view that you do not care about.

Bookworm currently only supports newznab providers for searching, SABnzbd for downloading and Notify My Android for notifications. This is simply what has been done so far as it is what I use.

Google has recently started enforcing a requests per day limit on the Google Books API.
[Reference](http://productforums.google.com/forum/#!msg/books-api/64GYbc9sRW4/jD8CNdpcPhMJ)
The limit is 1000 Requests per day.

You may need to set up a [Google API Console](https://code.google.com/apis/console/) account to retrieve a Google Books API Key.
It will come with 1000 requests/day quota, you can request more if you wish via an online form.

You can place your API key in the settings of Bookworm.

## Getting Started

You will need a few things (currently) in order to set up Bookworm.

* Git http://git-scm.com/
* Node (NPM is included) http://nodejs.org/download/
* Bower https://github.com/twitter/bower
* Grunt-CLI http://gruntjs.com/getting-started

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
grunt;
```

Now that it is initialized, you can start it up!
```
node bin/bookworm.js;
```
or
```
grunt server;
```
or whatever method you wish to use to start up a node script. (supervisor, forever, etc)

For a 'production' environment:

_note, you have a different config json file per environment_

If using grunt server:
```
grunt server:dist;
```

If using other:
```
grunt build:prod;
NODE_ENV=production node bin/bookworm.js; #or whichever command you are using.
```

It defaults to listening on port 3000, but you can change this in the settings.

## License
Copyright (c) 2012 Kyle Brown
Licensed under the MIT license.
