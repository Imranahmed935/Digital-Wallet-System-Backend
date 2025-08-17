import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./App/config/env";
import { seedSuperAdmin } from "./App/utils/seedSuperAdmin";

let server:Server;

const runServer = async()=>{
    try {
        await mongoose.connect(envVars.DB_URL)
        console.log("Database Connected successfully!");
        server = app.listen(envVars.PORT, () => {
      console.log(`The server is Running on port ${envVars.PORT}`);
    });
    } catch (error) {
        console.log(error)
    }
}


(async()=>{
    await runServer()
    await seedSuperAdmin()
})()