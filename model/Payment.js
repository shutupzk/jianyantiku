import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'
import moment from 'moment'

export default class Payment {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('payment')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  async all({ skip = 0, limit = 10, name, tradeNo }) {
    let ops = { status: { $ne: 'WAIT_FOR_PAY' } }
    const { User } = this.context
    if (name) {
      let users = await User.collection.find({$or: [{ phone: { $regex: name, $options: 'i' } }, { name: { $regex: name, $options: 'i' } }]}).toArray()
      let userIds = []
      for (let user of users) {
        userIds.push(user._id)
      }
      ops['userId'] = {$in: userIds}
    }
    if (tradeNo) {
      ops['$or'] = [{ outTradeNo: { $regex: tradeNo, $options: 'i' } }, { tradeNo: { $regex: tradeNo, $options: 'i' } }]
    }
    return this.collection
      .find(ops)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  user(payment) {
    return this.context.User.findOneById(payment.userId)
  }

  memberCharge(payment) {
    if (!payment.memberChargeId) return null
    return this.context.MemberCharge.findOneById(payment.memberChargeId)
  }

  async insert(doc) {
    const { ScoreRecord } = this.context
    const { userId, type } = doc
    let date = moment().format('YYYY-MM-DD')
    const docToInsert = Object.assign({}, doc, {
      date,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    let lastShare = await this.collection.findOne({ userId, date, type })
    if (!lastShare) {
      ScoreRecord.autoInsert({ userId, code: '4' })
    }
    const id = (await this.collection.insertOne(docToInsert)).insertedId
    return id
  }

  async updateById(id, doc) {
    const ret = await this.collection.update(
      { _id: id },
      {
        $set: Object.assign({}, doc, {
          updatedAt: Date.now()
        })
      }
    )
    this.loader.clear(id)
    return ret
  }

  async removeById(id) {
    const ret = this.collection.remove({ _id: id })
    this.loader.clear(id)
    return ret
  }
}
