const validator = require("validator");

module.exports.validateUserLoginInput = (email, password) => {
  const errors = {};

  if (!validator.isEmail(email)) {
    errors.email = email;
  }

  if (validator.isEmpty(password)) {
    errors.password = "Invalid password";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateUserRegisterInput = (
  email,
  password,
  confirmPassword
) => {
  const errors = {};

  if (!email || !password) {
    errors.email = "Emails and Passwords must be provided";
  } else if (!validator.isEmail(email)) {
    errors.email = email;
  }

  if (password != confirmPassword) {
    errors.password = "Passwords don't match";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
