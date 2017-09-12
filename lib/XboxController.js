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
      const array = new Int8Array(data)
      console.log('array', array)
      const leftX = array[7]
      const leftY = array[9]
      const rightX = array[11]
      const rightY = array[13]
      this.emit('sticks', { leftX, leftY, rightX, rightY })
    })
  }
}

module.exports = XboxController
