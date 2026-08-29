# 🌾 THE FARM BROTHERS — Direct Farm-to-Doorstep Organic Platform

> **From Our Farm For Your Family**
> 
> *Digitizing the direct farm-to-doorstep journey: Daily A2 Gir cow milk, fresh chemical-free organic produce, vermicompost, and natural spices directly from Lal Balram Organic Farm (Rojapar, Arwal, Bihar - 804401) delivered to doorsteps by 7:00 AM.*

---

## 🌐 Live Production Links

- 🚀 **Live Next.js Frontend (Vercel)**: [https://the-farm-brothers.vercel.app](https://the-farm-brothers.vercel.app) *(or your Vercel deployment URL)*
- ⚡ **Live Express/Node Backend API (Render)**: [https://the-farm-brothers.onrender.com](https://the-farm-brothers.onrender.com)
- 🏥 **API Health Check**: [https://the-farm-brothers.onrender.com/api/health](https://the-farm-brothers.onrender.com/api/health)
- 📍 **Google Maps Location**: [Lal Balram Organic Farm, Rojapar, Arwal, Bihar 804401](https://www.google.com/maps/search/?api=1&query=Lal+Balram+Organic+Farm+Rojapar+Arwal+Bihar+804401)
- 📦 **GitHub Repository**: [Manjeet-code/The-Farm-Brothers](https://github.com/Manjeet-code/The-Farm-Brothers.git)

---

## 💡 Project Vision & Core Idea

Traditional agricultural supply chains involve multiple middlemen, leading to high spoilage, unorganized logistics, and delayed delivery. **The Farm Brothers** platform directly connects **Lal Balram Organic Farm** (located at Rojapar, Arwal, Bihar) with urban households through an intelligent, zone-managed subscription system:

1. **Guaranteed 7:00 AM Morning Delivery**: Fresh A2 Gir Cow Milk and organic vegetables delivered before 7:00 AM.
2. **Nightly Cutoff Lock (9:30 PM)**: Automated cutoff locks nightly harvest requirement for farms and batches delivery routes.
3. **Route Batching across Bihar Corridors**: Efficient delivery route management across `Arwal-Patna`, `Arwal-Jehanabad`, `Arwal-Aurangabad`, and `Arwal-Gaya`.
4. **Dual Delivery Ops Modes**:
   - **Desk Manager Mode**: Hub-level packing, item substitutions, stock ceilings, and vehicle dispatching.
   - **Mobile Field Mode**: Driver route sequence cards, 1-tap customer call, GPS navigation, and mandatory doorstep drop photo proof.
5. **Instant Quality Defect Wallet Refunds**: Photo-verified quality claims (short weight, damaged items) with 1-click admin approval and instant in-app wallet credits.

---

## 🚀 Key Modules & Features

### 🛒 1. Customer Landing Page & Storefront
- **Light Theme Modern Landing Page (`/`)**: Value pillars, offering highlights, farm story, and direct Google Maps location pin.
- **Dedicated Product Catalog (`/storefront`)**: A2 Gir Cow Milk, Organic Turmeric Powder, Cold Pressed Oils, Fresh Vegetables, Vermicompost.
- **Flexible Subscriptions**: Daily, Alternate Days, or Custom Day selection with 1-click Pause, Resume, Skip Day, and Quantity adjustments.
- **Pincode Serviceability Checker**: Live pincode validation mapping addresses to delivery routes (*e.g., 804401*).
- **In-App Wallet & Mock Payment Gateway**: Integrated checkout supporting Mock UPI/Card payment and instant wallet refunds.

### 🚚 2. Delivery Logistics & Field Operations Dashboard
- **Route Operational Zones**: Zone capacity management, staff assignment, and pincode coverage.
- **Harvest & Packing Workflow**: Item-by-item status updates (`Pending` ➔ `Harvested` ➔ `Packed` ➔ `Substituted`).
- **Vehicle Dispatch**: Dispatch deadline management (4:30 AM) and vehicle dispatch status tracking.
- **Mobile Field Mode**: Stop sequence cards (`STOP #1`, `STOP #2`), 1-tap calling, GPS navigation, and mobile camera photo proof upload.

### 🛡️ 3. Super Admin & Executive Analytics
- **Live Platform Metrics**: Real-time revenue, daily order volume, and 7 AM SLA compliance rate (%).
- **Quality Defect Desk**: Photo evidence review for quality claims with 1-click wallet credit refunds.
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

## 🔑 One-Click Demo Accounts

Use these one-click buttons on the Login page (`/login`) or sign in manually with password **`password123`**:

| Role | Account Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| 🧑‍🌾 **Customer** | Manjeet | `customer@farmfresh.com` | `password123` |
| 🚚 **Delivery Ops** | Ramesh Ops | `ops.gomti@farmfresh.com` | `password123` |
| 👑 **Super Admin** | Platform Admin | `admin@farmfresh.com` | `password123` |

---

## 🛠️ Technology Stack

```
[ Frontend: Next.js 16 (App Router, Turbopack, React, TypeScript, Vanilla CSS + Tailwind) ]
                                   │
                                   ▼ HTTP REST API (JWT Auth)
                                   │
[ Backend: Node.js, Express, TypeScript, Security Middleware, Cors ]
                                   │
                                   ▼ Mongoose ODM
                                   │
[ Database: MongoDB Atlas (Users, Orders, Subscriptions, Zones, Issues, AuditLogs) ]
```

- **Frontend**: Next.js 16, React 19, TypeScript, Vanilla CSS, Tailwind CSS, Axios, Lucide Icons.
- **Backend**: Node.js, Express.js, TypeScript, JSON Web Token (JWT).
- **Database**: MongoDB Atlas & Mongoose ODM.
- **Hosting**: Next.js on **Vercel**, Express API on **Render**.

---

## ⚡ Local Setup & Execution

### 1. Clone Repository
```bash
git clone https://github.com/Manjeet-code/The-Farm-Brothers.git
cd The-Farm-Brothers
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://manjeet_db:jNcmXu20QMN3cGk3@cluster0.q8tyo63.mongodb.net/agro-organic-store?retryWrites=true&w=majority
JWT_SECRET=farmfresh_jwt_secret_key_2026_dev
NODE_ENV=development
```

Run seed and start development server:
```bash
# Seed initial products & admin account
npm run seed

# Start server
npm run dev
```

### 3. Frontend Setup
In a new terminal:
```bash
cd client
npm install
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 📜 License & Author

Developed with ❤️ by **Manjeet** for **The Farm Brothers** (Lal Balram Organic Farm, Rojapar, Arwal, Bihar - 804401).
- **Repository**: [github.com/Manjeet-code/The-Farm-Brothers](https://github.com/Manjeet-code/The-Farm-Brothers)
