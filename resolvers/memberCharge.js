const resolvers = {
  MemberCharge: {
    id(memberCharge) {
      return memberCharge._id
    },

    member(memberCharge, args, { MemberCharge }) {
      return MemberCharge.member(memberCharge)
    }
  },
  Query: {
    memberCharges(root, { skip, limit }, { MemberCharge }) {
      return MemberCharge.all({ skip, limit })
    },

    memberCharge(root, { id }, { MemberCharge }) {
      return MemberCharge.findOneById(id)
    }
  },
  Mutation: {
    async createMemberCharge(root, { input }, { MemberCharge, Member }) {
      const { memberId } = input
      const { code } = await Member.findOneById(memberId)
      const id = await MemberCharge.insert(Object.assign({}, input, { code }))
      return MemberCharge.findOneById(id)
    },

    async updateMemberCharge(root, { id, input }, { MemberCharge }) {
      await MemberCharge.updateById(id, input)
      return MemberCharge.findOneById(id)
    },

    removeMemberCharge(root, { id }, { MemberCharge }) {
      return MemberCharge.removeById(id)
    }
  }
}

export default resolvers
