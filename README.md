# Digital Wallet System

A full-featured **Digital Wallet System** backend built with **Node.js, Express, MongoDB (Mongoose)**.  
This system supports users, agents, wallets, transactions, and admin functionalities including wallet management, agent approval, and system parameter configuration.

---

## **Table of Contents**

- [Features](#features)  
- [Technologies](#technologies)  
- [Project Structure](#project-structure)  
- [Installation](#installation)  
- [Environment Variables](#environment-variables)  
- [API Endpoints](#api-endpoints)  
- [Admin Functionalities](#admin-functionalities)  

---

## **Features**

- **User Management**  
  - Register users and agents  
  - Automatic wallet creation upon registration  
  - Password hashing for security  

- **Wallet Management**  
  - Add money  
  - Block/unblock wallets  
  - Dynamic fees based on system parameters  

- **Transactions**  
  - Deposit, transfer, and withdrawal operations  
  - Transaction history tracking  

- **Admin Functionalities**  
  - View all users, agents, wallets, and transactions  
  - Approve/suspend agents  
  - Block/unblock wallets  
  - Set and update system parameters (transaction fees, limits, minimum balance)  

- **Security**  
  - JWT-based authentication  
  - Role-based access control  

---

## **Technologies**

- **Backend:** Node.js, Express  
- **Database:** MongoDB, Mongoose  
- **Authentication:** JWT  
- **Password Hashing:** bcryptjs  
- **Validation & Error Handling:** Custom AppError class  

---

## **Project Structure**

