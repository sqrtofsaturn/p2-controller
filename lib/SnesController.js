const { EventEmitter } = require('events')
const bindAll = require('lodash/fp/bindAll')
const filter = require('lodash/fp/filter')
const find = require('lodash/fp/find')
const first = require('lodash/fp/first')
const isEmpty = require('lodash/fp/isEmpty')
const padCharsStart = require('lodash/fp/padCharsStart')
const map = require('lodash/fp/map')
const size = require('lodash/fp/size')
const HID = require('node-hid')

const PRODUCT_ID = 8288
const VENDOR_ID = 1411

class SnesController extends EventEmitter {
  constructor({ path }) {
    super()
    bindAll(Object.getOwnPropertyNames(SnesController.prototype), this)

    this.controller = this.getDevice({ path })
    this.controller.on('data', (data) => {
      const [horizontal, vertical, buttons] = new Uint8Array(data)

      const controllerData = {
        dpad: {
          horizontal: -1 * Math.round((horizontal -128) / 128),
          vertical: -1 * Math.round((vertical -128) / 128),
        },
        buttons: this.unpackButtons(buttons)
      }

      this.emit('data', controllerData)
    })
  }

  unpackButtons(buttons) {
    const parseBool = (str) => str === '1'
    const [start, select, r, l, y, x, b, a] = map(parseBool, padCharsStart('0', 8, buttons.toString(2)))
    return { a, b, x, y, l, r, select, start }
  }

  getDevice({ path }) {
    if (isEmpty(path)) {
      return this.getFirstDevice()
    }

    return new HID.HID(path)
  }

  getFirstDevice() {
    const devices = filter({ productId: PRODUCT_ID, vendorId: VENDOR_ID }, HID.devices())

    if (isEmpty(devices)) throw new Error("No controllers found.")
    if (size(devices) == 1) return first(devices)

    // console.log('devices', JSON.stringify(devices, null, 2))
    const paths = map('path', devices)
    const device = first(devices)
    console.warn(`found multiple snes controllers: ${JSON.stringify(paths)}. Defaulting to: ${device.path}`)
    return new HID.HID(device.path)
  }
}

module.exports = SnesController
