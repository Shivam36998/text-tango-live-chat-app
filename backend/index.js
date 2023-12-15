import express from "express";
import connectdb from "./db/connectdb.js";
import auth from "./routes/auth.js";
import chats from "./routes/chat.js";
import cors from "cors";
import http from 'http';
import { Server as SocketIoServer } from 'socket.io';

const app = express();
const port = process.env.port || 3001;
const DATABASE_URL = process.env.DATABASE_URL || "mongodb://127.0.0.1/27017";
connectdb(DATABASE_URL);

app.use(express.json());
app.use(cors());
app.use("/user", auth);
app.use("/chat", chats);

let server;

try {
    server = app.listen(port, () => {
        console.log(`server listening at http://localhost:${port}`);
    })
} catch (error) {
    console.log("port problem : ", error)
}
const io = new SocketIoServer(server, {
    cors: {
        origin: "*",
        methods: ["GET, POST"],
    }
});

// Mapping to store user information
let userArr = [];

const removeUser = (socketId) => {
    userArr = userArr.filter( user => user.socketId !== socketId);
}
const getUser = (userId) => {
    return userArr.find(item => item.userId === userId);
}

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on("setup", user => {
        const existingUser = userArr.find(item => item.user === user);

        if (existingUser) {
            // User is reconnecting, update the socketId
            existingUser.socketId = socket.id;
            console.log(`User ${user} reconnected with socket ID ${socket.id}`);
        } else {
            // New connection, add to the userArr
            userArr.push({ user, socketId: socket.id });
            console.log(`User ${user} connected with socket ID ${socket.id}`);
        }

        socket.join(user);
        socket.emit("connected", userArr);
    });

    socket.on('disconnect', () => {
        console.log("a user disconnected", socket.id);
        removeUser(socket.id);
        socket.emit("connected", userArr);
    });

    socket.on("sendMessage", (payload) => {
        const user = getUser(payload.receiverId);
        io.to(user?.socketId).emit("recieveMessage", payload)
    })
});
