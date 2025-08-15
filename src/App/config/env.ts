import dotenv from "dotenv"

dotenv.config()

export interface EnvConfig {
    PORT:string,
    DB_URL:string

}

const loadEnv = (): EnvConfig =>{
const requiredEnv :string[]= [
    "PORT",
    "DB_URL"
]
requiredEnv.forEach((key)=>{
    if(!process.env[key]){
        throw new Error (`Missing require environment variable ${key}`)
    }
});

return{
    PORT:process.env.PORT as string,
    DB_URL:process.env.DB_URL!
}
}

export const envVars = loadEnv();

