import fs from 'fs'
import path from 'path'

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

const filePath = path.join(__dirname, '.')
const files = fs.readdirSync(filePath)

for (let file of files) {
  if (file === 'index.js') continue
  typeDefs.push(requireGraphQL(`./${file}`))
}

<<<<<<< HEAD
export default typeDefs
=======
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
typeDefs.push(requireGraphQL('./subject.graphql'))
typeDefs.push(requireGraphQL('./chapter.graphql'))
typeDefs.push(requireGraphQL('./section.graphql'))
typeDefs.push(requireGraphQL('./analysis.graphql'))
>>>>>>> 9170fda264b30bd75da0df6556fe68068ea8a29d
