const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { secretOrKey, mailchimpKey } = require("../config/keys");
const randtoken = require("rand-token");
const mailgun = require("../config/mailgun");
const passport = require("passport");
const request = require("request");

//Load User Service
const userService = require("../services/userService");
const tokenService = require("../services/tokenService");

//Load Input Validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

module.exports = {
  registerUser: async (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    //check if valid
    if (!isValid) {
      return res.status(400).json(errors);
    }
    //generate hash
    bcrypt.getSalt(12, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err) throw err;
        //replace password with hash
        req.body.password = hash;
        //register user into db
        try {
          let user = await userService.registerUser(req.body);
          res.status(200).json(user);
        } catch (err) {
          res.status(400).json(err);
        }
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
        email: user.email,
        role: user.role
      };

      //Sign Token
      let token = await jwt.sign(payload, secretOrKey, { expiresIn: 3600 });

      //create and save refresh token 
      let refreshToken = randtoken.uid(256);
      let savedToken = await tokenService.save(refreshToken);
      res.json({
        success: true,
        token: "Bearer " + token,
        refreshToken: savedToken.token
      });
    } else {
      errors.password = "Password incorrect";
      return res.status(400).json(errors);
    }
  },
  token: async (req, res) => {
    const email = req.body.email
    const refreshToken = req.body.refreshToken
    const savedToken = await tokenService.find(refreshToken);
    if(savedToken && savedToken.email===email){
      const user = await userService.getUserByEmail(email);
      let payload = {
        id: user.id,
        email: user.email,
        role: user.role
      }
      const newToken = await jwt.sign(payload, secretOrKey, { expiresIn: 3600 });
      res.json({
        success: true,
        token: "Bearer " + newToken,
        refreshToken: refreshToken
      });
  }
    else {
      res.status(401).json("unauthorized");
    }
  },
  sendmail: (req,res)=>{
    const data={
      from: "test@hawkhack.io",
      to: req.params.mail,
      subject: "Mailgun test from hawkhack.",
      html: `<h1>TEST<h1></p>this is a test of the mailgun api.</p>`
    };
    mailgun.messages().send(data, (err,body)=>{
      if(err){
        res.status(500).json("error");
        console.log("mailgun error: ", err)
      }
      res.status(200).json(`mail send to ${req.params.mail}`);
    })
  }
};
