import { ObjectId } from 'mongodb'
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { merge } from 'lodash'

import userResolvers from './user'
import exerciseResolvers from './exercise'
import answerResolvers from './answer'
import exerciseCollectResolvers from './exerciseCollect'
import exerciseImageResolvers from './exerciseImage'
import answerImageResolvers from './answerImage'
import officialExaminationResolvers from './officialExamination'
import mockExaminationResolvers from './mockExamination'

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

merge(resolvers, userResolvers)
merge(resolvers, exerciseResolvers)
merge(resolvers, answerResolvers)
merge(resolvers, exerciseCollectResolvers)
merge(resolvers, exerciseImageResolvers)
merge(resolvers, answerImageResolvers)
merge(resolvers, officialExaminationResolvers)
merge(resolvers, mockExaminationResolvers)

export default resolvers
