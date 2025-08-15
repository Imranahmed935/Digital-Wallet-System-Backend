export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  AGENT = "AGENT",
}


export interface IUser {
    name:string,
    email:string,
    password:string,
    role:Role,
}