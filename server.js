const express = require("express")
const app = express()
const server = require("http").Server(app)
const io = require("socket.io")(server)
const mongoose = require("mongoose")
const bodyParser = require("body-parser")

// Use Express static middleware
app.use(express.static("public"))
app.use(express.json())

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://test:test123@week04.thgujhs.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err))

const ChatMessagee = require("./models/ChatMessageSchema")
const User = require("./models/UserSchema")

// Serve the index page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html")
})

// Serve the sign up page
app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html")
})

// Route to handle Sign Up
app.post("/signup", (req, res) => {
  const { username, password } = req.body
  const user = new User({ username, password })
  user.save((err) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, error: "Username already exists" })
    }
    return res.status(200).json({ success: true })
  })
})

// Serve the login page
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html")
})

// Route to handle Log In
app.post("/login", (req, res) => {
  const { username, password } = req.body
  User.findOne({ username }, (err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ success: false, error: "Incorrect username or password" })
    }
    if (user.password !== password) {
      return res
        .status(400)
        .json({ success: false, error: "Incorrect username or password" })
    }
    return res.status(200).json({ success: true })
  })
})

// Socket.IO events
io.on("connection", (socket) => {
  let currentRoom

  // Handle Join Room
  socket.on("join-room", (room) => {
    if (currentRoom) {
      socket.leave(currentRoom)
    }
    socket.join(room)
    currentRoom = room
  })

  // Handle Leave Room
  socket.on("leave-room", (room) => {
    socket.leave(room)
  })

  // Handle Chat Message
  socket.on("chat-message", (message) => {
    const ChatMessage = new ChatMessagee({
      username: socket.id,
      room: currentRoom,
      message: message,
    })
    ChatMessage.save()

    io.in(currentRoom).emit("chat-message", message)
  })

  // Handle User is Typing
  socket.on("typing", () => {
    socket.to(currentRoom).emit("typing", socket.id)
  })

  // Handle Logout
  socket.on("disconnect", () => {
    socket.leave(currentRoom)
  })
})

server.listen(8081, () => {
  console.log("Server is running...")
})
