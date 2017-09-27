const resolvers = {
  Member: {
    id(member) {
      return member._id
    },

    memberCharges(member, args, { Member }) {
      return Member.memberCharges(member)
    },

    memberServices(member, args, { Member }) {
      return Member.memberServices(member)
    }
  },
  Query: {
    members(root, { skip, limit }, { Member }) {
      return Member.all({ skip, limit })
    },

    member(root, { id }, { Member }) {
      return Member.findOneById(id)
    }
  },
  Mutation: {
    async createMember(root, { input }, { Member, Patient }) {
      const id = await Member.insert(input)
      return Member.findOneById(id)
    },

    async updateMember(root, { id, input }, { Member }) {
      await Member.updateById(id, input)
      return Member.findOneById(id)
    },

    removeMember(root, { id }, { Member }) {
      return Member.removeById(id)
    }
  }
}

export default resolvers
