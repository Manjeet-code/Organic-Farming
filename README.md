# 🌿 FarmFresh Direct — Farm-to-Doorstep Daily Organic Subscription & Route Logistics Platform

> **A Next-Generation Direct-to-Consumer (D2C) Organic Farming & Daily Subscription System.**
> 
> *Digitizing the end-to-end farm-to-doorstep journey: daily A2 milk & fresh organic produce subscriptions, strict 9:30 PM cutoff locks, automated Bihar delivery route batching, harvest-to-pack logistics, 7:00 AM SLA doorstep drops with photo proof, and instant quality defect wallet refunds.*

---

## 💡 Project Vision & Core Idea

Traditional organic farming supply chains suffer from high spoilage, unorganized logistics, and missed morning delivery deadlines. **FarmFresh Direct** bridges organic farmers directly with urban households through a smart, zone-managed subscription platform:

1. **Daily Morning SLA Delivery (7:00 AM)**: Fresh A2 cow milk and daily organic produce delivered directly to doorsteps before 7 AM.
2. **Nightly Cutoff Lock (9:30 PM)**: Automated order cutoff at 9:30 PM every evening to lock harvest requirements for local farms and batch delivery routes.
3. **Route Logistics Batching**: Operational route batching across key Bihar delivery corridors (`Arwal-Patna`, `Arwal-Jehanabad`, `Arwal-Aurangabad`, `Arwal-Gaya`).
4. **Mobile Field Experience for Delivery Staff**: Smartphone-optimized stop sequences, 1-tap customer calling, GPS navigation, and mandatory doorstep drop photo proof.
5. **Instant Quality Resolution**: Photo-verified quality defect claims (weight short, damaged produce) with 1-click admin approval and instant in-app wallet refunds.

---

## 🚀 Key Features & Modules

### 🛒 1. Customer Shopping & Subscription Engine
- **Product Catalog**: A2 Cow Milk, Organic Turmeric Powder, Cold Pressed Oils, Fresh Vegetables & Fruits.
- **Flexible Subscriptions**: Daily, Alternate Days, or Custom Day selection with 1-click Pause, Resume, and Quantity adjustments.
- **Pincode Serviceability Checker**: Live pincode validation mapping addresses to operational routes.
- **In-App Wallet & Mock Payment Gateway**: Integrated checkout supporting Mock UPI/Card payment and instant wallet refunds.

### 🚚 2. Logistics & Delivery Operations Dashboard
- **Route Operational Zones**: Zone capacity management, staff assignment, and pincode coverage.
- **Item Harvesting & Packing Workflow**: Item-by-item status updates (`Pending` ➔ `Harvested` ➔ `Packed` ➔ `Substituted`).
- **Batch Vehicle Dispatch**: Dispatch deadline management (4:30 AM) and vehicle dispatch status tracking.
- **Mobile Field Experience (Phase 14)**:
  - Stop sequence cards (`STOP #1`, `STOP #2`).
  - **`📞 Call Customer`** & **`📍 GPS Directions`** links.
  - **`📸 Doorstep Proof Photo Upload`**: Direct mobile camera upload saving Base64 proof images to MongoDB.

### 🛡️ 3. Super Admin & Executive Analytics
- **Live Platform Metrics**: Real-time total revenue, daily order volume, and 7 AM SLA compliance rate (%).
- **Quality Defect Claim Desk**: Photo evidence review for quality claims with 1-click wallet credit refunds.
- **Immutable Security Audit Trail**: Detailed audit logs capturing every critical system action (`LOGIN`, `ORDER_PLACED`, `CUTOFF_LOCKED`, `DISPATCHED`, `DELIVERED`, `REFUNDED`).

---

## 🗺️ Operational Delivery Routes (Bihar Corridor)

| Route ID | Route Name | Pincodes Covered | Primary Hub |
| :--- | :--- | :--- | :--- |
| **Route 1** | **Arwal — Patna Route** | `804401`, `804402`, `800001`, `800002`, `800020` | Arwal / Patna Hub |
| **Route 2** | **Arwal — Jehanabad Route**| `804401`, `804408`, `804417`, `804429` | Jehanabad Hub |
| **Route 3** | **Arwal — Aurangabad Route**| `804401`, `824101`, `824102`, `824123` | Aurangabad Hub |
| **Route 4** | **Arwal — Gaya Route** | `804401`, `823001`, `823002`, `823003` | Gaya Hub |

---

## 🔑 Pre-Configured One-Click Demo Accounts

Use these one-click buttons on the Login page (`/login`) or sign in manually with password **`password123`**:

| Role | Account Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| 🧑‍🌾 **Customer** | Manjeet | `customer@farmfresh.com` | `password123` |
| 🚚 **Delivery Ops** | Ramesh Ops | `ops.gomti@farmfresh.com` | `password123` |
| 👑 **Super Admin** | Platform Admin | `admin@farmfresh.com` | `password123` |

---

## 🛠️ Technology Stack

```
[ Frontend: Next.js 16 (App Router, Turbopack, React, TypeScript, Tailwind CSS) ]
                                   │
                                   ▼ HTTP REST API (JWT Auth)
                                   │
[ Backend: Node.js, Express, TypeScript, Rate-Limiter, Security Middleware ]
                                   │
                                   ▼ Mongoose ODM
                                   │
[ Database: MongoDB (Users, Orders, Subscriptions, Zones, Issues, AuditLogs) ]
```

- **Frontend**: Next.js 16, React 19, TypeScript, Vanilla CSS + Tailwind, Axios, Lucide Icons.
- **Backend**: Node.js, Express.js, TypeScript, JSON Web Token (JWT), Security Rate Limiting.
- **Database**: MongoDB & Mongoose ORM.
- **Build Tools**: Turbopack, TSX, Node test runner.

---

## ⚡ Quick Start & Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Manjeet-code/Organic-Farming.git
cd Organic-Farming
```

### 2. Configure Backend Server
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farmfresh
JWT_SECRET=farmfresh_super_secret_jwt_key_2026
NODE_ENV=development
```

Start the Backend Server & Seed Initial Data:
```bash
# Seed initial products & admin account
npx tsx seedProducts.ts
npx tsx seedAdmin.ts

# Start backend server
npm run dev
```

### 3. Configure Client (Next.js)
In a new terminal window:
```bash
cd client
npm install
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 🧪 Production Verification & Build
To verify the full production build:
```bash
cd client
npm run build
```
*(Build compiles with zero TypeScript errors across 9 static route pages).*

---

## 📜 License & Author

Developed with ❤️ by **Manjeet** for Organic Farming & Direct-to-Consumer Agricultural Supply Chain Innovation.
- **GitHub Repository**: [Manjeet-code/Organic-Farming](https://github.com/Manjeet-code/Organic-Farming)
