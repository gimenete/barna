# barna

A tiny library to send debugging information to Slack

## Installing

```
npm install barna --save
```

## Basic usage

```javascript
// Configure barna
var barna = require('barna')
barna.slack({ webhook: process.env.SLACK_WEBHOOK })

// Timing things
barna.time('database')
// ...
barna.timeEnd('database')

// Printing markdown messages
barna.log('```SQL or whatever you want to print here```')
```

## Usage with express

There's a middleware already ready to be used for express. Just use `app.use(barna.express())`.

`.express()` accepts two arguments that by default are `barna.express('query', 'tell')`. These parameters tell `barna` where to find the channel or username to which send the report information. The first argument can be `body`, `headers`, `query` or `params` and the second parameter is the name of the field.

This middleware will also add a CURL command at the end of the report that will let you reproduce the request.

Full example:

```javascript
var express = require('express')
var barna = require('barna')
barna.slack({ webhook: process.env.SLACK_WEBHOOK })

var app = express()
app.use(barna.express())

app.get('/', (req, res) => {
  barna.time('database')
  setTimeout(() => {
    barna.timeEnd('database')
    barna.log('```SQL or whatever you want to print here```')
    res.send('hello world')
  }, 300)
})

var port = +process.env.PORT || 3000
app.listen(port)
console.log('Server listening at http://localhost:%d', port)
```

Now you can invoke `http://localhost:3000/?tell=@somebody` to send a report of a user, or `http://localhost:3000/?tell=%23channel` to send the report to a channel (%23 is the # symbol escaped).

## Usage with any framework

```javascript
barna.start(() => {
  barna.time('database')
  setTimeout(() => {
    barna.timeEnd('database')
    barna.log('```SQL or whatever you want to print here```')
    barna.send('@username')
  }, 300)
})
```
