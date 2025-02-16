// Load environment variables at the top
require("dotenv").config();

// Import necessary libraries
const express = require("express");
const colors = require("colors");
const cors = require("cors");
const debug = require("debug")("server");
const connectDB = require("./config/db");
const chats = require("./data/data");
const path = require("path");

// Import routes
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Import middleware
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to accept JSON data

// CORS options
const corsOptions = {
    origin: ["http://localhost:5173"],
};
app.use(cors(corsOptions));

// Connect to Database
connectDB();

// Define port
const PORT = process.env.PORT || 3000;



// Use Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// ---------------------Deployment--------------
const __dirname1 = path.resolve()
if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname1,"/frontend/build")))

    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname1,"frontend","build","index.html"));
    })
}else{
    app.get("/", (req, res) => {
        res.send("API IS RUNNING");
    });
}
// ---------------------Deployment--------------

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`.blue.bold);
});

// Socket.io Setup
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:5173",
    },
});

io.on("connection", (socket) => {
    console.log("Connected to Socket.IO".magenta.bold);

    socket.on("setup", (userdata) => {
        if (!userdata?._id) {
            console.log("Invalid user data received");
            return;
        }
        socket.join(userdata._id);
        console.log(`User joined room: ${userdata._id}`);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
       socket.join(room);
       console.log("User joined room"+ room);
    });

    socket.on("new message", (newMessageRecieved)=>{
        if(userRoutes._id==newMessageRecieved.sender._id) return;
        socket.in(userRoutes._id).emit("message recieved", newMessageRecieved)
    })

    socket.on("typing",(room)=> socket.in(room).emit("typing"))
    socket.on("stop typing",(room)=> socket.in(room).emit("stop typing"))



    socket.on("disconnect", () => {
        console.log("User disconnected from Socket.IO".red.bold);
    });
});

// Graceful Shutdown Handling
process.on("SIGTERM", () => {
    console.log("Shutting down gracefully...");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});
