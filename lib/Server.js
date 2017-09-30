const { EventEmitter } = require('events')
const bindAll = require('lodash/fp/bindAll')
const WebSocket = require('ws')
const median = require('./median')

class Server extends EventEmitter {
  constructor({ port }) {
    super()
    bindAll(Object.getOwnPropertyNames(Server.prototype), this)
    this.port = port
    this.distances = []
  }

  listen(callback) {
    this.wss = new WebSocket.Server({ port: this.port }, (error) => {
      if (error) return callback(error)

      callback(null, `0.0.0.0:${this.port}`)
    })

    this.wss.on('connection', ws => ws.on('message', this.onMessage))
  }

  onMessage(message) {
    const [action, data] = JSON.parse(message)
    this.emit(action, data)
  }

  send(action, options) {
    if (!this.wss) throw new Error('listen has not been called yet')

    this.wss.clients.forEach((client) => {
      if (client === WebSocket || client.readyState !== WebSocket.OPEN) return

      client.send(JSON.stringify([action, options]))
    })
  }
}

module.exports = Server
