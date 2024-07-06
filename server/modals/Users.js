const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = new Schema({
  username: String,
  password: String,
  role: String,
  StudentId: Schema.ObjectId,
});
module.exports = mongoose.model("UserModel", User);
