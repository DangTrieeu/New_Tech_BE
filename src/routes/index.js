const authRouter = require("./authRoute");
const messageRouter = require("./messageRoute");
const userRouter = require("./userRoute");
const aiRouter = require("./aiRoute");
const roomRouter = require("./roomRoute");
const adminRouter = require("./adminRoute");

function route(app) {
    app.use("/auth", authRouter);
    app.use("/users", userRouter);
    app.use("/ai", aiRouter);
    app.use("/api/rooms", roomRouter);
    app.use("/admin", adminRouter);
}

module.exports = route;