const { gql } = require("apollo-server");

module.exports = gql`
  scalar DateTime

  type Admin {
    id: String!

    name: String!
    password: String!
    email: String!

    # modules: [String]!
    # questionTemplates: [String]!
    # challenges: [String]!
    # categories: [String]!

    # questions: [String]
    # badges: [String]

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

    completedQuestions: [String]
    completedSkills: [String]

    mentors: [String]

    quesAnsDict: [StringStringDict] # {studentId + questionId: answerId}
    modulePointsDict: [StringIntDict] # {studentId + moduleId: points}
    createdAt: DateTime!
    token: String
  }

  type StringStringDict {
    id: String!
    key: String! # ques id
    value: String! # ans id
    studentId: String
    createdAt: DateTime!
  }

  type StringIntDict {
    id: String!
    key: String! # module id
    value: Int! # points
    studentId: String
    createdAt: DateTime!
  }

  type Module {
    id: String!
    name: String! # ASSUMING THIS IS UNIQUE
    categoryId: String!
    comments: [String]!
    questions: [String]!
    createdAt: DateTime!
    adminId: String
    learningObjectives: [String]
  }

  type Category {
    id: String!
    name: String! # CAD, elec, prog
    adminId: String
    createdAt: DateTime!
  }

  type Badge {
    id: String!
    name: String!
    image: String!
    description: String
    createdAt: DateTime!
    adminId: String
    questionId: String
    moduleId: String
    categoryId: String
    points: Int
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
    categoryId: String! # CAD, electrical, programming
    inputFields: [String]! # diff things you can enter
    adminId: String

    createdAt: DateTime!
  }
  type Question {
    id: String!
    type: String
    image: String
    name: String
    description: String # ASSUMING THIS IS UNIQUE TODO: make this required when redoing questions
    expectedAnswer: String
    createdAt: DateTime!
    hint: String
    questionFormat: String # only needed for questions
    points: Int
    moduleId: String
    videoLink: String
    articleLink: String
    adminId: String
    extraLink: String
    optionA: String
    optionB: String
    optionC: String
    optionD: String
  }

  type Challenge {
    id: String!
    name: String
    image: String
    challengeDescription: String
    createdAt: DateTime!
    adminId: String
    extraLink: String
    dueDate: String
    categoryId: String!
  }

  type Comment {
    id: String!
    comment: String!
    moduleId: String!
    createdAt: DateTime!
    personId: String!
  }
  "THIS OBJECT IS DEPRECATED because url links to files are stored in stores, products, etc. Files store a url link to files uploaded to S3."
  type File {
    # "Unique identifier for the object."
    # id: String!
    "The file's name."
    filename: String!
    "The file extension."
    mimetype: String!
    "The encoding format."
    encoding: String!
    # "The S3 url of the file."
    url: String!
    # "The date and time when this file was created."
    createdAt: DateTime!
  }
  "This is a return type that helps in formatting the returns statements of file upload functions."
  type S3Object {
    ETag: String
    "The URL of the file."
    Location: String!
    Key: String!
    Bucket: String!
  }
  # retrieve information
  type Query {
    getFiles: [File]
    getAdmin: Admin! # done checked
    getAdmins: [Admin]! # done checked
    getAdminById(adminId: String!): Admin! # done checked
    getQuestionsByAdmin(adminId: String!): [Question]! # done checked
    getQuestionTemplatesByAdmin(adminId: String!): [QuestionTemplate]! # done checked
    getModulesByAdmin(adminId: String!): [Module]! # done checked
    getChallengesByAdmin(adminId: String!): [Challenge]! # done checked
    getBadgesByAdmin(adminId: String!): [Badge]! # done checked
    getCategoriesByAdmin(adminId: String!): [Category]! # done checked
    getMentor: Mentor! # done checked
    getMentors: [Mentor]! # done checked
    getMentorById(mentorId: String!): Mentor! # done checked
    getStudent: Student! # done checked
    getStudentById(studentId: String!): Student! # done checked
    getStudents: [Student]! # done checked
    getBadges: [Badge]! # done checked
    getStringStringDicts: [StringStringDict]! # done checked
    getStringStringDictsByStudent(studentId: String!): [StringStringDict]! # done checked
    getStringIntDicts: [StringIntDict]! # done checked
    # for dashboard
    getCompletedModulesByStudent(studentId: String!): [Module]! # done checked
    getInProgressModulesByStudent(studentId: String!): [Module]! # done checked
    getBadgesByStudent(studentId: String!): [Badge]! # done checked
    getStudentsByMentor(mentorId: String!): [Student]! # done checked
    getMentorsByStudent(studentId: String!): [Mentor]! # done checked
    getCategories: [Category]! # done checked
    getModuleById(moduleId: String!): Module! # done checked
    getCategoryById(categoryId: String!): Category! # done checked
    getQuestionById(questionId: String!): Question! # done checked
    getAnswerById(answerId: String!): Answer! # done checked
    getQuestionTemplateById(questionTemplateId: String!): QuestionTemplate! # done checked
    getBadgeById(badgeId: String!): Badge! # done checked
    getChallengeById(challengeId: String!): Challenge! # done checked
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
    getIncompleteModulesByCategory(
      studentId: String!
      categoryId: String!
    ): [Module]! # done checked
    # can be of any of the types
    getQuestionsByModule(moduleId: String!): [String]! # done checked
    getCommentsByModule(moduleId: String!): [String]! # done checked
    getModulesBySearch(search: String!): [String]! # started
    getHintByQuestion(questionId: String!): String! # done checked
    getSavedAnswerByQuestion(questionId: String!, studentId: String!): String! # done checked
    getModulePointsByStudent(studentId: String!, moduleId: String!): Int # done checked
    getTotalPossibleModulePoints(moduleId: String!): Int # done checked
    getCompletedQuestionsByModule(
      moduleId: String!
      studentId: String!
    ): [String] # done checked
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
    editAdmin(
      adminId: String!
      newName: String
      newEmail: String
      newPassword: String
      confirmNewPassword: String
    ): Admin! # done checked
    editStudent(
      studentId: String!
      newName: String
      newOrgName: String
      newEmail: String
      newPassword: String
      confirmNewPassword: String
    ): Student! # done checked
    editMentor(
      mentorId: String!
      newName: String
      newOrgName: String
      newEmail: String
      newPassword: String
      confirmNewPassword: String
    ): Mentor! # done checked
    addCompletedModule(moduleId: String!, studentId: String!): [String] # done checked
    addInProgressModule(moduleId: String!, studentId: String!): [String] # done checked
    removeInProgressModule(moduleId: String!, studentId: String!): [String] # done checked
    removeCompletedModule(moduleId: String!, studentId: String!): [String] # done checked
    handleAddBadge(badgeId: String!, studentId: String!): [String] # done checked
    addMentor(mentorId: String!, studentId: String!): [String] # done checked
    # For admin
    createNewModule(name: String!, categoryId: String!): Module! # done checked
    createNewBadge(
      name: String!
      imageFile: Upload!
      description: String!
      moduleId: String
      categoryId: String
      questionId: String
      points: Int
    ): Badge! # done checked
    createNewQuestion(
      image: String
      moduleId: String!
      description: String
      expectedAnswer: String
      hint: String
      questionFormat: String
      points: Int
      videoLink: String
      articleLink: String
      name: String
      type: String
      extraLink: String
      optionA: String
      optionB: String
      optionC: String
      optionD: String
    ): Question! # done checked
    createNewQuestionTemplate(
      name: String!
      categoryId: String!
      inputFields: [String]!
    ): QuestionTemplate! # done checked
    editModule(
      moduleId: String!
      newName: String
      newCategoryId: String
      newAdminId: String
    ): Module! # done checked
    editBadge(
      badgeId: String!
      newName: String
      newImage: String
      newQuestionId: String
      newModuleId: String
      newCategoryId: String
      newPoints: Int
      newDescription: String
      newAdminId: String
    ): Badge! # done checked
    editQuestion(
      questionId: String!
      moduleId: String!
      newModuleId: String
      newImage: String
      newDescription: String
      newHint: String
      newExpectedAnswer: String
      newPoints: Int
      newVideoLink: String
      newArticleLink: String
      newName: String
      newType: String
      newAdminId: String
      newExtraLink: String
      newOptionA: String
      newOptionB: String
      newOptionC: String
      newOptionD: String
    ): Question! # done checked
    editQuestionTemplate(
      newName: String
      questionTemplateId: String!
      newCategoryId: String
      newInputFields: [String]
      newAdminId: String
    ): QuestionTemplate! # done checked
    deleteStringStringDict(stringStringDictId: String!): [StringStringDict]! # done checked
    deleteStringIntDict(stringIntDictId: String!): [StringIntDict]! # done checked
    deleteModule(moduleId: String!): [Module]! # done checked
    deleteBadge(badgeId: String!): [Badge]! # done checked
    deleteQuestion(questionId: String!): [Question]! # done checked
    deleteAnswer(answerId: String!, studentId: String!): String! # done checked
    deleteQuestionTemplate(questionTemplateId: String!): [String]! # done checked
    createNewCategory(name: String!): Category! # done checked
    editCategory(
      categoryId: String!
      newName: String
      newAdminId: String
    ): Category! # done checked
    deleteCategory(categoryId: String!): [Category]! # done checked
    createNewChallenge(
      name: String!
      categoryId: String!
      challengeDescription: String
      image: String
      extraLink: String
      dueDate: String
    ): Challenge! # done checked
    editChallenge(
      challengeId: String!
      newCategoryId: String
      newChallengeDescription: String
      newName: String
      newImage: String
      newExtraLink: String
      newDueDate: String
      newAdminId: String
    ): Challenge! # done checked
    deleteChallenge(challengeId: String!): [Challenge]! # done checked
    # createHint(questionId: String!, hintDescription: String!): Hint! # done
    # editHint(hintId: String!, newHintDescription: String!): Hint! # done
    # deleteHint(questionId: String!, hintId: String!): Question! # done
    # for learn/practice experience
    startQuestion(questionId: String!, studentId: String!): StringStringDict! # done checked
    startModule(moduleId: String!, studentId: String!): StringIntDict! # done checked
    saveAnswer(
      answer: String!
      questionId: String!
      studentId: String!
    ): Answer! # done checked
    verifyAnswer(
      answerId: String!
      questionId: String!
      studentId: String!
    ): Boolean! # done checked
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
      studentId: String!
    ): Int! # done checked
    decrementModulePoints(
      moduleId: String!
      numToDecrement: Int!
      studentId: String!
    ): Int! # done checked
    handleAnswerPoints(
      answer: String
      studentId: String!
      questionId: String!
    ): Int! # done checked
    handleStarQuestion(questionId: String!): [String] # done checked
    handleStarModule(moduleId: String!): [String] # done checked
    addBadge(studentId: String!, badgeId: String!): [Badge]! # done checked
    # File Mutations
    uploadLynxFile(file: Upload!): S3Object!
    deleteLynxFile(fileKey: String!): String!
  }
  # TODO addBadge, editStudent, editMentor, editAdmin
`;
