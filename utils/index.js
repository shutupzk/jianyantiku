import moment from 'moment'
import crypto from 'crypto'

// MD5签名
export const md5 = str => {
  let md5sum = crypto.createHash('md5')
  md5sum.update(str)
  str = md5sum.digest('hex')
  return str
}

export const checkPhoneNumber = phone => {
  const r = /(1([34578][0-9]))\d{8}/
  return r.test(phone) && phone.length === 11
}

export const subBirthday = certNo => {
  return certNo.substr(6, 4) + '-' + certNo.substr(10, 2) + '-' + certNo.substr(12, 2)
}

export const subSex = certNo => {
  return certNo.substr(16, 1) % 2 + ''
}

export const getAge = birthDay => {
  return moment().format('YYYY') * 1 - birthDay.substr(0, 4) * 1
}

export const createTradeNo = () => {
  let year = moment().format('YY') * 1 - 15
  let seconds = moment().format('DDD') * 24 * 60 * 60 + moment().format('HH') * 60 * 60 + moment().format('mm') * 60 + moment().format('ss') * 1
  let order = seconds.toString(36)
  order = secondsFormat(order, 5)
  let ran = (Math.random() + '').substr(4, 3) + moment().format('SSS')
  let random = (ran * 1).toString(36)
  random = secondsFormat(random, 4)
  order = year.toString(36) + order
  order += random
  return order.toUpperCase()
}

export const createTransactionNo = () => {
  let date = moment().format('YYYYMMDDHHmmss')
  let sss = moment().format('SSS')
  sss = secondsFormat(sss, 3)
  let r1 = (Math.random() + '').substr(4, 3)
  let r2 = (Math.random() + '').substr(4, 3)
  let r3 = (Math.random() + '').substr(4, 3)
  let r4 = (Math.random() + '').substr(4, 3)
  return date + sss + r1 + r2 + r3 + r4
}

export const getInsertId = upsertResult => {
  const { lastErrorObject, value } = upsertResult
  let insertId
  if (value) {
    insertId = value._id
  } else {
    insertId = lastErrorObject.upserted
  }
  return insertId
}

export const responseTime = function() {
  return function(req, res, next) {
    req._startTime = new Date() // 获取时间 t1

    let calResponseTime = function() {
      let now = new Date() // 获取时间 t2
      let deltaTime = now - req._startTime
      console.log(deltaTime + 'ms')
    }

    res.once('finish', calResponseTime)
    res.once('close', calResponseTime)
    return next()
  }
}

function secondsFormat(str, length) {
  if (str.length >= length) {
    return str
  } else {
    for (; str.length < length;) {
      str = '0' + str
    }
    return str
  }
}
