const resolvers = {
  Section: {
    id(section) {
      return section._id
    },

    chapter(section, args, { Section }) {
      return Section.chapter(section)
    },

    count(section, { examinationDifficultyId }, { Section }) {
      return Section.count(section, { examinationDifficultyId })
    },

    exercises(section, { skip, limit, examinationDifficultyId }, { Section }) {
      return Section.exercises(section, { skip, limit, examinationDifficultyId })
    },

    rateOfProgressOfSection(section, { userId }, { Section }) {
      return Section.rateOfProgressOfSection(section, { userId })
    }
  },
  Query: {
    sections(root, { skip, limit, examinationDifficultyId }, { Section }) {
      return Section.all({ skip, limit, examinationDifficultyId })
    },

    section(root, { id }, { Section }) {
      return Section.findOneById(id)
    }
  },
  Mutation: {
    async createSection(root, { input }, { Section, Patient }) {
      const id = await Section.insert(input)
      return Section.findOneById(id)
    },

    async updateSection(root, { id, input }, { Section }) {
      await Section.updateById(id, input)
      return Section.findOneById(id)
    },

    removeSection(root, { id }, { Section }) {
      return Section.removeById(id)
    },

    async removeSectionExercise(root, { id }, { Section, Exercise, Answer }) {
      let exercises = await Exercise.collection.find({ sectionId: id }).toArray()
      let exerciseIds = []
      for (let exercise of exercises) {
        exerciseIds.push(exercise._id)
      }
      await Answer.collection.remove({ exerciseId: { $in: exerciseIds } })
      return Exercise.collection.remove({ sectionId: id })
    }
  }
}

export default resolvers
