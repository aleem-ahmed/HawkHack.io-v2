const User = require("../models/User");

module.exports = {
  getUserByEmail: email =>
    new Promise((resolve, reject) => {
      let errors = {};
      User.findOne({ email: email })
        .then(user => {
          if (user != null) {
            return resolve(user);
          }
          errors.user = "User not found";
          return reject(errors);
        })
        .catch(err => {
          errors.err = err;
          return reject(errors);
        });
    }),
  registerUser: user =>
    new Promise((resolve, reject) => {
      new User({
        email: user.email,
        password: user.password
      })
        .save()
        .then(user => resolve(user))
        .catch(err => reject(err));
    })
};
