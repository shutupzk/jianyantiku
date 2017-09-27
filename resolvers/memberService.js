const resolvers = {
  MemberService: {
    id(memberService) {
      return memberService._id
    },

    member(memberService, args, { MemberService }) {
      return MemberService.member(memberService)
    },

    service(memberService, args, { MemberService }) {
      return MemberService.service(memberService)
    }
  },
  Query: {
    memberServices(root, { skip, limit }, { MemberService }) {
      return MemberService.all({ skip, limit })
    },

    memberService(root, { id }, { MemberService }) {
      return MemberService.findOneById(id)
    }
  },
  Mutation: {
    async createMemberService(root, { input }, { MemberService, Patient }) {
      const id = await MemberService.insert(input)
      return MemberService.findOneById(id)
    },

    async updateMemberService(root, { id, input }, { MemberService }) {
      await MemberService.updateById(id, input)
      return MemberService.findOneById(id)
    },

    removeMemberService(root, { id }, { MemberService }) {
      return MemberService.removeById(id)
    }
  }
}

export default resolvers
