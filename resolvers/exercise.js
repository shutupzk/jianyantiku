const resolvers = {
  Exercise: {
    id(exercise) {
      return exercise._id
    },

    section(exercise, args, { Exercise }) {
      return Exercise.section(exercise)
    },

    subject(exercise, args, { Exercise }) {
      return Exercise.subject(exercise)
    },

    yearExerciseList(exercise, args, { Exercise }) {
      return Exercise.yearExerciseList(exercise)
    },

    yearHasType(exercise, args, { Exercise }) {
      return Exercise.yearHasType(exercise)
    },

    yearExamType(exercise, args, { Exercise }) {
      return Exercise.yearExamType(exercise)
    },

    mockExamination(exercise, args, { Exercise }) {
      return Exercise.mockExamination(exercise)
    },

    examinationDifficulty(exercise, args, { Exercise }) {
      return Exercise.examinationDifficulty(exercise)
    },

    // answerCount(exercise, args, { Exercise }) {
    //   return Exercise.answerCount(exercise)
    // },

    // rightCount(exercise, args, { Exercise }) {
    //   return Exercise.rightCount(exercise)
    // },

    // normalErrorAnswer(exercise, args, { Exercise }) {
    //   return Exercise.normalErrorAnswer(exercise)
    // },

    // rightRate(exercise, args, { Exercise }) {
    //   return Exercise.rightRate(exercise)
    // },

    async collect(exercise, { userId }, { ExerciseCollect }) {
      const exit = await ExerciseCollect.collection.find({exerciseId: exercise._id, userId})
      if (exit) {
        return true
      }
      return false
    },

    answers(exercise, { skip, limit }, { Exercise }) {
      return Exercise.answers(exercise, { skip, limit })
    },

    exerciseCollects(exercise, { skip, limit }, { Exercise }) {
      return Exercise.exerciseCollects(exercise, { skip, limit })
    },

    exerciseImages(exercise, { skip, limit }, { Exercise }) {
      return Exercise.exerciseImages(exercise, { skip, limit })
    },

    notes(exercise, { skip, limit, userId }, { Exercise }) {
      return Exercise.notes(exercise, { skip, limit, userId })
    },

    analysiss(exercise, { skip, limit }, { Exercise }) {
      return Exercise.analysiss(exercise, { skip, limit })
    }
  },
  Query: {
    exercises(root, { skip, limit, hot, type, examinationDifficultyId, yearExerciseListId, subjectId, chapterId, sectionId, yearExamTypeId, keyword }, { Exercise }) {
      return Exercise.all({ skip, limit, hot, type, examinationDifficultyId, yearExerciseListId, subjectId, chapterId, sectionId, yearExamTypeId, keyword })
    },

    exercise(root, { id }, { Exercise }) {
      return Exercise.findOneById(id)
    }
  },
  Mutation: {
    async createExercise(root, { input }, { Exercise }) {
      const id = await Exercise.insert(input)
      return Exercise.findOneById(id)
    },

    async updateExercise(root, { id, input }, { Exercise }) {
      await Exercise.updateById(id, input)
      return Exercise.findOneById(id)
    },

    async removeExercise(root, { id }, { Exercise, UserAnswer, Answer, Analysis, Note, ExerciseCollect, ExerciseImage, ExaminationHasExercise, ErrorExercise, AnswerImage, UserTimeAnswer }) {
      await UserAnswer.collection.deleteMany({ exerciseId: id })
      await Analysis.collection.deleteMany({ exerciseId: id })
      await Note.collection.deleteMany({ exerciseId: id })
      await ExerciseCollect.collection.deleteMany({ exerciseId: id })
      await ExerciseImage.collection.deleteMany({ exerciseId: id })
      await ExaminationHasExercise.collection.deleteMany({ exerciseId: id })
      await ErrorExercise.collection.deleteMany({ exerciseId: id })
      await AnswerImage.collection.deleteMany({ exerciseId: id })
      await UserTimeAnswer.collection.deleteMany({ exerciseId: id })
      const answers = await Answer.collection.find({ exerciseId: id }).toArray()
      let ids = []
      for (let answer of answers) {
        ids.push(answer._id)
      }
      await UserAnswer.collection.deleteMany({ answerId: {$in: ids} })
      await Answer.collection.deleteMany({ exerciseId: id })
      return Exercise.removeById(id)
    }
  }
}

export default resolvers
