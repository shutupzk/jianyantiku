import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'
import { checkPhoneNumber } from '../utils'
import rp from 'request-promise'

export default class VerifyCode {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('verifyCode')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  async findAndUpdate(doc) {
    let data = await this.collection.findOne({ phone: doc.phone, verifyCode: doc.code })
    if (!data) throw new Error('验证码不存在')
    if (!data.valid) {
      throw new Error('验证码已经失效')
    }
    if (data.overdue < Date.now()) {
      throw new Error('验证码已过期')
    }
    await this.collection.update(
      { _id: data._id },
      {
        $set: Object.assign({}, doc, {
          valid: false
        })
      }
    )
    await this.loader.clear(data._id)
    return data._id
  }

  all({ lastCreatedAt = 0, skip = 0, limit = 10 }) {
    return this.collection
      .find({
        createdAt: { $gt: lastCreatedAt }
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  async insert(doc) {
    const { phone } = doc
    if (!checkPhoneNumber(phone)) throw new Error('手机号格式不正确')
    let data = await this.collection.findOne({ phone, overdue: { $gte: Date.now() }, valid: true })
    if (data) {
      sendMessage(data)
      return data._id
    } else {
      const docToInsert = Object.assign({}, doc, {
        phone,
        verifyCode: (Math.random() * 10 + '').substr(2, 6),
        seconds: 300,
        valid: true,
        overdue: Date.now() + 3 * 60 * 1000,
        createdAt: Date.now()
      })
      let id = (await this.collection.insertOne(docToInsert)).insertedId
      sendMessage(docToInsert)
      return id
    }
    function sendMessage(docToInsert) {
      let json = {
        account: 'N4503620',
        password: 'jTN1RC4poE12e7',
        msg: '【253云通讯】您的验证码是：' + docToInsert.verifyCode,
        phone
      }
      let headers = { 'Content-Type': 'application/json' }
      let options = {
        method: 'POST',
        url: 'https://smssh1.253.com/msg/send/json',
        body: JSON.stringify(json),
        headers
      }
      rp(options).then(rusult => {
        // console.log(rusult)
      }).catch(e => {
        // console.log(e)
      })
    }
  }
}
