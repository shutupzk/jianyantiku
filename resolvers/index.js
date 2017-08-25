import { ObjectId } from 'mongodb'
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { merge } from 'lodash'

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
import course from './course'
import chapter from './chapter'
import section from './section'
import analysis from './analysis'

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
merge(resolvers, course)
merge(resolvers, chapter)
merge(resolvers, section)
merge(resolvers, analysis)

export default resolvers
