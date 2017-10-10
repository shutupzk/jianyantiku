import WechatPay from '../libs/wechat'
import { wechatNativeConfig } from '../config'
import { createTradeNo, createTransactionNo } from '../utils'

const wechatPay = new WechatPay({ wechatNativeConfig })

const resolvers = {
  Payment: {
    id(payment) {
      return payment._id
    },

    user(payment, args, { Payment }) {
      return Payment.user(payment)
    }
  },
  Query: {
    payments(root, { skip, limit }, { Payment }) {
      return Payment.all({ skip, limit })
    },

    payment(root, { id }, { Payment }) {
      return Payment.findOneById(id)
    }
  },
  Mutation: {
    async createMemberPay(root, { input }, { Payment, MemberCharge, User }) {
      const { userId, memberChargeId, payWay } = input
      const user = await User.findOneById(userId)
      const memberCharge = await MemberCharge.findOneById(memberChargeId)
      if (!user) throw new Error('用户不存在')
      if (!memberCharge) throw new Error('会员项目部存在')
      return insertPayment(input, { totalFee: memberCharge.price, payWay, phone: user.phone, type: 'MEMBER' }, Payment)
    },

    async createScorePay(root, { input }, { Payment, User }) {
      const { userId, payWay, totalFee } = input
      const user = await User.findOneById(userId)
      if (!user) throw new Error('用户不存在')
      return insertPayment(input, { totalFee, payWay, phone: user.phone, type: 'SCORE' }, Payment)
    },

    async updatePayment(root, { id, input }, { Payment }) {
      await Payment.updateById(id, input)
      return Payment.findOneById(id)
    },

    removePayment(root, { id }, { Payment }) {
      return Payment.removeById(id)
    }
  }
}

async function insertPayment(input, { totalFee, payWay, phone, type }, Payment) {
  const outTradeNo = createTradeNo()
  const transactionNo = createTransactionNo()
  let orderInfo
  const status = 'WAIT_FOR_PAY'
  const bussStatus = false
  let result
  try {
    if (payWay === 'NATIVE') {
      result = await wechatPay.createAppOrder({ body: `${phone}会员充值`, out_trade_no: outTradeNo, total_fee: totalFee })
    } else if (payWay === 'WECHAT') {
      result = await wechatPay.createWechatOrder({ body: `${phone}会员充值`, out_trade_no: outTradeNo, total_fee: totalFee, openid: input.openid })
    } else {
      throw new Error('支付方式不正确')
    }
    orderInfo = JSON.stringify(result)
  } catch (e) {
    throw e
  }
  const id = await Payment.insert(Object.assign({}, input, { outTradeNo, transactionNo, orderInfo, totalFee, type, status, bussStatus }))
  return Payment.findOneById(id)
}

export default resolvers
