import { createUser, getUser } from '../libs/easemob'
const resolvers = {
  User: {
    id(user) {
      return user._id
    },

    payFee(user) {
      return user.payFee || 0
    },

    exerciseCollects(user, { skip, limit }, { User }) {
      return User.exerciseCollects(user, { skip, limit })
    },

    errorExcercises(user, { skip, limit, isAnswer, subjectId }, { User }) {
      return User.errorExcercises(user, { skip, limit, isAnswer, subjectId })
    },

    courseCollects(user, { skip, limit }, { User }) {
      return User.courseCollects(user, { skip, limit })
    },

    userAnswers(user, { skip, limit, isAnswer, subjectId }, { User }) {
      return User.userAnswers(user, { skip, limit, isAnswer, subjectId })
    },

    decorations(user, { skip, limit }, { User }) {
      return User.decorations(user, { skip, limit })
    },

    scoreRecords(user, { skip, limit, date }, { User }) {
      return User.scoreRecords(user, { skip, limit, date })
    },

    examinations(user, { skip, limit }, { User }) {
      return User.examinations(user, { skip, limit })
    },

    rateOfProgressOfSections(user, { skip, limit }, { User }) {
      return User.rateOfProgressOfSections(user, { skip, limit })
    },

    userSigns(user, { skip, limit }, { User }) {
      return User.userSigns(user, { skip, limit })
    },

    userShares(user, { skip, limit }, { User }) {
      return User.userShares(user, { skip, limit })
    },

    userInvitations(user, { skip, limit }, { User }) {
      return User.userInvitations(user, { skip, limit })
    },

    notes(user, { skip, limit }, { User }) {
      return User.notes(user, { skip, limit })
    },

    userDayAnswers(user, { skip, limit }, { User }) {
      return User.userDayAnswers(user, { skip, limit })
    },

    countCourseCollect(user, args, { User }) {
      return User.countCourseCollect(user)
    },

    // countUserAnswer(user, args, { User }) {
    //   return User.countUserAnswer(user)
    // },

    // countRightUserAnswer(user, args, { User }) {
    //   return User.countRightUserAnswer(user)
    // },

    userMembers(user, args, { User }) {
      return User.userMembers(user)
    },

    member(user, args, { User }) {
      return User.member(user)
    },

    exerciseRate(user, args, { User }) {
      return User.exerciseRate(user)
    },

    userCourseCount(user, args, { UserCourse }) {
      return UserCourse.collection.count({ userId: user._id })
    }
  },
  Query: {
    users(root, { skip, limit, sort, keyword }, { User }) {
      return User.all({ skip, limit, sort, keyword })
    },

    async user(root, { id }, { User, UserDayAnswer, DecorationType, Decoration, UserHasDecoration }) {
      let userId = id
      let userDayAnswers = await UserDayAnswer.collection.find({ userId: id }).toArray()
      let totalCount = 0
      let correctCount = 0
      for (let userDayAnswer of userDayAnswers) {
        totalCount += userDayAnswer.totalCount
        correctCount += userDayAnswer.correctCount
      }

      let totalTypeId = (await DecorationType.collection.findOne({ code: '01' }))._id
      let correctTypeId = (await DecorationType.collection.findOne({ code: '02' }))._id
      let decorations = await Decoration.collection
        .find({
          $or: [
            {
              decorationTypeId: totalTypeId,
              score: { $lte: totalCount }
            },
            {
              decorationTypeId: correctTypeId,
              score: { $lte: correctCount }
            }
          ]
        })
        .toArray()
      for (let decoration of decorations) {
        let decorationId = decoration._id
        let userHasDecoration = {
          userId,
          decorationId,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        UserHasDecoration.collection.findOneAndUpdate(
          {
            userId,
            decorationId
          },
          userHasDecoration,
          { upsert: true }
        )
      }
      return User.findOneById(id)
    },

    getUserByPhone(root, { phone }, { User }) {
      return User.findOneByPhone(phone)
    },
    getUserByOpenId(root, { openId }, { User }) {
      return User.findOneByOpenID(openId)
    }
  },
  Mutation: {
    async signUp(root, { input }, { User }) {
      const { phone } = input
      const id = await User.insert(input)
      let eseaData = null
      try {
        eseaData = await getUser({ username: phone })
        console.log('查询环信返回的数据', eseaData)
      } catch (e) {
        console.log('获取环信')
      }
      try {
        if (!eseaData || !eseaData.entities || eseaData.entities.length === 0) {
          console.log('has esea')
          await createUser({ username: phone, password: phone })
        }
      } catch (e) {
        console.log(e)
      }

      return User.findOneById(id)
    },

    async updateUser(root, { id, input }, { User }) {
      await User.updateById(id, input)
      return User.findOneById(id)
    },

    async updatePassword(root, { phone, input }, { User }) {
      const id = await User.updateByPhone(phone, input)
      return User.findOneById(id)
    },

    removeUser(root, { id }, { User }) {
      return User.removeById(id)
    }
  }
}

export default resolvers
