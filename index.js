const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const handlebars = require("express-handlebars");
const Handlebars = require("handlebars");
const {Server} = require("socket.io");
const messagesRouter = require("./src/routes/messagesRouter");
const messagesModel = require("./src/models/messages");
const chatRouter = require("./src/routes/chatRouter");

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.SERVER_PORT || 8081;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

const httpServer = app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
});

app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/src/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname + "/src/public"));

app.post("/socketMessage", (req, res) => {
    const { message } = req.body;
    socketServer.emit("message", message);
    res.send("ok");
});
app.use("/messages", messagesRouter);
app.use("/chat", chatRouter);

//MongoDB
const environment = async () => {
    try {
        await mongoose.connect(
        `mongodb+srv://${DB_USER}:${DB_PASS}@codercluster.zrkv6ij.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`
        );
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(`Failed to Connecto to MongoDB: ${error}`);
    }
};
const isValidStartData = () => {
    if (DB_PASS && DB_USER) return true;
    else return false;
};
isValidStartData() && environment();

//WebChat
const messages = [];
let users = [];
const socketServer = new Server(httpServer);

socketServer.on("connection", (socket) =>{
    socket.on("newUser", (data) =>{
        socket.user = data.user; 
        socket.id = socket.id;
        users.push(data);
        socketServer.emit("usersLogs", users);
        socketServer.emit("newUserConnected", {
            user: data.user,
            id: socket.id,
            users,
        });
    });
    socket.on("disconnect", () =>{
        const userFilter = users.filter((elem) => elem.id !== socket.id);
        users = [].concat(userFilter);
        socketServer.emit("usersLogs", users);
        socketServer.emit("userDisconnected", {
            user: socket.user,
            id: socket.id,
        });
    });
    socket.on("message", (data) =>{
        messages.push(data);
        socketServer.emit("messageLogs", messages);
        messagesModel.create(data);
    });
});