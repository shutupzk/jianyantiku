import User from './user'

const models = {}

models.User = User

export default function addModelsToContext(context) {
  const newContext = Object.assign({}, context)
  Object.keys(models).forEach((key) => {
    newContext[key] = new models[key](newContext)
  })
  return newContext
}
