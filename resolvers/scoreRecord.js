import moment from 'moment'
const resolvers = {
  ScoreRecord: {
    id(scoreRecord) {
      return scoreRecord._id
    },

    user(scoreRecord, args, { ScoreRecord }) {
      return ScoreRecord.user(scoreRecord)
    },

    scoreType(scoreRecord, args, { ScoreRecord }) {
      return ScoreRecord.scoreType(scoreRecord)
    },

    date(scoreRecord) {
      return moment(scoreRecord.date).format('YYYY-MM-DD')
    }

  },
  Query: {
    scoreRecords(root, { skip, limit }, { ScoreRecord }) {
      return ScoreRecord.all({ skip, limit })
    },
    scoreRecord(root, { id }, { ScoreRecord }) {
      return ScoreRecord.findOneById(id)
    }
  },
  Mutation: {
    async createScoreRecord(root, { input }, { ScoreRecord }) {
      const id = await ScoreRecord.insert(input)
      return ScoreRecord.findOneById(id)
    },

    async updateScoreRecord(root, { id, input }, { ScoreRecord }) {
      await ScoreRecord.updateById(id, input)
      return ScoreRecord.findOneById(id)
    },

    removeScoreRecord(root, { id }, { ScoreRecord }) {
      return ScoreRecord.removeById(id)
    }
  }
}

export default resolvers
