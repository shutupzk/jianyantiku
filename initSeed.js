import { MongoClient } from 'mongodb'
import fs from 'fs'
import { MONGO_URL } from './config'

async function createDB() {
  const db = await MongoClient.connect(MONGO_URL)
  db.listCollections().toArray().then(collections => {
    for (let i = 0; i < collections.length; i++) {
      let collectionName = collections[i].name
      db.collection(collections[i].name).find({}).toArray().then(docs => {
        fs.writeFile('./seed/data/' + collectionName + '.json', JSON.stringify(docs), function(err) {
          if (err) {
            throw err
          }
        })
      })
    }
  })
}
createDB()
