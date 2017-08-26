import User from './User'
import Exercise from './Exercise'
import Answer from './Answer'
import ExerciseCollect from './ExerciseCollect'
import ExerciseImage from './ExerciseImage'
import AnswerImage from './AnswerImage'
import OfficialExamination from './OfficialExamination'
import MockExamination from './MockExamination'
import UserAnswer from './UserAnswer'
import Note from './Note'
import Subject from './Subject'
import Chapter from './Chapter'
import Section from './Section'
import Analysis from './Analysis'

const models = {
  User,
  Exercise,
  Answer,
  ExerciseCollect,
  ExerciseImage,
  AnswerImage,
  OfficialExamination,
  MockExamination,
  UserAnswer,
  Note,
  Subject,
  Chapter,
  Section,
  Analysis
}

export default function addModelsToContext(context) {
  const newContext = Object.assign({}, context)
  Object.keys(models).forEach(key => {
    newContext[key] = new models[key](newContext)
  })
  return newContext
}
