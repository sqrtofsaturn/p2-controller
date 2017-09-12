const { EventEmitter } = require('events')
const HID = require('node-hid')

const PRODUCT_ID = 654
const VENDOR_ID = 1118

class XboxController extends EventEmitter {
  constructor() {
    super()
    try {
      this.controller = new HID.HID(VENDOR_ID, PRODUCT_ID)
    } catch (error) {
      return
    }

    this.controller.on('data', (data) => {
      const leftX = data[6]
      const leftY = 255 - data[8]
      const rightX = data[10]
      const rightY = 255 - data[12]
      this.emit('sticks', { leftX, leftY, rightX, rightY })
    })
  }
}

module.exports = XboxController
