const { gql } = require("apollo-server");

module.exports = gql`
  scalar DateTime

  type Admin {
    id: String!

    name: String
    password: String!
    email: String!

    modules: [String]
    questionTemplates: [String]
    challenges: [String]

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
    starredModules: [String]
    starredQuestions: [String]

    mentors: [String]!

    submittedAnswers: [String]
    createdAt: DateTime!
    token: String
  }

  type Module {
    id: String!
    type: String! # learn or practice
    categoryId: String!
    format: String # video or article | question type
    comments: [String]
    questions: [String]
    createdAt: DateTime!
  }

  type Category {
    id: String!
    name: String! # CAD, elec, prog
    createdAt: DateTime!
    modules: [String]!
    challenges: [String]!
  }

  type Badge {
    id: String!
    name: String!
    description: String
    createdAt: DateTime!
    criteria: String!
  }

  type Answer {
    id: String!
    studentId: String!
    questionId: String!
    categoryId: String!
    moduleId: String!
    createdAt: DateTime!
  }

  type Hint {
    id: String!
    questionId: String!
    categoryId: String!
    moduleId: String!
    hintDescription: String!
    createdAt: DateTime!
  }

  # not the card itself, just available templates
  type QuestionTemplate {
    id: String!
    type: String! # learn or practice
    categoryId: String! # CAD, electrical, programming
    inputFields: [String]! # diff things you can enter
    createdAt: DateTime!
  }

  type Question {
    id: String!
    image: String
    infoProvided: String!
    expectedAnswers: [String]
    createdAt: DateTime!
    hint: String
    questionTemplateId: String!
  }

  type Challenge {
    id: String!
    image: String
    infoProvided: String!
    createdAt: DateTime!
    categoryId: String!
  }

  type Comment {
    id: String!
    personId: String!
    comment: String!
    createdAt: DateTime!
  }

  # retrieve information
  type Query {
    getAdmin: Admin! # done
    getMentor: Mentor! # done
    getStudent: Student! # done
    # for dashboard
    getCompletedModulesByStudent: [String]! # done
    getInProgressModulesByStudent: [String]! # done
    getBadgesByStudent: [String]! # done
    # for student's learn page
    getModulesByCategory(category: String!): [String]!

    getStudentsByMentor: [Student]!
    getMentorsByStudent: [String]! # done
    #  like dif form fields to create questions
    getQuestionTemplatesByCategory(categoryId: String!): [String]!

    # can be of any of the types
    getQuestionsByModule(moduleId: String!): [String]!

    # will either be ytvid link or gdoc hosted article link
    getLearnLinkByModule(moduleId: String!): String!

    getCommentsByModule(moduleId: String!): [String]!
    getModulesForSearch(search: String!): [String]!

    getChallengesByCategory(categoryId: String!): [String]!
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
    addCompletedModule(moduleId: String!): [String] # done
    addInProgressModule(moduleId: String!): [String] # done
    addBadge(badgeId: String!): [String] # done
    # For admin
    createNewModule(category: String!, type: String!, format: String): [String]! # done
    createNewQuestion(
      image: String
      infoProvided: String!
      expectedAnswers: [String]
      hint: String
      questionTemplateId: String!
    ): [String]! # done
    createNewQuestionTemplate(
      categoryId: String!
      inputFields: [String]!
      type: String!
    ): [String]! # done
    editModule(
      moduleId: String!
      newCategoryId: String!
      newType: String!
      newFormat: String
    ): Module! # done
    editQuestion(
      questionId: String!
      newImage: String
      newInfoProvided: String!
      newExpectedAnswers: [String]
      newHint: String
      newQuestionTemplateId: String!
    ): Question! # done
    editQuestionTemplate(
      questionTemplateId: String!
      newCategoryId: String!
      newInputFields: [String]!
      newType: String!
    ): QuestionTemplate! # done
    deleteModule(moduleId: String!): [String]! # done
    deleteQuestion(questionId: String!): [String]! # done
    deleteQuestionTemplate(questionTemplateId: String!): [String]! # done
    createNewChallenge(
      categoryId: String!
      infoProvided: String!
      image: String
    ): Challenge! # done
    editChallenge(
      newCategoryId: String!
      newInfoProvided: String!
      newImage: String
    ): Challenge! # done
    deleteChallenge(
      categoryId: String!
      infoProvided: String!
      image: String
    ): Challenge! # done
    # for questions.js
    createHint(
      questionId: String!
      categoryId: String!
      moduleId: String!
      hintDescription: String!
    ): Hint!
    editHint(
      questionId: String!
      categoryId: String!
      moduleId: String!
      hintDescription: String!
    ): Hint!
    deleteHint(
      questionId: String!
      categoryId: String!
      moduleId: String!
      hintDescription: String!
    ): Hint!

    # for learn/practice experience
    submitAnswer(
      answerId: String!
      categoryId: String!
      questionId: String!
      moduleId: String!
      studentId: String!
    ): Answer! # done
    verifyAnswer(
      categoryId: String!
      questionId: String!
      moduleId: String!
    ): Boolean! # done
    starModule(moduleId: String!): [String]! # done
    unstarModule(moduleId: String!): [String]! # done
    starQuestion(questionId: String!): [String]! # done
    unstarQuestion(questionId: String!): [String]! # done
    # for modules.js
    commentOnModule(comment: String, personId: String!): Module
    deleteCommentOnModule(comment: String, personId: String!): Module
    incrementModulePoints(moduleId: String!, answerCorrect: Boolean!): Int!
  }
`;
