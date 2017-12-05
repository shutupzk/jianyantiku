import WechatPay from '../libs/wechat'
import { wechatNativeConfig } from '../config'
import { createTradeNo } from '../utils'
import moment from 'moment'

const wechatPay = new WechatPay({ wechatNativeConfig })
export default function paymentRouter(app) {
  app.all('/payment/wechat/notify', async (req, res) => {
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

  app.all('/payment/total', async (req, res) => {
    const { Payment } = req.context
    const payments = await Payment.collection.find({ status: 'TRADE_SUCCESS' }).toArray()
    let total = 0
    for (let { totalFee } of payments) {
      total += totalFee
    }
    return res.json({ total })
  })

  app.all('/payment/years', async (req, res) => {
    const { Payment } = req.context
    let years = []
    let yearDatas = []
    let yearList = {}
    let begin = 2017
    let end = moment().year()
    for (let i = begin; i < end + 1; i++) {
      years.push(i)
      yearDatas.push(0)
      yearList[i] = 0
    }
    const payments = await Payment.collection.find({ status: 'TRADE_SUCCESS' }).toArray()
    for (let { totalFee, createdAt } of payments) {
      let year = moment(createdAt).year()
      let index = years.indexOf(year)
      yearDatas[index] += totalFee
      yearList[year] += totalFee
    }
    return res.json({ years, yearDatas, yearList })
  })

  app.all('/payment/months', async (req, res) => {
    const { Payment } = req.context
    let begin = '2017-10'
    let end = moment().format('YYYY-MM')
    let months = []
    let monthsData = []
    let monthList = {}
    next(begin)
    function next (time) {
      months.push(time)
      monthsData.push(0)
      monthList[time] = 0
      if (time === end) {
        return months
      } else {
        return next(moment(time).add(1, 'month').format('YYYY-MM'))
      }
    }
    const payments = await Payment.collection.find({ status: 'TRADE_SUCCESS' }).toArray()
    for (let { totalFee, createdAt } of payments) {
      let month = moment(createdAt).format('YYYY-MM-DD')
      let index = months.indexOf(month)
      monthsData[index] += totalFee
      monthList[month] += totalFee
    }
    return res.json({ months, monthsData, monthList })
  })
}
