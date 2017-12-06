import rp from 'request-promise'
import config from './config'
import cacheManager from 'cache-manager'

const memoryCache = cacheManager.caching({ store: 'memory', max: 100, ttl: 10 })

// 基础地址
const baseUrl = 'https://a1.easemob.com/' + config.orgName + '/' + config.appName

// 请求方法
const request = (json, url, token, method = 'POST') => {
  let headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = 'Bearer ' + token
  let options = {
    method,
    url,
    json,
    headers
  }
  return rp(options)
}

/**
 * 获取token
 */
export const getToken = async () => {
  var key = config.appKey
  const param = {
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret
  }
  const url = baseUrl + '/token'
  try {
    let token = await memoryCache.get(key)
    if (token) return token
    let { access_token, expires_in } = await request(param, url)
    const ttl = expires_in - 600
    await memoryCache.set(key, access_token, { ttl })
    return access_token
  } catch (e) {
    throw new Error('getToken error')
  }
}

/**
 * 获取用户
 */
export const getUser = async ({ username }) => {
  const token = await getToken()
  const url = baseUrl + '/users/' + username
  console.log(url)
  const method = 'GET'
  return request({}, url, token, method)
}

/**
 * 创建用户
 */
export const createUser = async ({ username, password, nickname }) => {
  const token = await getToken()
  const url = baseUrl + '/users'
  return request({ username, password, nickname }, url, token)
}

/**
 * 发送文本消息
 * target_type :users 给用户发消息。chatgroups: 给群发消息，chatrooms: 给聊天室发消息
 * target: 注意这里需要用数组，数组长度建议不大于20，即使只有一个用户，也要用数组 ['u1']，给用户发送时数组元素是用户名，给群组发送时 数组元素是groupid
 * msg: 消息内容
 * from: 表示消息发送者。不传默认 admin
 */
export const sendText = async ({ target_type = 'users', target = [], msg = '', from = 'admin' }) => {
  const type = 'txt'
  const url = baseUrl + '/messages'
  const json = {
    target_type,
    target,
    msg: {
      type,
      msg
    },
    from
  }
  const token = await getToken()
  return request(json, url, token)
}
