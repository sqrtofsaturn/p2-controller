const identity = require('lodash/fp/identity')
const isEmpty = require('lodash/fp/isEmpty')
const nth = require('lodash/fp/nth')
const size = require('lodash/fp/size')
const sortBy = require('lodash/fp/sortBy')
const sort = sortBy(identity)

const median = (list) => {
  if (isEmpty(list)) return null

  const sortedList = sort(list)
  const n = parseInt(size(list) / 2)

  const item1 = nth(n - 1, sortedList)
  const item2 = nth(n, sortedList)

  if (size(list) % 2 === 1) return item1
  return (item1 + item2) / 2
}

module.exports = median
