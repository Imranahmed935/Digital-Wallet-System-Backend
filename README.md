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



