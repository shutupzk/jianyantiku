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

export default typeDefs
