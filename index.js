require("dotenv").config();
const express = require("express");
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const connectDB = require("./src/utils/connectDB");
const route = require("./src/routes/index");
const chatSocket = require("./src/sockets/chatSocket");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

// Init socket
chatSocket(io);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Init routes
route(app);

connectDB().then(async () => {

  const port = process.env.PORT;
  const hostname = process.env.HOST_NAME || "localhost";

  server.listen(port, hostname, () => {
    console.log(`Server đang chạy tại http://${hostname}:${port}`);
  });
});