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
      let left = (Math.abs(leftY) < 20) ? 0 : (-2 * leftY)
      let right = (Math.abs(rightY) < 20) ? 0 : (-2 * rightY)

      this.server.send('move', { left, right })
    })
  }
}

new Command().run()
