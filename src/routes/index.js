const authRouter = require("./authRoute");
const messageRouter = require("./messageRoute");
const userRouter = require("./userRoute");
const aiRouter = require("./aiRoute");
const roomRouter = require("./roomRoute");

function route(app) {
    app.use("/auth", authRouter);
    app.use("/users", userRouter);
    app.use("/ai", aiRouter);
    app.use("/auth", authRouter);
    app.use("/api/users", userRouter);
    app.use("/api/messages", messageRouter);
    app.use("/api/rooms", roomRouter);
}

module.exports = route;