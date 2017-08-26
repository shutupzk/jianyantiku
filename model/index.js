import fs from 'fs'
import path from 'path'
let models = {}

const filePath = path.join(__dirname, '.')
const files = fs.readdirSync(filePath)

for (let file of files) {
  if (file === 'index.js') continue
  file = file.replace('.js', '')
  let doc = require(`./${file}`).default
  models[file] = doc
}

export default function addModelsToContext(context) {
  const newContext = Object.assign({}, context)
  Object.keys(models).forEach(key => {
    newContext[key] = new models[key](newContext)
  })
  return newContext
}
