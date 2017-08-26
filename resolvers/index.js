import { ObjectId } from 'mongodb'
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { merge } from 'lodash'
<<<<<<< HEAD
import fs from 'fs'
import path from 'path'
=======

import user from './user'
import exercise from './exercise'
import answer from './answer'
import exerciseCollect from './exerciseCollect'
import exerciseImage from './exerciseImage'
import answerImage from './answerImage'
import officialExamination from './officialExamination'
import mockExamination from './mockExamination'
import userAnswer from './userAnswer'
import note from './note'
import subject from './subject'
import chapter from './chapter'
import section from './section'
import analysis from './analysis'
>>>>>>> 9170fda264b30bd75da0df6556fe68068ea8a29d

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

<<<<<<< HEAD
const filePath = path.join(__dirname, '.')
const files = fs.readdirSync(filePath)

for (let file of files) {
  if (file === 'index.js') continue
  file = file.replace('.js', '')
  let doc = require(`./${file}`).default
  merge(resolvers, doc)
}
=======
merge(resolvers, user)
merge(resolvers, exercise)
merge(resolvers, answer)
merge(resolvers, exerciseCollect)
merge(resolvers, exerciseImage)
merge(resolvers, answerImage)
merge(resolvers, officialExamination)
merge(resolvers, mockExamination)
merge(resolvers, userAnswer)
merge(resolvers, note)
merge(resolvers, subject)
merge(resolvers, chapter)
merge(resolvers, section)
merge(resolvers, analysis)
>>>>>>> 9170fda264b30bd75da0df6556fe68068ea8a29d

export default resolvers
