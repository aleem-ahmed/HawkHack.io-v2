const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { secretOrKey, mailchimpKey } = require("../config/keys");
const passport = require("passport");
const request = require("request");

//Load User Service
const userService = require("../services/userService");

//Load Input Validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

module.exports = {
  registerUser: (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    //check if valid
    if (!isValid) {
      return res.status(400).json(errors);
    }
    //generate hash
    bcrypt.getSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err) throw err;
        //replace password with hash
        req.body.password = hash;
        //register user into db
        userService
          .registerUser(req.body)
          .then(user => res.status(200).json(user))
          .catch(err => res.status(400).json(err));
      });
    });
  },
  loginUser: async (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
    //check if valid
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const user = await userService.getUserByEmail(req.body.email);
    if (!user) {
      errors.email = "No user found";
      return res.status(404).json(errors);
    }
    //check password
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      //User mathed
      //Create JWT payload
      const payload = {
        id: user.id,
        email: user.email
      };

      //Sign Token
      let token = await jwt.sign(payload, secretOrKey, { expiresIn: 3600 });
      res.json({
        success: true,
        token: "Bearer " + token
      });
    } else {
      errors.password = "Password incorrect";
      return res.status(400).json(errors);
    }
  }
};
