import WechatPay from '../libs/wechat'
import { wechatNativeConfig } from '../config'
import { createTradeNo } from '../utils'
import moment from 'moment'
import { ObjectId } from 'mongodb'

const wechatPay = new WechatPay({ wechatNativeConfig })
export default function paymentRouter(app) {
  app.all('/payment/wechat/notify', async (req, res) => {
    const { Payment, UserMember, ScoreRecord, ScoreType, User } = req.context
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
    let { payFee } = await User.findOneById(userId)
    try {
      if (memberChargeId) {
        await UserMember.addUserMember({ userId, memberChargeId })
      } else {
        const { _id, score } = await ScoreType.collection.findOne({ code: '1' })
        await ScoreRecord.insert({ score: Math.round(totalFee * score) * 1, scoreTypeId: _id, userId })
      }
      await Payment.updateById(paymentId, { bussStatus: true })
      payFee = payFee || 0
      User.updateById(userId, { payFee: payFee + totalFee })
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

  app.all('/payment/updateUserPayfee', async (req, res) => {
    const { Payment, User } = req.context
    const payments = await Payment.collection.find({ status: 'TRADE_SUCCESS' }).toArray()
    let users = {}
    for (let { userId, totalFee } of payments) {
      let fee = totalFee * 100
      if (users[userId]) {
        users[userId] += fee
      } else {
        users[userId] = fee
      }
    }
    for (let userId in users) {
      User.updateById(ObjectId(userId), { payFee: users[userId] / 100 })
    }
    return res.json({ code: 'ok' })
  })

  app.all('/payment/updatePayment', async (req, res) => {
    const { Payment } = req.context
    const payments = await Payment.collection.find({ status: 'TRADE_SUCCESS', userId: ObjectId('5a153666cc03894e54d9b5b8') }).toArray()
    for (let { _id, totalFee, payNotifyData } of payments) {
      let realTotalFee = payNotifyData.total_fee * 1 / 100
      console.log(totalFee, realTotalFee)
      Payment.updateById(_id, { totalFee: realTotalFee })
    }
    return res.json({ code: 'ok' })
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
    let total = 0
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
      total += totalFee
    }
    return res.json({ total, years, yearDatas, yearList })
  })

  app.all('/payment/months', async (req, res) => {
    const { Payment } = req.context
    let begin = '2017-10'
    let end = moment().format('YYYY-MM')
    let months = []
    let monthsData = []
    let monthList = {}
    let total = 0
    next(begin)
    function next(time) {
      months.push(time)
      monthsData.push(0)
      monthList[time] = 0
      if (time === end) {
        return months
      } else {
        return next(
          moment(time)
            .add(1, 'month')
            .format('YYYY-MM')
        )
      }
    }
    const payments = await Payment.collection.find({ status: 'TRADE_SUCCESS' }).toArray()
    for (let { totalFee, createdAt } of payments) {
      let month = moment(createdAt).format('YYYY-MM')
      let index = months.indexOf(month)
      monthsData[index] += totalFee
      monthList[month] += totalFee
      total += totalFee
    }
    return res.json({ total, months, monthsData, monthList })
  })
}
