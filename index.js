import express from "express" 
import mongoose from "mongoose"
import userRouter from "./routes/userRouter.js"
import jwt from "jsonwebtoken"
import productRouter from "./routes/productRouter.js"

const mongoURI = "mongodb+srv://admin:1234@cluster0.qm2rfgm.mongodb.net/?appName=Cluster0"

mongoose.connect(mongoURI).then(
    ()=>{
        console.log("Connected to mongoDB cluster")
    }
)

//create express app
const app = express()

//middleware to parse json data from request body
app.use(express.json())

app.use(
    (req,res,next)=>{
        const authorizationHeader = req.header("Authorization")
        
        if(authorizationHeader != null){

            const token = authorizationHeader.replace("Bearer ","")

            jwt.verify(token, "secretKey96$2025",
                (error, content)=>{

                    if(content == null){
                        console.log("Invalid token")
                        res.json({
                            message : "Invalid token"
                        })

                    }else{
                        req.user = content
                        next()
                    }
                }
            )
        }else{
            next()
        }

})


app.use("/users",userRouter)
app.use("/products",productRouter)


app.listen(3000, 
    ()=>{
        console.log("server is running on port 3000")   
    }
)
