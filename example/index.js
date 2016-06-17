var express = require('express')
var barna = require('../')
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
