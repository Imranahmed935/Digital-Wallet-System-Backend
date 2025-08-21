# Digital Wallet API

A **secure digital wallet system** with multi-role access, transaction tracking, and wallet management. Built using **Node.js, Express, MongoDB, and Mongoose**.

---

## **Minimum Functional Requirements**

### **Authentication & Security**
- ✅ JWT-based login system with three roles: `admin`, `user`, `agent`.  
- ✅ Secure password hashing using `bcryptjs`.  
- ✅ Role-based route protection for secure endpoints.  

### **Wallet & Transactions**
- ✅ Automatic wallet creation for each user and agent upon registration with an **initial balance of ৳50**.  
- ✅ All transactions are stored and fully trackable.  

### **User Functionalities**
- ✅ Add money (top-up).  
- ✅ Withdraw money.  
- ✅ Send money to another user.  
- ✅ View transaction history.  

### **Agent Functionalities**
- ✅ Add money to any user's wallet (cash-in).  
- ✅ Withdraw money from any user's wallet (cash-out).  
- ✅ View their commission history.  

### **Admin Functionalities**
- ✅ View all users, agents, wallets, and transactions.  
- ✅ Block/unblock user wallets.  
- ✅ Approve/suspend agents.  
- ✅ Set system parameters (e.g., transaction fees).  

---

## **Technologies Used**
- **Backend:** Node.js, Express  
- **Database:** MongoDB, Mongoose  
- **Authentication:** JWT  
- **Password Hashing:** bcryptjs  
- **Validation & Error Handling:** Custom AppError  

---

## 📌 Summary of All Implemented Endpoints

### 🔐 Authentication
| Method | Endpoint          | Description                          | Access  |
|--------|-------------------|--------------------------------------|---------|
| POST   | `/api/v1/register` | Register as `user` or `agent`       | Public  |
| POST   | `/api/v1/login`    | Login and get JWT token             | Public  |

---

### 👤 User Endpoints
| Method | Endpoint                  | Description                      | Access |
|--------|---------------------------|----------------------------------|--------|
| POST   | `/api/v1/add`   | Add money (top-up)                         | User   |
| POST   | `/api/v1/withdraw` | Withdraw money                          | User   |
| POST   | `/api/v1/send`  | Send money to another user                 | User   |
| GET    | `/api/v1/transactions/:userId`| View own transaction history | User   |

---

### 🏦 Agent Endpoints
| Method | Endpoint                        | Description               | Access |
|--------|---------------------------------|---------------------------|--------|
| POST   | `/api/v1/cash-in`            | Add money to a user wallet   | Agent  |
| POST   | `/api/v1/cash-out`           | Withdraw money from a user   | Agent  |
| GET    | `/api/v1/commission/:agentId`| View commission history      | Agent  |

---

### 🛠️ Admin Endpoints
| Method | Endpoint                       | Description              | Access |
|--------|--------------------------------|---------------------------------- |--------|
| GET    | `/api/v1/users`        | View all users and agents        | Admin  |
| GET    | `/api/v1/agents`       | View all agents                  | Admin  |
| GET    | `/api/v1/wallets`      | View all wallets                 | Admin  |
| GET    | `/api/v1/transactions` | View all transactions            | Admin  |
| PATCH  | `/api/v1/wallet/block` | Block a user wallet              | Admin  |
| PATCH  | `/api/v1/agent/status` | Unblock a user wallet            | Admin  |
---




