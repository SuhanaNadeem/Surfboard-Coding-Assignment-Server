const { gql } = require("apollo-server");

module.exports = gql`
  scalar DateTime

  type Admin {
    id: String!

    name: String
    password: String!
    email: String!

    createdAt: DateTime!
    token: String
  }
  type Mentor {
    id: String!
    name: String

    orgName: String
    password: String!
    email: String!

    createdAt: DateTime!
    token: String
  }

  type Student {
    id: String!

    orgName: String
    name: String
    password: String!
    email: String!

    inProgressModules: [String]
    completedModules: [String]
    badges: [String]

    createdAt: DateTime!
    token: String
  }

  type PracticeModule {
    id: String!

    category: String! # CAD, electrical, programming
    createdAt: DateTime!
  }

  type LearnModule {
    id: String!

    category: String! # CAD, electrical, programming
    type: String! # video or article
    createdAt: DateTime!
  }

  type Query {
    getAdmin: Admin!
    getMentor: Mentor!
    getStudent: Student!

    # for dashboard
    getCompletedModulesByStudent: [Module]!
    getInProgressModulesByStudent: [Module]!
    getBadgesByStudent: [Badge]!
    
    # for student's learn page
    getModulesByCategory(category: String!): [Module]!

    getStudentsByMentor: [Student]!
    getMentorsByStudent: [Mentor]!
    
     like dif form fields to create questions
    getQuestionTemplatesByCategory(category: String!): [QuestionTemplate]!
    
    # can be of any of the types
    getQuestionsByModule(module: String!): [Question]!
    
    # will either be ytvid link or gdoc hosted article link
    getLearnLinkByModule(module: String!): String!
    # TODO finish queries, add missing types, and add mutations
    
    
  }

  type Mutation {
    signupAdmin(
      email: String!
      password: String!
      confirmPassword: String!
    ): Admin!
    loginAdmin(email: String!, password: String!): Admin!
    signupMentor(
      email: String!
      password: String!
      confirmPassword: String!
    ): Mentor!
    loginMentor(email: String!, password: String!): Mentor!
    signupStudent(
      email: String!
      password: String!
      confirmPassword: String!
    ): Student!
    loginStudent(email: String!, password: String!): Student!
  }
`;
