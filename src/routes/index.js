const authRouter = require("./authRoute");
const messageRouter = require("./messageRoute");
const userRouter = require("./userRoute");
const roomRouter = require("./roomRoute");

function route(app) {
    app.use("/auth", authRouter);
    app.use("/api/users", userRouter);
    app.use("/api/messages", messageRouter);
    app.use("/api/rooms", roomRouter);
}

module.exports = route;