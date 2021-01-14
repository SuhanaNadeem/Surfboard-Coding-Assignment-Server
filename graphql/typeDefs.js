const { gql } = require("apollo-server");

module.exports = gql`
  scalar DateTime

  type Admin {
    id: String!

    name: String!
    password: String!
    email: String!

    modules: [String]!
    questionTemplates: [String]!
    challenges: [String]!
    categories: [String]!

    createdAt: DateTime!
    token: String
  }
  type Mentor {
    id: String!
    name: String!

    orgName: String
    password: String!
    email: String!

    createdAt: DateTime!
    token: String
  }

  type Student {
    id: String!

    orgName: String!
    name: String!
    password: String!
    email: String!

    inProgressModules: [String]
    completedModules: [String]
    badges: [String]
    starredModules: [String]
    starredQuestions: [String]

    mentors: [String]

    quesAnsDict: [StringStringDict] # {questionsAttempted: submittedAnswers}
    modulePointsDict: [StringIntDict] # {module: points}
    createdAt: DateTime!
    token: String
  }

  type StringStringDict {
    id: String!
    key: String! # ques id
    value: String! # ans id
    createdAt: DateTime!
  }

  type StringIntDict {
    id: String!
    key: String! # module id
    value: Int! # points
    createdAt: DateTime!
  }

  type Module {
    id: String!
    name: String! # ASSUMING THIS IS UNIQUE
    categoryId: String!
    format: String! # question type
    comments: [String]!
    questions: [String]!
    createdAt: DateTime!
  }

  type Category {
    id: String!
    name: String! # CAD, elec, prog
    createdAt: DateTime!
  }

  type Badge {
    id: String!
    name: String!
    image: String!
    description: String
    createdAt: DateTime!
    criteria: String!
  }

  type Answer {
    id: String!
    answer: String!
    studentId: String!
    questionId: String!
    createdAt: DateTime!
  }

  # type Hint {
  #   id: String!
  #   questionId: String!
  #   hintDescription: String!
  #   createdAt: DateTime!
  # }

  # not the card itself, just available templates
  type QuestionTemplate {
    id: String!
    name: String!
    type: String! # learn or practice
    categoryId: String! # CAD, electrical, programming
    inputFields: [String]! # diff things you can enter
    hint: String
    createdAt: DateTime!
  }

  type Question {
    id: String!
    image: String
    questionDescription: String! # ASSUMING THIS IS UNIQUE
    expectedAnswer: String
    createdAt: DateTime!
    hint: String
    questionTemplateId: String!
    points: Int
    moduleId: String
  }

  type Challenge {
    id: String!
    image: String
    questionDescription: String!
    createdAt: DateTime!
    categoryId: String!
  }

  type Comment {
    id: String!
    comment: String!
    moduleId: String!
    createdAt: DateTime!
    personId: String!
  }

  # retrieve information
  type Query {
    getAdmin: Admin! # done checked
    getAdmins: [Admin]! # done checked
    getMentor: Mentor! # done checked
    getMentors: [Mentor]! # done checked
    getStudent: Student! # done checked
    getStudents: [Student]! # done checked
    getBadges: [Badge]! # done checked
    getStringStringDicts: [StringStringDict]! # done checked
    getStringIntDicts: [StringIntDict]! # done checked
    # for dashboard
    getCompletedModulesByStudent: [Module]! # done checked
    getInProgressModulesByStudent: [Module]! # done checked
    getBadgesByStudent: [String]! # done checked
    getStudentsByMentor: [String]! # done checked
    getMentorsByStudent: [String]! # done checked
    getCategories: [Category]! # done checked
    getModuleById(moduleId: String!): Module! # done checked
    getCategoryById(categoryId: String!): Category! # done checked
    getModules: [Module]! # done checked
    getChallenges: [Challenge]! # done checked
    getAnswersByStudent(studentId: String!): [Answer]! # done checked
    getAnswers: [Answer]! # done checked
    getQuestionTemplates: [QuestionTemplate]! # done checked
    getQuestions: [Question]! # done checked
    getComments: [Comment]! # done checked
    #  like dif form fields to create questions
    getQuestionTemplatesByCategory(categoryId: String!): [QuestionTemplate]! # done checked
    getChallengesByCategory(categoryId: String!): [Challenge]! # done checked
    # for student's learn page (categories.js)
    getModulesByCategory(categoryId: String!): [Module]! # done checked
    # can be of any of the types
    getQuestionsByModule(moduleId: String!): [String]! # done checked
    getCommentsByModule(moduleId: String!): [String]! # done checked
    getModulesBySearch(search: String!): [String]! # started
    getHintByQuestion(questionId: String!): String! # done checked
    getSavedAnswerByQuestion(questionId: String!): String! # done checked
  }

  # actions
  type Mutation {
    signupAdmin(
      name: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): Admin! # done checked
    loginAdmin(email: String!, password: String!): Admin! # done checked
    deleteAdmin(adminId: String!): String # done checked
    signupMentor(
      email: String!
      name: String!
      password: String!
      confirmPassword: String!
    ): Mentor! # done checked
    loginMentor(email: String!, password: String!): Mentor! # done checked
    deleteMentor(mentorId: String!): String # done checked
    signupStudent(
      name: String!
      orgName: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): Student! # done checked
    deleteStudent(studentId: String!): String # done checked
    loginStudent(email: String!, password: String!): Student! # done checked
    addCompletedModule(moduleId: String!): [String] # done checked
    addInProgressModule(moduleId: String!): [String] # done checked
    addBadge(badgeId: String!): [String] # done checked
    addMentor(mentorId: String!): [String] # done checked
    # For admin
    createNewModule(name: String!, categoryId: String!, format: String): Module! # done checked
    createNewBadge(
      name: String!
      image: String!
      description: String!
      criteria: String
    ): Badge! # done checked
    createNewQuestion(
      image: String!
      moduleId: String!
      questionDescription: String!
      expectedAnswer: String
      hint: String!
      questionTemplateId: String!
      points: Int
    ): Question! # done checked
    createNewQuestionTemplate(
      name: String!
      categoryId: String!
      inputFields: [String]!
      type: String!
    ): QuestionTemplate! # done checked
    editModule(
      moduleId: String!
      newName: String!
      newCategoryId: String!
      newFormat: String!
    ): Module! # done checked
    editBadge(
      badgeId: String!
      newName: String!
      newImage: String!
      newCriteria: String!
      newDescription: String!
    ): Badge! # done checked
    editQuestion(
      questionId: String!
      moduleId: String!
      newModuleId: String!
      newImage: String!
      newQuestionDescription: String!
      newHint: String!
      newExpectedAnswer: String
      newPoints: Int
    ): Question! # done checked
    editQuestionTemplate(
      newName: String!
      questionTemplateId: String!
      newCategoryId: String!
      newInputFields: [String]!
      newType: String!
    ): QuestionTemplate! # done checked
    deleteStringStringDict(stringStringDictId: String!): [StringStringDict]! # done checked
    deleteModule(moduleId: String!): [String]! # done checked
    deleteBadge(badgeId: String!): [Badge]! # done checked
    deleteQuestion(questionId: String!): [String]! # done checked
    deleteAnswer(answerId: String!, studentId: String!): String! # done checked
    deleteQuestionTemplate(questionTemplateId: String!): [String]! # done checked
    createNewCategory(name: String!): Category! # done checked
    editCategory(categoryId: String!, newName: String!): Category! # done checked
    deleteCategory(categoryId: String!): [String]! # done checked
    createNewChallenge(
      categoryId: String!
      questionDescription: String!
      image: String
    ): Challenge! # done checked
    editChallenge(
      challengeId: String!
      newCategoryId: String!
      newQuestionDescription: String!
      newImage: String
    ): Challenge! # done checked
    deleteChallenge(challengeId: String!): [String]! # done checked
    # createHint(questionId: String!, hintDescription: String!): Hint! # done
    # editHint(hintId: String!, newHintDescription: String!): Hint! # done
    # deleteHint(questionId: String!, hintId: String!): Question! # done
    # for learn/practice experience
    startQuestion(questionId: String!): StringStringDict! # done checked
    startModule(moduleId: String!): StringIntDict! # done checked
    saveAnswer(
      answer: String!
      questionId: String!
      studentId: String!
    ): Answer! # done checked
    verifyAnswer(answerId: String!, questionId: String!): Boolean! # done checked
    starModule(moduleId: String!): [String]! # done checked
    unstarModule(moduleId: String!): [String]! # done checked
    starQuestion(questionId: String!): [String]! # done checked
    unstarQuestion(questionId: String!): [String]! # done checked
    createNewComment(moduleId: String!, comment: String): Module # done checked
    deleteComment(moduleId: String!, commentId: String): Module # done checked
    incrementModulePoints(
      moduleId: String!
      answerCorrect: Boolean!
      numToIncrement: Int!
    ): Int! # done checked
  }
  # TODO giveBadgeToStudent, editStudent, editMentor, editAdmin, replace signupAdmin
`;
