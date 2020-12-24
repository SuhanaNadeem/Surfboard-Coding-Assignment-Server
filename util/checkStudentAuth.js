const { AuthenticationError } = require("apollo-server");

const jwt = require("jsonwebtoken");
const SECRET_STUDENT_KEY = process.env.SECRET_STUDENT_KEY;

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];

    if (token) {
      try {
        const student = jwt.verify(token, SECRET_STUDENT_KEY);
        return student;
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired token");
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]");
  }

  throw new Error("Authorization header must be provided");
};
