const authRouter = require("./authRoute");

function route(app) {
app.use("/auth",authRouter)
}

module.exports = route;