import  express, { urlencoded }  from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))
app.use(express.json({
    limit : "20kb"
}))
app.use(urlencoded({
    extended: true,
    limit : "20kb"
}))
app.use(express.static("public"))
app.use(cookieParser())

//import routes
import userRouter from "./routers/user.route.js";
import tweetRouter from "./routers/tweet.route.js";
import videoRouter from "./routers/video.route.js";
import subscriptionRouter from "./routers/subscription.routes.js";




// router declaration
app.use('/api/v1/users', userRouter)
app.use('/api/v1/tweets', tweetRouter)
app.use('/api/v1/videos', videoRouter)
app.use('/api/v1/subscriptions', subscriptionRouter)

export default app;