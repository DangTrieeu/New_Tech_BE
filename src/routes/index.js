const authRouter = require("./authRoute");
const userRouter = require("./userRoute");
const aiRouter = require("./aiRoute");

function route(app) {
  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/ai", aiRouter);
}

module.exports = route;