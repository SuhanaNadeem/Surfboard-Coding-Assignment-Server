// async verifyAnswer(_, { categoryId, questionId, moduleId }, context) {
//     try {
//       const student = checkStudentAuth(context);
//       var targetStudent = await Student.findById(student.id);
//     } catch (error) {
//       console.log(error);
//       return None;
//     }

//     const targetQuestion = await Question.findById(questionId);

//     if (targetQuestion.expectedAnswers.contains(answerId)) {
//       return True;
//     } else {
//       return False;
//     }
//   },
