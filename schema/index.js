import fs from 'fs'

function requireGraphQL(name) {
  const filename = require.resolve(name)
  return fs.readFileSync(filename, 'utf8')
}

const typeDefs = [
  `
  scalar ObjID
  type Query {
    # A placeholder, please ignore
    placeholder: Int
  }
  type Mutation {
    # A placeholder, please ignore
    placeholder: Int
  }
`
]

export default typeDefs

typeDefs.push(requireGraphQL('./user.graphql'))
typeDefs.push(requireGraphQL('./exercise.graphql'))
typeDefs.push(requireGraphQL('./answer.graphql'))
typeDefs.push(requireGraphQL('./exerciseCollect.graphql'))
typeDefs.push(requireGraphQL('./exerciseImage.graphql'))
typeDefs.push(requireGraphQL('./answerImage.graphql'))
typeDefs.push(requireGraphQL('./officialExamination.graphql'))
typeDefs.push(requireGraphQL('./mockExamination.graphql'))
typeDefs.push(requireGraphQL('./userAnswer.graphql'))
typeDefs.push(requireGraphQL('./note.graphql'))
typeDefs.push(requireGraphQL('./course.graphql'))
typeDefs.push(requireGraphQL('./chapter.graphql'))
typeDefs.push(requireGraphQL('./section.graphql'))
typeDefs.push(requireGraphQL('./analysis.graphql'))
