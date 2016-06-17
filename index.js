var domain = require('domain')
var curlify = require('request-as-curl')
var debug = require('debug')('barna')
var request = require('request')
var humanizeDuration = require('humanize-duration')

class Barna {

  slack (options) {
    this.slack = options
    if (!options.webhook) {
      debug('Tried to configure a Slack integration but no webhook found')
    }
  }

  start (callback, onError) {
    var d = domain.create()
    d._messages = []
    d._timers = {}
    d.run(callback)
    if (onError) d.on('error', onError)
  }

  log (message) {
    if (domain.active) {
      domain.active._messages.push(message)
    } else {
      debug(`Tried to log message but there's not an active domain. Message = ${message}`)
    }
  }

  send (channel) {
    if (!this.slack || !this.slack.webhook) {
      return debug('Tried to send information to Slack, but it is not configured')
    }
    if (!domain.active) {
      return debug('Tried to send information to Slack, but there is not an active domain')
    }
    var messages = domain.active._messages
    var webhook = this.slack.webhook
    var opts = {
      url: webhook,
      method: 'POST',
      body: JSON.stringify({
        text: messages.join('\n'),
        channel: channel
      })
    }
    request(opts, (err, res, body) => {
      if (err) {
        debug(`Error while sending slack message err=${err}, body=${body}`)
      } else if (res.statusCode === 200) {
        debug('Successfully sent Slack message')
      } else {
        debug(`Slack message not sent. statusCode=${res.statusCode}, Slack response=${body}`)
      }
    })
  }

  express (scope, key, onError) {
    scope = scope || 'query'
    key = key || 'tell'

    return (req, res, next) => {
      var channel = req[scope] && req[scope][key]
      res.on('finish', () => {
        var curl = curlify(req)
        this.log('The request was:\n```' + curl + '```')
        this.send(channel)
      })
      this.start(next, onError)
    }
  }

  time (label, threshold) {
    if (domain.active) {
      domain.active._timers[label] = { start: Date.now(), threshold: threshold }
    } else {
      debug(`Tried to start a timer but there's not an active domain. label = ${label}`)
    }
  }

  timeEnd (label) {
    if (domain.active) {
      var info = domain.active._timers[label]
      if (!info) {
        return debug(`Called timeEnd() but doesn't appear to be called time() first. Label is ${label}`)
      }
      var diff = Date.now() - info.start
      // TODO: if info.threshold > diff
      this.log(`${label}: *${humanizeDuration(diff)}*`)
      delete domain.active._timers[label]
    } else {
      debug(`Tried to end a timer but there's not an active domain. label = ${label}`)
    }
  }

}

var instance = new Barna()
module.exports = instance
