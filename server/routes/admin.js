const express = require("express");
const jwt = require("jsonwebtoken");
const Student = require("../modals/Student");
const router = express.Router();
const bcrypt = require("bcryptjs")
const User = require("../modals/Users")
const adminLayout = "../views/layouts/admin.ejs";
const authMiddleware = function(req,res,next){
  const token = req.cookies.token || null;
  try{
  if(!token){
    return res.status(401).json({msg:"Not authorized to go to this page"})
  }
    const confirmation = jwt.verify(token,process.env.JWT_SECRET_ADMIN)
    if(confirmation){
      next();
    }
  }
  catch(err){
    console.log(token)
    res.status(500).json({msg:err.message})
  }
}

router.get("/dashboard", async (req, res) => {
  try {
    const data = await Student.find().sort({ firstName: 1 });
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data))
  } catch (err) {
    res.status(501).json(err);
  }
});


router.get("/student/:id",authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Student.findById(id);
    res.json(data);
  } catch (err) {
    res.json(err);
  }
});
router.put("/student/:id",authMiddleware,async(req,res)=>{
  const id = req.params.id;
  const {english,arabic,somali,science,social,tarbiya,maths} = req.body;
  let updateOperation = {
    $set: {
        "exams.$[elem1].marks": arabic,
        "exams.$[elem2].marks": english,
        "exams.$[elem3].marks": somali,
        "exams.$[elem4].marks": science,
        "exams.$[elem5].marks": social,
        "exams.$[elem6].marks": tarbiya,
        "exams.$[elem7].marks": maths
    }
    
};
console.log(req.body)
let arrayFilters = [
  { "elem1.subject": "Arabic" },
  { "elem2.subject": "English" },
  { "elem3.subject": "Somali" },
  { "elem4.subject": "Science" },
  { "elem5.subject": "Social" },
  { "elem6.subject": "Tarbiya" },
  { "elem7.subject": "Maths" },
  // Add more filters as needed
];
  const updated = await Student.updateOne({_id:id},updateOperation,{arrayFilters:arrayFilters});
  const student = await Student.findOne({_id:id});
  res.json(student)
  
})
router.delete("/student/:id",async (req,res)=>{
  const id = req.params.id;  let updateOperation = {
    $set: {
        "exams.$[].marks": 0,
    }
    
};
console.log(req.body)
  const updated = await Student.updateOne({_id:id},updateOperation);
  const student = await Student.findOne({_id:id});
  res.json(student)
})
router.get("/login", (req, res) => {
  try {
    res.json({ message: "login" });
  } catch (err) {
    res.json({ err });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({username});
    if (!user) {
      return res.status(401).json({ message: "incorrect credintials",username,password,user });
    }
    if(user.role == "admin"){
      const isPasswordCorrect = password == user.password //await bcrypt.compare(password,user.password);
      if(isPasswordCorrect){
        const token = jwt.sign({userid:user._id}, process.env.JWT_SECRET_ADMIN);
        res.cookie("token",token,{httpOnly:true});
        return res.status(200).redirect("/admin/dashboard")
      }else{
        return res.status(403).json({msg:"incorrect password"})
      }
    }else{
      return res.status(401).json({message:"you are not authorized to this section!!! please go back!!!",user})
    }
    
  } catch (error) {}
});

router.post("/register",authMiddleware,async (req,res)=>{
  try{
   const {username,password,role} = req.body;
   const hashedPassword = await bcrypt.hash(password,10)
  const savedUser = await User.create({username,role,password:hashedPassword});
  res.status(200).redirect("users/"+savedUser._id)
  }
  catch(err){
res.status(402).json({msg:err.message})
  }
})

router.get("/users",authMiddleware,async (req,res)=>{
  try{
    const users = await User.find();
    res.status(200).json(users);
  }
  catch(err){
    res.status(401).json({msg:err.message})
  }
})

router.get("/users/:id",authMiddleware, async (req,res)=>{
  try {
    const id = req.params.id || null;
    const user = await User.findById(id);
    res.status(200).json({user})
  } catch (error) {
    res.status(501).json({msg:error.message})
  }
})
router.delete("/users/:id",authMiddleware, async (req,res)=>{
  try {
    const id = req.params.id || null;
    const user = await User.findByIdAndDelete(id);
    res.status(200).json({user})
  } catch (error) {
    res.status(501).json({msg:error.message})
  }
})

router.put("/user/:id",authMiddleware,async (req,res)=>{
  try {
    const id = req.params.id;
   const {username,password,role} = req.body;
   const hashedPassword = await bcrypt.hash(password, process.env.SECRET);
   const updatedUser = await User.findByIdAndUpdate(id,{username,role,password:hashedPassword});
   res.status(202).redirect("/user/"+updatedUser._id)
  } catch (error) {
    res.status(403).json({msg:error.message})
  }
})

router.get("/register",authMiddleware,(req,res)=>{
  try{
    res.status(200).json("/registering page")
  }catch(err){
    res.status(501).json({msg:err.message})
  }
})

router.get("/", (req, res) => {
  res.render("admin/index", { layout: adminLayout });
});

module.exports = router;
