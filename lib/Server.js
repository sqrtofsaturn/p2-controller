const WebSocket = require('ws')

class Server {
  constructor({ port }) {
    this.port = port
  }

  listen(callback) {
    this.wss = new WebSocket.Server({ port: this.port }, (error) => {
      if (error) return callback(error)

      callback(null, `0.0.0.0:${this.port}`)
    })
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
