import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'
import moment from 'moment'

export default class UserMember {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('userMember')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  user(userMember) {
    return this.context.User.findOneById(userMember.userId)
  }

  memberCharge(userMember) {
    return this.context.MemberCharge.findOneById(userMember.memberChargeId)
  }

  async addUserMember(input) {
    const { userId, memberChargeId } = input
    const { MemberCharge, User } = this.context
    let { code, months, memberId } = await MemberCharge.findOneById(memberChargeId)
    const userMembers = await UserMember.collection
      .find({ userId, status: true })
      .sort({ code: -1 })
      .toArray()
    let addMonth = 0
    let beginEffectTime
    let resultId
    for (let member of userMembers) {
      const memberCode = member.code * 1
      if (memberCode > code) {
        if (!beginEffectTime) beginEffectTime = member.effectTime
        addMonth += member.months
      } else if (memberCode === code) {
        resultId = member._id
        await UserMember.updateById(member._id, { months: member.months + months })
      } else if (memberCode < code) {
        await UserMember.updateById(member._id, {
          effectTime: moment(member.effectTime)
            .add(months, 'months')
            .format('YYYY-MM-DD')
        })
      }
    }
    if (!resultId) {
      let effectTime = moment(beginEffectTime)
        .add(addMonth, 'months')
        .format('YYYY-MM-DD')
      resultId = await UserMember.insert(Object.assign({}, input, { code, months, status: true, effectTime }))
    }
    if (!beginEffectTime) {
      await User.updateById(userId, { memberId })
    }
    return resultId
  }

  async insert(doc) {
    const docToInsert = Object.assign({}, doc, {
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
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
