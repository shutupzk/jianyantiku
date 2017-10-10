import xml2js from 'xml2js'
var md5 = require('MD5')

export const buildXML = json => {
  let builder = new xml2js.Builder()
  return builder.buildObject(json)
}

export const parseXML = xml => {
  let parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false })
  return new Promise((resolve, reject) => {
    parser.parseString(xml, (err, json) => {
      if (err) return reject(err)
      resolve(json)
    })
  })
}

export const pipe = ({ stream, fn }) => {
  let buffers = []
  stream.on('data', trunk => {
    buffers.push(trunk)
  })
  stream.on('end', () => {
    fn(null, Buffer.concat(buffers))
  })
  stream.once('error', fn)
}

export const mix = () => {
  let root = arguments[0]
  if (arguments.length === 1) {
    return root
  }
  for (let i = 1; i < arguments.length; i++) {
    for (let k in arguments[i]) {
      root[k] = arguments[i][k]
    }
  }
  return root
}

export const generateNonceString = length => {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let maxPos = chars.length
  let noceStr = ''
  for (let i = 0; i < (length || 32); i++) {
    noceStr += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return noceStr
}

export const getSign = (param, config) => {
  let querystring =
    Object.keys(param)
      .filter(function(key) {
        return param[key] !== undefined && param[key] !== '' && ['pfx', 'partner_key', 'sign', 'key'].indexOf(key) < 0
      })
      .sort()
      .map(function(key) {
        return key + '=' + param[key]
      })
      .join('&') +
    '&key=' +
    config.partner_key
  return md5(querystring).toUpperCase()
}

export const getRawBody = req => {
  return new Promise((resolve, reject) => {
    if (req.rawBody) {
      return resolve(req.rawBody)
    }

    let data = ''
    req.setEncoding('utf8')
    req.on('data', function(chunk) {
      data += chunk
    })

    req.on('end', function() {
      req.rawBody = data
      resolve(data)
    })
  })
}
