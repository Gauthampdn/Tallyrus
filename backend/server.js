require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

const cors = require('cors');

// express app
const app = express()

// middleware
app.use(express.json()) // to get req body

app.use(cors({
  origin: ['http://localhost:3000', 'https://tallyrus.com'],
  credentials: true
}));

// Session middleware: must be set up before passport.initialize() and your routes.
app.use(session({
  secret: "keyboard cat",  // use a proper secret in production
  resave: false,
  saveUninitialized: false, // only create session if something is stored
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "lax",                // allows cross-site cookie sending in development
    secure: false                   // false for HTTP (set to true if using HTTPS)
    // domain: 'localhost' // optionally add for local development if needed
  }
}));



app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log(req.method, req.path)
  next()
})

//routes
app.use("/auth", authRoutes)
app.use("/openai", openaiRoutes)
app.use("/classroom", classroomRoutes)
app.use("/assignments", assignmentRoutes)
app.use("/files", filesRoutes)
app.use("/stripe", stripeRoutes);

// Use routes
app.use("/auth", authRoutes);
app.use("/stripe", stripeRoutes);
app.use("/openai", openaiRoutes);
app.use("/classroom", classroomRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/files", filesRoutes);

// connect to db
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("connected to DB and listening on the port " + process.env.PORT);
    })
  })
  .catch((err) => {
    console.log(err);
  })


// listening on port 

