import  express, { Request, Response }  from "express";
import cors from "cors"
import { userRouter } from "./App/modules/user/user.routes";

const app = express();

app.use(express.json())
app.use(cors());

app.use("/api/v1", userRouter)

app.get("/", (req:Request, res:Response)=>{
    res.status(200).json({
        message:"Digital Wallet Server is Running!!!"
    })
})

export default app;