import WechatPay from '../libs/wechat'
import { wechatNativeConfig } from '../config'
import { createTradeNo } from '../utils'
import moment from 'moment'

const wechatPay = new WechatPay({ wechatNativeConfig })
export default function paymentRouter(app) {
  app.all('payment/wechat/notify', async (req, res) => {
    const { Payment, UserMember, ScoreRecord, ScoreType } = req.context
    const errorMsg = await wechatPay.veryfy(req)
    let success = true
    if (errorMsg) {
      success = false
    }
    await wechatPay.notifyBack(res, success, errorMsg)
    if (!success) return
    const message = await wechatPay.getNotifyData(req)
    let tradeNo = message.transaction_id
    let outTradeNo = message.out_trade_no
    let payTime = message.time_end
    const { _id, status, memberChargeId, userId, totalFee, payWay } = await Payment.collection.findOne({ outTradeNo })
    if (status !== 'WAIT_FOR_PAY') return
    const paymentId = _id
    Payment.updateById(paymentId, { tradeNo, payTime, status: 'TRADE_SUCCESS', payNotifyData: message })
    try {
      if (memberChargeId) {
        await UserMember.addUserMember({ userId, memberChargeId })
      } else {
        const { _id, score } = await ScoreType.collection.findOne({ code: '1' })
        await ScoreRecord.insert({ score: Math.round(totalFee * score) * 1, scoreTypeId: _id, userId })
      }
      await Payment.updateById(paymentId, { bussStatus: true })
    } catch (e) {
      console.log(e)
      const refundFee = Math.round(totalFee * 100) * 1
      let ops = { out_trade_no: outTradeNo, total_fee: refundFee, refund_fee: refundFee, refund_desc: '', out_refund_no: createTradeNo() }
      let refundNotifyData
      if (payWay === 'NATIVE') {
        refundNotifyData = await wechatPay.refundApp(ops)
      } else if (payWay === 'WECHAT') {
        refundNotifyData = await wechatPay.refundWechat(ops)
      }
      Payment.updateById(paymentId, { tradeNo, refundTime: moment().format('YYYY-MM-DD HH:mm:ss'), status: 'REFUND_SUCCESS', refundNotifyData })
    }
  })
}
