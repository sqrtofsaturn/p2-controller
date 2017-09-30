#!/usr/bin/env node

const identity = require('lodash/fp/identity')
const minBy = require('lodash/fp/minBy')
const isNumber = require('lodash/fp/isNumber')
const size = require('lodash/fp/size')
const OctoDash = require('octodash')
const ThinRedLine = require('thin-red-line')

const median = require('./lib/median')
const Server = require('./lib/Server')
const SnesController = require('./lib/SnesController')

const min = minBy(identity)

const OPTIONS = [{
  names: ['path'],
  type: 'string',
  help: 'Path of the Snes controller to connect to. Will default to first available',
}, {
  names: ['port', 'p'],
  type: 'integer',
  help: 'Port to expose the Websocket on',
  env: 'PORT',
  default: 3000,
}]

class Command {
  constructor({ argv }) {
    const { path, port } = new OctoDash({ argv, cliOptions: OPTIONS }).parseOptions()
    this.server = new Server({ port })
    this.snesController = new SnesController({ path })
    this.go = true
    this.distances = []
    this.direction = 0
    this.redLine = new ThinRedLine({imageStreamUrl: 'http://bill.local:8081'})
  }

  run() {
    this.redLine.do()
    this.server.listen((error, address) => {
      if (error) throw error
      console.log(`Listening on: ${address}`)
    })

    this.server.on('accelerometer', ({ x, y, z }) => {
      console.log('accelerometer', { x, y, z })
    })

    this.server.on('distance', ({ distance }) => {
      this.distances.push(distance)
      console.log('distance', median(this.distances))
      this.go = median(this.distances) > 30
      if (size(this.distances) > 5) {
        this.distances.shift()
      }
    })

    this.redLine.on('data', (direction) => {
      if (!isNumber(direction)) return
      this.direction = direction * 2
    })

    this.snesController.on('data', ({ dpad, buttons }) => {
      const { horizontal, vertical } = dpad
      const { l, r, b } = buttons

      let left = parseInt(100 * (-1 * this.direction))
      let right = parseInt(100 * (this.direction))
      left += 100
      right += 100
      this.server.send('move', { left, right })

      // let left = 0
      // let right = 0
      // if (l) {
      //   left = -255
      //   right = -255
      // }
      //
      // if (r) {
      //   left = 255
      //   right = 255
      // }
      //
      // if (horizontal < 0) {
      //   left -= 255
      //   right += 255
      // }
      //
      // if (horizontal > 0) {
      //   left += 255
      //   right -= 255
      // }
      //
      // if (b) {
      //   left = parseInt(left / 2)
      //   right = parseInt(right / 2)
      // }
      //
      // if (!this.go) {
      //   left = min([-128, left])
      //   right = min([-128, right])
      // }
      //
      // this.server.send('move', { left, right })
    })
  }
}

new Command({ argv: process.argv }).run()
