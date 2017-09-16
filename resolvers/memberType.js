const resolvers = {
  MemberType: {
    id(memberType) {
      return memberType._id
    }

    // scoreRecords(memberType, { skip, limit }, { MemberType }) {
    //   return MemberType.scoreRecords(memberType, { skip, limit })
    // }

  },
  Query: {
    memberTypes(root, { skip, limit }, { MemberType }) {
      return MemberType.all({ skip, limit })
    },
    memberType(root, { id }, { MemberType }) {
      return MemberType.findOneById(id)
    }
  },
  Mutation: {
    async createMemberType(root, { input }, { MemberType }) {
      const id = await MemberType.insert(input)
      return MemberType.findOneById(id)
    },

    async updateMemberType(root, { id, input }, { MemberType }) {
      await MemberType.updateById(id, input)
      return MemberType.findOneById(id)
    },

    removeMemberType(root, { id }, { MemberType }) {
      return MemberType.removeById(id)
    }
  }
}

export default resolvers
