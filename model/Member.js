import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class Member {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('member')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection.find().toArray()
  }

  memberCharges(member) {
    return this.context.MemberCharge.collection.find({ memberId: member._id }).toArray()
  }

  memberServices(member) {
    return this.context.MemberService.collection.find({ memberId: member._id }).toArray()
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
