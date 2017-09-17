import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class UserCourse {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('userCourse')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection.find().sort({ _id: -1 }).skip(skip).limit(limit).toArray()
  }

  user(userCourse) {
    return this.context.User.findOneById(userCourse.userId)
  }

  course(userCourse) {
    return this.context.Course.findOneById(userCourse.courseId)
  }

  async insert(doc) {
    const docToInsert = Object.assign({}, doc, {
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    const id = (await this.collection.insertOne(docToInsert)).insertedId

    const {DecorationType, Decoration, UserHasDecoration} = this.context
    this.collection.count().then(async(courseCount) => {
      let decorationTypeId = (await DecorationType.collection.findOne({code: '03'}))._id
      let decorations = await Decoration.collection.find({
        decorationTypeId,
        score: {$lte: courseCount}
      }).toArray()
      let userId = doc.userId
      for (let decoration of decorations) {
        let decorationId = decoration._id
        let userHasDecoration = {
          userId,
          decorationId,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        UserHasDecoration.collection.findOneAndUpdate(
          {
            userId,
            decorationId
          },
          userHasDecoration,
          { upsert: true }
        )
      }
    })

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
