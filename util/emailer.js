const moment = require("moment-timezone");
const sgMail = require("@sendgrid/mail");
const { UserInputError, AuthenticationError } = require("apollo-server");

// async function sendStudentPasswordResetEmail(targetStudent) {
//     const subject = "LYNX Institute Password Reset";

//     const siteUrl = "https://www.lynxinstitute.ca/";
//     const accountSupportUrl = "https://www.lynxinstitute.ca/accountSupport";

//     const dynamicTemplateData = {
//       subject,
//       siteUrl,
//       email: targetStudent.email,
//       resetPasswordToken: targetStudent.resetPasswordToken,
//       resetPasswordUrl:
//         "https://www.bringhome.ca/verifyStudentPasswordResetToken/" +
//         targetStudent.resetPasswordToken,
//       accountSupportUrl,
//     };
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//     const msg = {
//       to: [{ email: targetStudent.email }],
//       from: { email: process.env.BH_ADMIN_EMAIL_1, name: "BringHome Team" }, // subject: subject,
//       // subject: subject,

//       templateId: "d-1284eb1013b140139b3a2c8d59c9da30",
//       dynamicTemplateData,
//     };
//     sgMail
//       .send(msg)
//       .then(() => console.log("Email has been sent!"))
//       .catch(console.log);
//   }

//   module.exports.sendStudentPasswordResetEmail = sendStudentPasswordResetEmail;
