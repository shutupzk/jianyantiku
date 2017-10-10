import moment from 'moment'

const resolvers = {
  UserMember: {
    id(userMember) {
      return userMember._id
    },

    user(userMember, args, { UserMember }) {
      return UserMember.user(userMember)
    },

    memberCharge(userMember, args, { UserMember }) {
      return UserMember.memberCharge(userMember)
    }
  },
  Query: {
    userMembers(root, { skip, limit }, { UserMember }) {
      return UserMember.all({ skip, limit })
    },

    userMember(root, { id }, { UserMember }) {
      return UserMember.findOneById(id)
    }
  },
  Mutation: {
    async createUserMember(root, { input }, { UserMember, MemberCharge, User }) {
      const { userId, memberChargeId } = input
      let { code, months, memberId } = await MemberCharge.findOneById(memberChargeId)
      const userMembers = await UserMember.collection
        .find({ userId, status: true })
        .sort({ code: -1 })
        .toArray()
      if (userMembers && userMembers.length > 0) {
        if (userMembers[0].code > code) throw new Error('您当前有高等级会员未结束，不能购买低等级会员')
        for (let member of userMembers) {
          if (member.code === code) continue
          let { _id, effectTime } = member
          effectTime = moment(effectTime)
            .add(months, 'months')
            .format('YYYY-MM-DD')
          await UserMember.updateById(_id, { effectTime })
        }
      }
      const userMember = await UserMember.collection.findOne({ userId, code, status: true })
      if (!userMember) {
        const id = await UserMember.insert(Object.assign({}, input, { code, months, status: true, effectTime: moment().format('YYYY-MM-DD') }))
        await User.updateById(userId, { memberId })
        return UserMember.findOneById(id)
      }
      let id = userMember._id
      months += userMember.months
      await UserMember.updateById(id, { months })
      await User.updateById(userId, { memberId })
      return UserMember.findOneById(id)
    },

    async giveUserMember(root, { input }, { UserMember, MemberCharge, User }) {
      const id = await UserMember.giveUserMember(input)
      return UserMember.findOneById(id)
    },

    async updateUserMember(root, { id, input }, { UserMember }) {
      await UserMember.updateById(id, input)
      return UserMember.findOneById(id)
    },

    removeUserMember(root, { id }, { UserMember }) {
      return UserMember.removeById(id)
    }
  }
}

export default resolvers
