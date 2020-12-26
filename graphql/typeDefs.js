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

    inProgressModules: [Module]!
    completedModules: [Module]!
    badges: [Badge]!

    mentors: [Mentor]!

    createdAt: DateTime!
    token: String
  }

  type Module {
    id: String!
    type: String! # learn or practice
    categoryId: String!
    format: String # video or article | question type
    mentorComments: [String]
    studentComments: [String]
    createdAt: DateTime!
  }

  type Category {
    id: String!
    name: String! # CAD, elec, prog
    createdAt: DateTime!
    modulesAssociated: [Module]!
    challengesAssociated: [Challenge]!
  }

  type Badge {
    id: String!
    name: String!
    description: String
    createdAt: DateTime!
    criteria: String!
  }

  type Answer {
    answerId: String!
    studentId: String!
    questionId: String!
    categoryId: String!
    moduleId: String!
    createdAt: DateTime!
  }

  type Hint {
    hintId: String!
    questionId: String!
    categoryId: String!
    moduleId: String!
    createdAt: DateTime!
  }

  # not the card itself, just available templates
  type QuestionTemplate {
    id: String!
    type: String! # learn or practice
    category: String! # CAD, electrical, programming
    createdAt: DateTime!
  }

  type Question {
    id: String!
    image: String
    infoProvided: String!
    expectedAnswer: String
    createdAt: DateTime!
    hint: String
  }

  type Challenge {
    id: String!
    image: String
    infoProvided: String!
    createdAt: DateTime!
    categoryId: String!
  }

  # retrieve information
  type Query {
    getAdmin: Admin! # done
    getMentor: Mentor! # done
    getStudent: Student! # done
    # for dashboard
    getCompletedModulesByStudent: [Module]! # done
    getInProgressModulesByStudent: [Module]! # done
    getBadgesByStudent: [Badge]! # done
    # for student's learn page
    getModulesByCategory(category: String!): [Module]!

    getStudentsByMentor: [Student]!
    getMentorsByStudent: [Mentor]! # done
    #  like dif form fields to create questions
    getQuestionTemplatesByCategory(category: String!): [QuestionTemplate]!

    # can be of any of the types
    getQuestionsByModule(moduleId: String!): [Question]!

    # will either be ytvid link or gdoc hosted article link
    getLearnLinkByModule(moduleId: String!): String!

    getCommentsByModule(moduleId: String!): [String]!
    getModulesForSearch(search: String!): [Module]!

    getChallengesByCategory(categoryId: String!): [Challenge]!
    getHintByQuestion(questionId: String!): Hint!

    getSavedAnswerByQuestion(studentId: String!, questionId: String!): Answer!
  }

  # actions
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
    ): Student! # done
    loginStudent(email: String!, password: String!): Student! # done
    addCompletedModule(moduleId: String!): [Module]
    addInProgressModule(moduleId: String!): [Module]
    addBadge(badgeId: String!): [Badge]

    # For admin
    createNewModule(category: String!): Module!
    createNewQuestion(
      moduleId: String!
      category: String!
      format: String
    ): Question!
    createNewQuestionTemplate(category: String!): QuestionTemplate!
    editModule(moduleId: String!, category: String!, format: String): Module!
    editQuestion(
      questionId: String!
      category: String!
      format: String
    ): Question!
    editQuestionTemplate(
      questionTemplateId: String!
      category: String!
      format: String
    ): QuestionTemplate!
    deleteModule(moduleId: String!): Module!
    deleteQuestion(questionId: String!): Question!
    deleteQuestionTemplate(questionTemplateId: String!): QuestionTemplate!
    createNewChallenge(
      categoryId: String!
      infoProvided: String!
      image: String
    ): Challenge!
    editChallenge(
      categoryId: String!
      infoProvided: String!
      image: String
    ): Challenge!
    deleteChallenge(
      categoryId: String!
      infoProvided: String!
      image: String
    ): Challenge!
    addModuleHint(
      moduleId: String!
      categoryId: String!
      questionId: String!
      hintDescription: String!
    ): Hint!
    editModuleHint(
      moduleId: String!
      categoryId: String!
      questionId: String!
      hintDescription: String!
    ): Hint!
    removeModuleHint(
      moduleId: String!
      categoryId: String!
      questionId: String!
      hintDescription: String!
    ): Hint!

    # for learn/practice experience
    submitAnswer(
      answerId: String!
      categoryId: String!
      questionId: String!
      moduleId: String!
    ): String
    verifyAnswer(answer: String!): Boolean!
    starModule(moduleId: String!): Module!
    unstarModule(moduleId: String!): Module!
    starQuestion(questionId: String!): Question!
    unstarQuestion(questionId: String!): Question!
    commentOnModule(moduleId: String!, comment: String): Module
    incrementModulePoints(moduleId: String!, answerCorrect: Boolean!): Int!
  }
`;
