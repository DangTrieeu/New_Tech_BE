const authRouter = require("./authRoute");
const messageRouter = require("./messageRoute");

function route(app) {
    app.use("/auth", authRouter);
    app.use("/api/messages", messageRouter);
}

module.exports = route;