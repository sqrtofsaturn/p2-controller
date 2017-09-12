#!/usr/bin/env node

const Server = require('./lib/Server')
const XboxController = require('./lib/XboxController')

class Command {
  constructor() {
    this.server = new Server({ port: 3000 })
    this.xboxController = new XboxController()
  }

  run() {
    this.server.listen((error, address) => {
      if (error) throw error
      console.log(`Listening on: ${address}`)
    })
    this.xboxController.on('sticks', ({ leftY, rightY }) => {
      const left = 2 * (leftY - 128)
      const right = 2 * (rightY - 128)

      this.server.send('move', { left, right })
    })
  }
}

new Command().run()
