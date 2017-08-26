import { ObjectId } from 'mongodb'
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { merge } from 'lodash'
import fs from 'fs'
import path from 'path'

const resolvers = {}

resolvers.ObjID = new GraphQLScalarType({
  name: 'ObjID',
  description: 'Id representation, based on Mongo Object Ids',
  parseValue(value) {
    return ObjectId(value)
  },
  serialize(value) {
    return value.toString()
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ObjectId(ast.value)
    }
    return null
  }
})

const filePath = path.join(__dirname, '.')
const files = fs.readdirSync(filePath)

for (let file of files) {
  if (file === 'index.js') continue
  file = file.replace('.js', '')
  let doc = require(`./${file}`).default
  merge(resolvers, doc)
}

export default resolvers
