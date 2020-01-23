const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create Schema
const TokenSchema = new Schema({
  token: {
    type: String
  },
  email: {
    type: String
  }
});

module.exports = Token = mongoose.model("token", TokenSchema);
