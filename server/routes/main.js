const express = require("express");
const Student = require("../modals/Student");
const converting = require("../excel/converting");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../modals/Users");
const router = express.Router();

const salt = process.env.SECRET;
const jwtSecret = process.env.JWT_SECRET_STUDENT;

const createUser = async function (username, password, role, StudentId) {
  const hashedpassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    password: hashedpassword,
    role,
    StudentId,
  });
  await newUser.save();
  return newUser;
};

const createstudentAccounts = async function () {
  const students = await Student.find();
  students.forEach((student) => {
    createUser(
      student.firstName +
        student.middleName +
        student.lastName +
        student.fourthName,
      "12345678",
      "student",
      student._id
    );
    console.log();
  });
  console.log(students[0].firstName);
};
// createstudentAccounts();
// try {
//   // createStudent("Ahmed", "5A", Date.now(), [{ subject: "English", marks: 4.5 }]);
//   const students = converting("C:\\Users\\HP\\Downloads\\5B Morning.xlsx");
//   students.forEach((student) => {
//     const namearr = student["Student Full Name"].split(" ");
//     const firstName = namearr[0];
//     const middleName = namearr[1];
//     const lastName = namearr[2];
//     const fourthName = namearr[3];
//     const arabic = { subject: "Arabic", marks: student["Arabic"] };
//     const maths = { subject: "Maths", marks: student["Maths"] };
//     const science = { subject: "Science", marks: student["Science"] };
//     const social = { subject: "Social", marks: student["Social Studies"] };
//     const english = { subject: "English", marks: student["English"] };
//     const somali = { subject: "Somali", marks: student["Somali"] };
//     const tarbiya = { subject: "Tarbiya", marks: student["Islamic Studies"] };
//     const exams = [arabic, maths, science, social, english, somali, tarbiya];
//     const newStudent = new Student({
//       firstName,
//       middleName,
//       lastName,
//       fourthName,
//       shift: student["Shift"],
//       className: student["Class"],
//       branch: student["Branch"],
//       idNo: student["ID-NO"],
//       SchoolYear: new Date(),
//       exams,
//     });
//     newStudent.save();
//   });
//   router.get("/", (req, res) => {
//     res.render("index", { students });
//   });
// } catch (err) {
//   router.get("/", (req, res) => {
//     res.status(404).json({ message: "error" });
//   });
// }

//authentication middleware
const authMiddleware = function (req, res, next) {
  const token = req.cookies.Studenttoken || null;

  if (!token) {
    return res.status(401).json({ message: "unathorized page" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(501).json({ msg: err.message });
  }
};

router.get("/", (req, res) => {
  try {
    const locals = {
      title: "main page",
      description: "the home page",
    };
    res.render("../views/main/index");
  } catch (err) {
    res.status(501).json({ msg: "bad server request" });
  }
});
router.get("/student/login", (req, res) => {
  try {
    const locals = {
      title: "student login",
      description: "the student login page",
    };
    res.render("../views/main/Login", { locals });
  } catch (err) {
    res.status(501).json({ msg: err.message });
  }
});

router.post("/student/login", async (req, res) => {
  try {
    const locals = {
      title: "main page",
      description: "the home page",
    };

    const { username, password } = req.body;
    if(!username || !password){
      return res.status(401).json({message:"no body: "+username+" pwd :"+password})
    }
    const user = await User.findOne({
      username: username.replaceAll(" ", "").trim(),
    });
    console.log(username.replaceAll(" ", "").trim());
    if (!user) {
      return res.status(401).json({ msg: "invalid username" });
    }
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(401).json({ msg: "invalid password" });
    }
    if (user.role == "admin") {
      return res.status(202).json({
        locals,
        studentId: user.studentId,
        msg: "you are admin redirecting to the admin page",
      });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("Studenttoken", token, { httpOnly: true });

    res.redirect("/student/" + user.StudentId);
  } catch (err) {
    res.status(501).json({ msg: err.message });
  }
});

router.get("/student/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Student Page",
      description: "the student  page",
    };
    const data = await Student.findOne({ _id: req.params.id });
    res.render("../views/main/student", { data, locals });
    console.log(data);
  } catch (err) {
    res.status(501).json({ msg: "bad server request" });
  }
});

module.exports = router;
