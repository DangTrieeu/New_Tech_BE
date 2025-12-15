const authRouter = require("./authRoute");
const userRouter = require("./userRoute");
const aiRouter = require("./aiRoute");
const adminRouter = require("./adminRoute");
const roomRouter = require("./roomRoute");

function route(app) {
  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/rooms", roomRouter);
  app.use("/ai", aiRouter);
  app.use("/admin", adminRouter);
}

module.exports = route;