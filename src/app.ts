import express, { Request, Response } from "express";
import cors from "cors";
import { userRouter } from "./App/modules/user/user.routes";
import { authRouter } from "./App/modules/auth/auth.routes";
import notFound from "./App/midleware/notFound";
import { walletRouter } from "./App/modules/wallet/wallet.routes";
import { agentRouter } from "./App/modules/agent/agent.route";
import { adminRouter } from "./App/modules/admin/admin.route";
import { envVars } from "./App/config/env";
import cookieParser from "cookie-parser";


const app = express();

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: envVars.FRONTEND_URL,
    credentials: true
}))

app.use("/api/v1", userRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", walletRouter);
app.use("/api/v1", agentRouter);
app.use("/api/v1", adminRouter);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Digital Wallet Server is Running!!!",
  });
});

app.use(notFound);

export default app;
