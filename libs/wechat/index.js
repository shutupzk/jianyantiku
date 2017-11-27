import { generateNonceString, getSign, buildXML, parseXML, getRawBody } from './util'
import rp from 'request-promise'
import crypto from 'crypto'

export default class WechatPay {
  constructor({ wechatNativeConfig = {}, wechatConfig = {} }) {
    this.wechatNativeConfig = wechatNativeConfig
    this.wechatConfig = wechatConfig
  }

  request({ params, url = 'https://api.mch.weixin.qq.com/pay/unifiedorder', tradeType, needXml }) {
    let Config = this.wechatConfig
    if (tradeType === 'APP') Config = this.wechatNativeConfig
    params.appid = Config.appid
    params.mch_id = Config.mch_id
    params.nonce_str = generateNonceString()
    params.sign = getSign(params, Config)
    let body = buildXML(params)
    if (needXml) body = buildXML({ xml: params })
    let options = {
      method: 'POST',
      url: url,
      body,
      agentOptions: {
        pfx: Config.pfx,
        passphrase: Config.mch_id
      }
    }
    return rp(options)
  }

  // 微信通知数据校验
  async veryfy(req) {
    const data = await this.getNotifyData(req)
    let self = this.wechatConfig
    if (data.trade_type === 'APP') {
      self = this.wechatNativeConfig
    }
    if (data.return_code === 'FAIL' || data.result_code === 'FAIL') {
      return data.return_msg
    } else if (self.appid !== data.appid) {
      return 'InvalidAppId'
    } else if (self.mch_id !== data.mch_id) {
      return 'InvalidMchId'
    } else if (self.sub_mch_id && self.sub_mch_id !== data.sub_mch_id) {
      return 'InvalidSubMchId'
    }
    // if (self._getSign(data) !== data.sign) {
    //   return 'InvalidSignature'
    // }
    return null
  }

  // 获取微信返回数据
  async getNotifyData(req) {
    const xml = await getRawBody(req)
    const json = await parseXML(xml)
    const data = json || {}
    return data
  }

  // 微信通知返回
  async notifyBack(res, success = true, errorMsg) {
    let xml = {}
    if (success) {
      xml.return_code = 'SUCCESS'
    } else {
      xml.return_code = 'FAIL'
      xml.return_msg = errorMsg
    }
    return res.send(buildXML({ xml }))
  }

  async createWechatOrder({ out_trade_no, total_fee, openid, body }) {
    let params = {
      body,
      notify_url: this.wechatConfig.wechat_notify_url,
      out_trade_no,
      spbill_create_ip: this.wechatConfig.wechat_spbill_create_ip,
      total_fee,
      trade_type: 'JSAPI',
      openid
    }
    const xml = await this.request({ params, tradeType: 'JSAPI' })
    let json = await parseXML(xml)
    if (json.return_code !== 'SUCCESS' || json.result_code !== 'SUCCESS') {
      throw new Error(json.return_msg)
    }
    const { appid } = json
    let prepayId = json.prepay_id
    let key = this.wechatConfig.partner_key
    let signtype = 'MD5'
    let timestamp = Math.floor(Date.now() / 1000) + ''
    let _package = 'prepay_id=' + prepayId
    let string = 'appId=' + appid + '&nonceStr=' + generateNonceString() + '&package=' + _package + '&signType=' + signtype + '&timeStamp=' + timestamp + '&key=' + key
    let signature = crypto
      .createHash('md5')
      .update(string)
      .digest('hex')
      .toUpperCase()
    return {
      appId: appid,
      nonceStr: generateNonceString(),
      package: _package,
      signType: 'MD5',
      timeStamp: timestamp,
      paySign: signature
    }
  }

  async createAppOrder({ body, out_trade_no, total_fee }) {
    let params = {
      body,
      out_trade_no,
      total_fee,
      spbill_create_ip: this.wechatNativeConfig.wechat_spbill_create_ip,
      notify_url: this.wechatNativeConfig.wechat_notify_url,
      trade_type: 'APP'
    }
    console.log('params ======= ', params, this.wechatNativeConfig)
    const xml = await this.request({ params, tradeType: 'APP' })
    const json = await parseXML(xml)
    if (json.return_code !== 'SUCCESS' || json.result_code !== 'SUCCESS') {
      throw new Error(json.return_msg)
    }
    const { appid, mch_id, prepay_id } = json
    let data = {
      appid,
      partnerid: mch_id,
      prepayid: prepay_id,
      package: 'Sign=WXPay',
      noncestr: generateNonceString(),
      timestamp: Math.floor(Date.now() / 1000) + ''
    }
    const sign = getSign(data, this.wechatNativeConfig)
    data.sign = sign
    return data
  }

  async refundApp({ out_trade_no, total_fee, refund_fee, refund_desc, out_refund_no }) {
    let params = {
      out_trade_no,
      total_fee,
      refund_fee,
      refund_desc,
      out_refund_no
    }
    const xml = await this.request({
      params,
      url: 'https://api.mch.weixin.qq.com/secapi/pay/refund',
      tradeType: 'APP',
      needXml: true
    })
    const json = await parseXML(xml)
    if (json.return_code !== 'SUCCESS' || json.result_code !== 'SUCCESS') throw new Error(json.return_msg)
    return json
  }

  async refundWechat({ out_trade_no, total_fee, refund_fee, refund_desc, out_refund_no }, callback) {
    let params = {
      out_trade_no,
      total_fee,
      refund_fee,
      refund_desc,
      out_refund_no
    }
    const xml = await this.request({
      params,
      url: 'https://api.mch.weixin.qq.com/secapi/pay/refund',
      tradeType: 'JSAPI',
      needXml: true
    })
    const json = await parseXML(xml)
    if (json.return_code !== 'SUCCESS' || json.result_code !== 'SUCCESS') throw new Error(json.return_msg)
    return json
  }
}
