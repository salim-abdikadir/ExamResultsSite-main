require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const connectDB = require("./server/config/db.js");
const cookieParser = require("cookie-parser");
const mongoStore = require("connect-mongo");
const session = require("express-session");
const methodOverride = require("method-override");
const app = express();

//Middlewares
connectDB();
//static files
app.use(express.static("public"));

//ejs layouts
app.use(expressLayouts);
app.set("layout", "layouts/main");
app.set("view engine", "ejs");
//to allow method overrid
app.use(methodOverride("_method"));
//to red from a form
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//cookie parser
app.use(cookieParser());
app.use(
  session({
    secret: "hello world",
    resave: false,
    saveUninitialized: true,
    store: mongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
    }),
    cookie: { Date: new Date(Date.now() + 3600000) },
  })
);
// Routes
app.use("/", require("./server/routes/main"));
app.use("/admin", require("./server/routes/admin"));

const PORT = 3000 || process.env.PORT;
app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(PORT, () => {
  console.log("started server at " + PORT);
});
