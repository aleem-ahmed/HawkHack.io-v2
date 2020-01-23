const Token = require("../models/Token");
module.exports = {
  save: (token, email) => {
    return new Promise((resolve, reject) => {
      new Token({
        token: token,
        email: email
      })
        .save()
        .then(token => resolve(token))
        .catch(err => reject(err));
    });
  },
  find: token => {
    return new Promise(async (resolve, reject) => {
      let errors = {};
      let foundToken = await Token.findOne({ token: token }).exec();
      if (!foundToken) {
        errors.notFound = "refresh token not found";
        return reject(errors);
      }
      return resolve(foundToken);
    });
  },
  reject: token => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await Token.deleteOne({ token: token }).exec();
        return resolve(result);
      } catch (err) {
        return reject(err);
      }
    });
  }
};
