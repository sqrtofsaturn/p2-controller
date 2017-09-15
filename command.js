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
      let right = (Math.abs(leftY) < 20) ? 0 : (2 * leftY)
      let left = (Math.abs(rightY) < 20) ? 0 : (2 * rightY)

      if (right > 250) right = 256
      if (right < -250) right = -256

      this.server.send('move', { left, right })
    })
  }
}

new Command().run()
