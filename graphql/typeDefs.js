const { gql } = require("apollo-server");

module.exports = gql`
  scalar DateTime

  type Admin {
    id: String!

    name: String
    password: String!
    email: String!

    modules: [Module]
    questionTemplates: [QuestionTemplate]
    challenges: [Challenge]

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

    inProgressModules: [Module]
    completedModules: [Module]
    badges: [Badge]
    starredModules: [Module]
    starredQuestions: [Question]

    mentors: [Mentor]!

    submittedAnswers: [Answer]
    createdAt: DateTime!
    token: String
  }

  type Module {
    id: String!
    type: String! # learn or practice
    categoryId: String!
    format: String # video or article | question type
    comments: [Comment]
    questions: [Question]
    createdAt: DateTime!
  }

  type Category {
    id: String!
    name: String! # CAD, elec, prog
    createdAt: DateTime!
    modules: [Module]!
    challenges: [Challenge]!
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
    category: String! # CAD, electrical, programming
    inputFields: [String]! # diff things you can enter
    createdAt: DateTime!
  }

  type Question {
    id: String!
    image: String
    infoProvided: String!
    expectedAnswers: [Answer]
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
    addCompletedModule(moduleId: String!): [Module] # done
    addInProgressModule(moduleId: String!): [Module] # done
    addBadge(badgeId: String!): [Badge] # done
    # For admin
    createNewModule(category: String!, type: String!, format: String): [Module]! # done
    createNewQuestion(
      image: String
      infoProvided: String!
      expectedAnswers: [Answer]
      hint: String
      questionTemplateId: String!
    ): [Question]! # done
    createNewQuestionTemplate(
      category: String!
      inputFields: [String]!
      type: String!
    ): [QuestionTemplate]! # done
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
      newExpectedAnswers: [Answer]
      newHint: String
      newQuestionTemplateId: String!
    ): Question! # done
    editQuestionTemplate(
      questionTemplateId: String!
      newCategory: String!
      newInputFields: [String]!
      newType: String!
    ): QuestionTemplate! # done
    deleteModule(moduleId: String!): [Module]! # done
    deleteQuestion(questionId: String!): [Question]! # done
    deleteQuestionTemplate(questionTemplateId: String!): [QuestionTemplate]! # done
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
    starModule(moduleId: String!): [Module]! # done
    unstarModule(moduleId: String!): [Module]! # done
    starQuestion(questionId: String!): [Question]! # done
    unstarQuestion(questionId: String!): [Question]! # done
    # for modules.js
    commentOnModule(comment: String, personId: String!): Module
    deleteCommentOnModule(comment: String, personId: String!): Module
    incrementModulePoints(moduleId: String!, answerCorrect: Boolean!): Int!
  }
`;
