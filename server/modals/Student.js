const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Exam = new Schema({
  subject: String,
  marks: Number,
});
const student = new Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  fourthName: String,
  className: String,
  schoolYear: Date,
  shift: String,
  branch: String,
  idNo: Number,
  exams: [Exam],
});

module.exports = mongoose.model("StudentModel", student);
