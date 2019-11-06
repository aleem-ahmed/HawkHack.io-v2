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
        userService.registerUser(req.body)
            .then(user => res.status(200).json(user))
            .catch(err => res.status(400).json(err))
      });
    });
  },
  loginUser: (req, res)=>{
      const {errors, isValid }= validateLoginInput(req.body);
      //check if valid
      if(!isValid){
          return res.status(400).json(errors);
      }
      userService.getUserByEmail(req.body.email).then().catch(err =)
  }
};