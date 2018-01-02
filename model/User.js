import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'
import bcrypt from 'bcrypt'
import { checkPhoneNumber, getInsertId } from '../utils'
const SALT_ROUNDS = 10

export default class User {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('user')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  findOneByPhone(phone) {
    return this.collection.findOne({ phone })
  }

  findOneByOpenID(openId) {
    return this.collection.findOne({ openId })
  }

  all({ skip = 0, limit = 10, keyword, sort }) {
    if (!sort) {
      sort = { _id: -1 }
    } else {
      sort = JSON.parse(sort)
    }
    let ops = {}
    if (keyword) {
      ops['$or'] = [{ phone: { $regex: keyword, $options: 'i' } }, { name: { $regex: keyword, $options: 'i' } }]
    }
    return this.collection
      .find(ops)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  exerciseCollects(user, { skip = 0, limit = 10 }) {
    return this.context.ExerciseCollect.collection
      .find({
        userId: user._id
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  courseCollects(user, { skip = 0, limit = 10 }) {
    return this.context.CourseCollect.collection
      .find({
        userId: user._id
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  userAnswers(user, { skip = 0, limit = 10, isAnswer, subjectId }) {
    let ops = {
      userId: user._id
    }
    if (isAnswer === false || isAnswer === true) ops.isAnswer = isAnswer
    if (subjectId) {
      ops.subjectId = subjectId
    }
    return this.context.UserAnswer.collection
      .find(ops)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  async errorExcercises(user, { skip = 0, limit = 10, isAnswer, subjectId }) {
    let ops = {
      userId: user._id,
      deleted: null
    }
    if (isAnswer === false || isAnswer === true) ops.isAnswer = isAnswer
    if (subjectId) {
      ops.subjectId = subjectId
    }
    const userAnswers = await this.context.UserAnswer.collection.find(ops).toArray()
    let ids = []
    for (let obj of userAnswers) {
      ids.push(obj.exerciseId)
    }
    return this.context.Exercise.collection
      .find({
        _id: { $in: ids }
      })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  async decorations(user, { skip = 0, limit = 10 }) {
    let userHasDecorations = await this.context.UserHasDecoration.collection.find({ userId: user._id }).toArray()
    let decorationIds = []
    for (let userHasDecoration of userHasDecorations) {
      decorationIds.push(userHasDecoration.decorationId)
    }

    return this.context.Decoration.collection
      .find({
        _id: { $in: decorationIds }
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  scoreRecords(user, { skip = 0, limit = 10, date }) {
    let ops = { userId: user._id }
    if (date) ops.date = { $regex: date, $options: 'i' }
    return this.context.ScoreRecord.collection
      .find(ops)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  examinations(user, { skip = 0, limit = 10 }) {
    return this.context.Examination.collection
      .find({
        userId: user._id
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  notes(user, { skip = 0, limit = 10 }) {
    return this.context.Note.collection
      .find({
        userId: user._id
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  userDayAnswers(user, { skip = 0, limit = 10 }) {
    return this.context.UserDayAnswer.collection
      .find({
        userId: user._id
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  rateOfProgressOfSections(user, { skip = 0, limit = 10 }) {
    return this.context.RateOfProgressOfSection.collection
      .find({
        userId: user._id
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  userSigns(user, { skip = 0, limit = 10 }) {
    return this.context.UserSign.collection
      .find({
        userId: user._id
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  userShares(user, { skip = 0, limit = 10 }) {
    return this.context.UserShare.collection
      .find({
        userId: user._id
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  userInvitations(user, { skip = 0, limit = 10 }) {
    return this.context.UserInvitation.collection
      .find({
        userId: user._id
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  countCourseCollect(user) {
    const { CourseCollect } = this.context
    return CourseCollect.collection.count({ userId: user._id })
  }

  countUserAnswer(user) {
    const { UserAnswer } = this.context
    return UserAnswer.collection.count({ userId: user._id })
  }

  countRightUserAnswer(user) {
    const { UserAnswer } = this.context
    return UserAnswer.collection.count({ userId: user._id, isAnswer: true })
  }

  userMembers(user) {
    const { UserMember } = this.context
    return UserMember.collection
      .find({ userId: user._id, status: true })
      .sort({ code: -1 })
      .toArray()
  }

  member(user) {
    if (!user.memberId) return null
    const { Member } = this.context
    return Member.collection.findOne({ _id: user.memberId })
  }

  async exerciseRate(user) {
    const { UserAnswer, Exercise } = this.context
    const userAnswers = await UserAnswer.collection.find({ userId: user._id, examinationHasExerciseId: { $exists: false } }).toArray()
    let ids = []
    for (let obj of userAnswers) {
      ids.push(obj.exerciseId)
    }
    const hasCount = await Exercise.collection.count({ _id: { $in: ids }, type: '01' })
    const taltalCount = await Exercise.collection.count({ type: '01' })
    console.log(hasCount, taltalCount)
    const rate = (hasCount / taltalCount).toFixed(4) * 100
    return rate
  }

  async insert(doc) {
    if (!checkPhoneNumber(doc.phone)) throw new Error('手机号格式不正确')
    let user = await this.collection.findOne({ phone: doc.phone })
    if (user) throw new Error('手机号已被注册')
    const hash = await bcrypt.hash(doc.password, SALT_ROUNDS)
    delete doc.password
    const docToInsert = Object.assign({}, doc, {
      hash,
      score: 10,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    let upsertResult = await this.collection.findOneAndUpdate({ phone: doc.phone }, docToInsert, { upsert: true })
    const userId = getInsertId(upsertResult)
    const { lastErrorObject } = upsertResult
    if (lastErrorObject) {
      this.initUser(userId, doc.phone)
    }
    return userId
  }

  async initUser (userId, phone) {
    const { ScoreRecord, UserInvitation, ScoreType } = this.context
    const invitationUser = await UserInvitation.collection.findOne({ phone })
    if (invitationUser) {
      const scoreTypeId = (await ScoreType.collection.findOne({ code: '10' }))._id
      const count = await ScoreRecord.collection.count({ userId: invitationUser.userId, scoreTypeId })
      if (count < 5) {
        ScoreRecord.autoInsert({ userId: invitationUser.userId, code: '10' })
      }
    }
    ScoreRecord.autoInsert({ userId, code: '2' })
  }

  async updateById(id, doc) {
    let updateSet = {
      updatedAt: Date.now()
    }
    if (doc.password) {
      const hash = await bcrypt.hash(doc.password, SALT_ROUNDS)
      delete doc.password
      updateSet.hash = hash
    }
    if (doc.openId) {
      updateSet.openId = doc.openId
    }
    const ret = await this.collection.update(
      { _id: id },
      {
        $set: Object.assign({}, doc, updateSet)
      }
    )
    this.loader.clear(id)
    return ret
  }

  async updateByPhone(phone, doc) {
    let updateSet = {
      updatedAt: Date.now()
    }
    // 忘记密码
    if (!doc.password) {
      if (!doc.newPassword) throw new Error('修改密码不能为空')
      if (!doc.verifyCode) throw new Error('验证码不能为空')

      // 验证验证码
      let verifyData = await this.context.VerifyCode.collection.findOne({
        phone: phone,
        verifyCode: doc.verifyCode
      })
      if (!verifyData) throw new Error('验证码验证失败')
      if (!verifyData.valid) {
        throw new Error('验证码已经失效')
      }
      if (verifyData.overdue < Date.now()) {
        throw new Error('验证码已过期')
      }
      await this.context.VerifyCode.collection.update(
        { _id: verifyData._id },
        {
          $set: Object.assign({}, doc, {
            valid: false
          })
        }
      )

      let user = await this.collection.findOne({ phone: phone })
      // 修改密码
      const newHash = await bcrypt.hash(doc.newPassword, SALT_ROUNDS)
      delete doc.newPassword
      delete doc.verifyCode
      updateSet.hash = newHash
      await this.collection.update(
        { phone: phone },
        {
          $set: Object.assign({}, doc, updateSet)
        }
      )
      this.loader.clear(user._id)
      return user._id
    } else {
      // 修改密码
      if (!doc.newPassword) throw new Error('修改密码不能为空')
      if (!doc.password) throw new Error('原始密码不能为空')
      // 验证用户和原始密码
      let user = await this.collection.findOne({ phone: phone })
      if (!user || !await bcrypt.compare(doc.password, user.hash)) {
        throw new Error('User not found matching username/password combination')
      }
      // 修改成新设置的密码
      const hash = await bcrypt.hash(doc.newPassword, SALT_ROUNDS)
      delete doc.newPassword
      delete doc.password
      updateSet.hash = hash
      await this.collection.update(
        { phone: phone },
        {
          $set: Object.assign({}, doc, updateSet)
        }
      )
      this.loader.clear(user._id)
      return user._id
    }
  }

  async removeById(id) {
    const ret = this.collection.remove({ _id: id })
    this.loader.clear(id)
    return ret
  }
}
