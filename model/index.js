import User from './User'
import Exercise from './Exercise'
import Answer from './Answer'
import ExerciseCollect from './ExerciseCollect'
import ExerciseImage from './ExerciseImage'
import AnswerImage from './AnswerImage'
import OfficialExamination from './OfficialExamination'
import MockExamination from './MockExamination'

const models = {
  User,
  Exercise,
  Answer,
  ExerciseCollect,
  ExerciseImage,
  AnswerImage,
  OfficialExamination,
  MockExamination
}

export default function addModelsToContext(context) {
  const newContext = Object.assign({}, context)
  Object.keys(models).forEach((key) => {
    newContext[key] = new models[key](newContext)
  })
  return newContext
}
