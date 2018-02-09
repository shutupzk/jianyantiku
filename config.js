import fs from 'fs'
import path from 'path'

let MONGO_HOST = 'localhost'
if (process.env.SERVER) {
  MONGO_HOST = '47.92.128.90'
}

const MONGO_URL = `mongodb://jianyantiku:jianyantiku@${MONGO_HOST}:27017/jianyantiku`
const GRAPHQL_PORT = '9000'

const wechatNativeConfig = {
  appid: 'wxb1c18a4d4d631a9a',
  mch_id: '1489969592', // 微信支付分配的商户号
  partner_key: 'wrtk1234wrtk1234wrtk1234wrtk1234', // 微信商户平台API密钥
  pfx: fs.readFileSync(path.join(__dirname, 'wechatConfig/apiclient_cert.p12')), // 微信商户平台证书
  wechat_spbill_create_ip: '47.92.71.113',
  wechat_notify_url: 'http://47.92.71.113:9000/payment/wechat/notify'
}

const easeConfig = {
  appKey: '1104171206178491#medicallib',
  clientSecret: 'YXA64MTvh4fqM2ld-xFoWLReuA-wcrk',
  clientId: 'YXA6ZZiNwNpoEeeER6lzCvntDQ',
  orgName: '1104171206178491',
  appName: 'medicallib'
}

export { MONGO_URL, GRAPHQL_PORT, wechatNativeConfig, easeConfig }
