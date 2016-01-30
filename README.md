[![Studio Center Logo](https://studiocenter.com/sites/default/files/homepage-header.png)](https://studiocenter.com/)

[![Build Status](https://travis-ci.org/Studio-Center/sc-auditions.svg?branch=master)](https://travis-ci.org/Studio-Center/sc-auditions)

Studio Center Auditions Web Application developed using the MEAN.JS stack.

## Overview

System allows for audio engineers to create projects, upload scripts and reference files talents, along with posting any related text, links, etc. Once projects are created audio engineers or project managers can add clients or clients of clients to the project. Talent can upload auditions through a custom link or audio engineers or project managers can upload mp3 files by dropping files into a drop box or using the find file dialogue. If talent is already assigned to the project and the audition audio file names are properly formed the talent whose audition was uploaded will automatically be assigned to the audition file. Once an audition file has been uploaded it can then be played back within the browser by clicking the play button for that audio file.

Clients are given a client portal which allows them to playback and rank auditions. Within this interface clients can also hide and download audio files they would like to store on their machine. Clients are also given the option to rank and book auditions within the client portal. All admin and client interfaces are built using the twitter bootstrap front-end library to be responsive and provide support for any device.

## Requirements

- **NodeJS 0.10.4**
- **Redis-Server**
- **MongoDB**
- **Bower**
- **Grunt**
- **Socket.io**
- More dependencies can be found within package.json and bower.json

## Installation

```
npm install
```

Bower might have some dependency problems

```
bower update
```

## Start the app

```
grunt
```

Alternately you could run the app with forever.js

```
forever start server.js
```

The app is threaded using cluster and should take advantage of however many CPU cores you have available without any special configuration.

## Create your admin user

Simply load up the app then create a new user within the web interface. Once created open up mongo shell and replace the users default group with that of the admin group.

Something like this:

```
mongo
show dbs
use my-selected-db
show collections
db.users.update({},{$set:{'roles':["admin"]}})
```

## Move to production

Rename config/env/production-demo.js or copy to config/env/production.js and apply changes as needed for your production environment. Set your NODE_ENV environment variable to production then launch your app using grunt, forever, or whatever way you would like. For a single NodeJS production instance the string below will do.

```
NODE_ENV=production forever start server.js
```

or

```
NODE_ENV=production grunt
```
