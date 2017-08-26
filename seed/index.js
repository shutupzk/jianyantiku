import { MongoClient, ObjectId } from 'mongodb'
import fs from 'fs'
import path from 'path'

export async function initDB(MONGO_URL, fn) {
  const db = await MongoClient.connect(MONGO_URL)
  db.listCollections().toArray().then(collections => {
    if (collections.length > 0) {
      console.log('数据库有数据')
      if (fn) return fn()
    } else {
      console.log('create db start')
      insertData(db, function() {
        console.log('create db finished')
        if (fn) return fn()
      })
    }
  })
}

function insertData(db, fn) {
  let filePath = path.join(__dirname, '/data')
  fs.readdir(filePath, function(err, oldfiles) {
    if (err) console.log(err)
    oldfiles = oldfiles || []
    let files = []
    for (let file of oldfiles) {
      files.push(file)
    }
    let len = files.length
    if (len === 0) return fn('there is no seed data')
    let count = 0
    insertNext()
    function insertNext() {
      insertOneCollection(db, files[count], function(err) {
        if (err) console.log(err)
        count++
        if (count === len) return fn()
        return insertNext()
      })
    }
  })
}

function insertOneCollection(db, fileName, fn) {
  let docs = require('./data/' + fileName)
  let name = fileName.replace('.json', '')
  console.log('create collectios : ' + name)
  for (let i = 0; i < docs.length; i++) {
    for (let key in docs[i]) {
      let len = key.length
      if (key !== 'ticketId') {
        let lastStr = key.substr(len - 2, 2)
        if (lastStr.indexOf('id') > -1 || lastStr.indexOf('Id') > -1) {
          docs[i][key] = ObjectId(docs[i][key])
        }
      }
    }
  }
  db.collection(name).insertMany(docs, function(err, data) {
    if (err) return fn(err)
    return fn(null)
  })
}
