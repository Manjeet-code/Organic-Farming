# Product Requirements Document (PRD)
## FarmFresh Direct — Farm-to-Doorstep Delivery & Subscription Platform

| | |
|---|---|
| **Document Owner** | FarmFresh Direct |
| **Version** | 1.0 |
| **Status** | Draft |
| **Last Updated** | 28 Aug 2026 |

---

## 1. Executive Summary

FarmFresh Direct is a digital farm-to-doorstep ordering and subscription platform that connects **customers**, **delivery-ops staff**, and **platform administrators** in a single workflow. Customers order fresh fruits, vegetables, milk and dairy online (as a one-time purchase or a recurring subscription), the assigned delivery zone's ops staff harvest/collect, pack, and dispatch the order overnight, and it is delivered directly from the farm to the customer's doorstep by 7 AM the next morning. The admin oversees the entire platform — delivery zones, catalog, subscriptions, and overall operations.

The platform will be built and shipped in **incremental phases**, each phase delivering a working, testable slice of the product rather than one large release.

---

## 2. Goals & Objectives

- Digitize the end-to-end ordering, subscription, fulfillment, and delivery process.
- Guarantee a same-night-harvest, next-morning-by-7AM delivery promise by routing orders to the nearest delivery zone automatically.
- Give admins full visibility and control over zones, catalog, staff, and platform health.
- Provide a transparent, trackable status pipeline for customers (Placed → Harvested → Packed → Out for Delivery → Delivered).
- Build a scalable, secure, trust-friendly system suitable for perishable-goods commerce (freshness guarantees, recurring billing, quality issues).

## 3. Non-Goals (Out of Scope for v1)

- Fully automated route optimization / logistics AI (manual zone-based dispatch by delivery-ops in v1).
- Third-party payment gateway for live auto-billing (v1 will track billing status manually against a mock payment API; real gateway integration comes later).
- Mobile native apps (v1 is a responsive web platform only).
- Multi-farm marketplace / onboarding external farmers (v1 is single-farm only).

---

## 4. Stakeholders & User Roles

| Role | Description |
|---|---|
| **Customer** | Registers, browses the catalog, places one-time orders or subscriptions, uploads quality-issue evidence, tracks order status, views billing/wallet. |
| **Delivery-Ops Staff** | Assigned to a specific delivery zone/route. Processes orders routed to their zone, updates harvest/pack/dispatch status, resolves quality issues, records disbursement-equivalent (proof of delivery). |
| **Admin (Super Admin)** | Manages delivery zones, delivery-ops staff, product catalog, pricing, platform-wide reports, customer management, and system configuration. |

> **Note:** We can also define a secondary role like **Farm/Harvest Coordinator** later if needed — flagging as a possible Phase 8+ addition.

---

## 5. High-Level System Architecture (Assumption)

Since exact tech preferences weren't specified, this PRD assumes a modern, commonly-used stack. Adjust as per your actual stack before development.

- **Frontend:** React.js (with role-based routing for 3 dashboards) + Tailwind CSS
- **Backend:** Node.js (Express) or equivalent REST/GraphQL API layer
- **Database:** MongoDB (document-oriented, given flexible order/subscription/item structures)
- **File Storage:** Cloud storage (S3 or equivalent) for quality-issue photos and proof-of-delivery images
- **Auth:** JWT-based auth with role-based access control (RBAC)
- **Notifications:** Email/SMS/WhatsApp via third-party provider (e.g., Twilio, SendGrid)
- **Hosting:** Cloud provider (AWS/GCP/Azure) with staging + production environments

*(If your original build used a different stack, this PRD's phases still apply — only the "Tech Setup" tasks in Phase 1 need adjusting.)*

---

## 6. Core Entities / Data Model (Overview)

- **User** (customer): id, name, email, phone, address, pincode, password hash, role, wallet_balance, status
- **DeliveryOpsStaff**: id, name, email, zone_id, phone, status
- **DeliveryZone**: id, zone_name, city/region, pincode range, cutoff_time, dispatch_deadline, daily_capacity, staff_id
- **Admin**: id, name, email, permissions
- **Product**: id, name (Tomatoes/Milk/Paneer, etc.), category (fruit/vegetable/dairy), unit, price, daily_stock_ceiling, substitute_product_id
- **Order**: id, user_id, zone_id (auto-assigned), subscription_id (nullable), items, delivery_date, status (Placed/Cutoff Locked/Zone Assigned/Harvesting/Packed/Out for Delivery/Delivered/Failed), created_at, assigned_to, remarks
- **Subscription**: id, user_id, frequency (weekly/monthly), delivery_days, items, discount_percent, status (Active/Paused/Cancelled), next_billing_date
- **QualityIssue**: id, order_id, product_id, issue_type, evidence_photo_url, resolution_status, resolved_by
- **AuditLog**: id, actor_id, actor_role, action, entity, timestamp
- **Notification**: id, user_id, type, message, read_status

---

## 7. Dashboard-Wise Feature Breakdown

### 7.1 Customer Dashboard
- Sign up / Login / Forgot Password / OTP verification
- Profile management (personal details, delivery address, pincode)
- Browse today's catalog / "Today's Harvest" (fruits, vegetables, milk, dairy)
- Place a one-time order (with cutoff-time countdown) or create a subscription (weekly/monthly, with tiered discount)
- Manage subscription (pause/skip a day, swap items, add one-time add-ons, cancel)
- Track order status with a visual stepper (Placed → Zone Assigned → Harvested → Packed → Out for Delivery → Delivered)
- Report a quality issue with photo evidence (spoiled/missing/wrong item)
- View wallet balance & billing history
- Notifications (status updates, cutoff reminders, substitution alerts)
- Raise a query/support ticket to the assigned delivery-ops zone

### 7.2 Delivery-Ops Dashboard
- Login (role-restricted)
- View all orders auto-routed to their zone for tonight (based on customer's pincode/region)
- Filter/sort orders by status, product category, delivery date
- View customer order detail & item list
- Update item-level fulfillment status (Harvested / Packed / Substituted / Out of Stock) with remarks
- Dispatch order (Out for Delivery / Delivered / Failed Delivery) with remarks, timestamp checked against the 7 AM window
- Resolve customer-reported quality issues (Replace / Refund / Wallet Credit / Reject claim)
- View zone-level performance (orders received, delivered, failed, avg on-time-by-7AM rate)
- Communicate with customer (status remarks / notifications)

### 7.3 Admin Dashboard
- Login (highest privilege role)
- **Zone Management:** Create/edit/deactivate delivery zones, assign pincode/region mapping, set cutoff & dispatch deadlines
- **Delivery-Ops Management:** Create/edit/deactivate delivery-ops accounts, assign to a zone
- **Customer Management:** View/search all customers, activate/deactivate accounts, view order/subscription history
- **Catalog Management:** Create/edit products, prices, daily stock ceilings, substitution mapping
- **Order Oversight:** View all orders platform-wide, override/reassign to a different zone if needed
- **Reports & Analytics:** Total orders, subscription retention rate, revenue, zone-wise performance, overdue/at-risk dispatches
- **Audit Logs:** Track all critical actions (who resolved/reassigned/edited what and when)
- **System Configuration:** Manage catalog templates, notification templates, platform settings
- **Role & Permission Management**

---

## 8. Core Workflow: Order & Subscription Lifecycle

```
Customer Registers/Logs in
        │
        ▼
Browses Catalog, Places One-Time Order or Creates Subscription
        │
        ▼
System auto-assigns nearest/relevant Delivery Zone (based on pincode/region)
        │
        ▼
At Cutoff: Delivery-Ops confirms harvest/collection quantity
        │
   ┌────┴─────┐
   ▼          ▼
Supply OK    Shortfall Detected → Substitution suggested → Applied, customer notified
   │
   ▼
Delivery-Ops Packs & Dispatches Order
   │
   ├── Failed Delivery → Customer notified, reattempt/refund flagged
   │
   └── Delivered (by 7 AM) → Quality confirmed
                          │
                          ▼
                 (If issue reported) → Delivery-Ops resolves → Wallet Credit/Refund/Replace
```

---

## 9. Phase-Wise Development Plan

> Each phase is designed to be independently demoable/testable. Estimated durations assume a small team (2–4 developers); adjust to your actual team size.

### **Phase 0 — Discovery, Planning & Design (1–2 weeks)**
**Goal:** Finalize scope, tech stack, and design before writing code.
- Finalize tech stack (frontend, backend, DB, hosting)
- Define detailed data model / entity diagram
- Define API contract (REST endpoints or GraphQL schema) for all 3 dashboards
- UI/UX wireframes for Customer, Delivery-Ops, Admin dashboards
- Define catalog/substitution rules per product category
- Define zone-assignment logic (pincode/region mapping rules) and cutoff/dispatch-deadline policy
- Set up project management board (tasks per phase)

**Deliverables:** Wireframes, entity diagram, API contract doc, finalized tech stack.

---

### **Phase 1 — Project Setup & Core Infrastructure (1 week)**
**Goal:** Set up the skeleton so all future phases can build on it.
- Initialize frontend repo (React) with routing scaffold for 3 dashboards
- Initialize backend repo with folder structure (controllers/routes/models/middleware)
- Set up database schema (based on Phase 0 entity diagram) + collections
- Set up cloud file storage bucket for quality-issue photos and proof-of-delivery images
- Set up environment configs (dev/staging/prod)
- Set up CI/CD pipeline basics (build + lint on push)
- Set up base UI component library / design system (buttons, forms, tables, modals)

**Deliverables:** Running skeleton app (empty dashboards reachable by role), connected DB.

---

### **Phase 2 — Authentication, Authorization & Role Management (1–1.5 weeks)**
**Goal:** Secure, role-based access for Customers, Delivery-Ops, and Admins.
- Customer registration (email/phone + OTP verification)
- Login/logout for all 3 roles
- Forgot password / reset password flow
- JWT-based session handling
- Role-Based Access Control (RBAC) middleware — restrict routes/APIs by role
- Admin-created accounts for Delivery-Ops staff (delivery-ops likely shouldn't self-register)
- Basic profile management (edit personal details, delivery address)

**Deliverables:** Fully working auth system; each role lands on their correct dashboard after login.

---

### **Phase 3 — Admin: Delivery Zone & Delivery-Ops Management (1 week)**
**Goal:** Give admin control over the delivery network before orders can be routed.
- Admin UI: Create/Edit/Deactivate delivery zones (name, city/region, pincode range, cutoff time, dispatch deadline)
- Admin UI: Create/Edit/Deactivate delivery-ops accounts + assign to a zone
- Zone listing with search/filter
- Pincode-to-zone mapping logic (used later for auto-routing) + "check my pincode" lookup

**Deliverables:** Admin can fully set up the delivery network and onboard delivery-ops staff.

---

### **Phase 4 — Admin: Product Catalog Management (0.5–1 week)**
**Goal:** Define what products are available on the platform.
- Admin UI: Create/edit/deactivate products (fruits, vegetables, milk, dairy, etc.)
- Configure price, unit of measure, daily stock ceiling per product
- Configure substitution mapping (which item stands in if another runs short)
- Daily "Today's Harvest" availability toggle

**Deliverables:** A realistic starter catalog (a dozen or so SKUs) live on the platform.

---

### **Phase 5 — Customer Dashboard: Ordering & Subscription Flow (1.5–2 weeks)**
**Goal:** Core value proposition for the customer.
- Browse catalog with details and today's availability
- One-time order flow (cart → address/slot confirm → cutoff-aware checkout)
- Subscription plan builder (frequency, items, delivery days) with auto-applied discount tier
- Pause/skip/swap on an existing subscription; one-time add-ons layered on top
- Auto-assignment of order to nearest/correct delivery zone (using pincode mapping from Phase 3)
- Order submitted confirmation + status visible on dashboard
- "My Orders" and "My Subscriptions" lists with status stepper UI

**Deliverables:** A customer can fully place an order or subscribe end-to-end and see it land in the correct zone's queue.

---

### **Phase 6 — Delivery-Ops Dashboard: Fulfillment, Dispatch & Delivery (1.5–2 weeks)**
**Goal:** Enable delivery-ops staff to process orders routed to them.
- Queue of orders assigned to their zone for tonight (filter/sort by status, date, category)
- Order detail view with customer profile + item list
- Item-level fulfillment actions (Harvested / Packed / Substituted / Out of Stock) with remarks
- Dispatch action: Out for Delivery / Delivered / Failed, with remarks and delivery timestamp checked against the 7 AM window
- Auto-notify customer on every status change
- Proof-of-delivery capture (optional photo)

**Deliverables:** Delivery-ops can fully process an order from "Placed" to "Delivered/Failed."

---

### **Phase 7 — Notifications & Status Tracking (0.5–1 week)**
**Goal:** Keep all 3 roles informed in real time.
- Email/SMS/WhatsApp notifications: order placed, cutoff reminder, harvested, packed, out for delivery, delivered, substitution applied, subscription renewal
- In-app notification center (bell icon) for all dashboards
- Status stepper/timeline UI refinement on Customer dashboard

**Deliverables:** Automated notifications working across the full order lifecycle.

---

### **Phase 8 — Quality Guarantee & Billing/Wallet Tracking (1–1.5 weeks)**
**Goal:** Post-delivery lifecycle management and subscription billing.
- Customer reports a quality issue with photo evidence
- Delivery-ops/Admin resolves (Replace / Refund / Wallet Credit / Reject claim) with remarks
- Wallet model: credits usable against future orders/subscriptions
- Subscription billing cycle tracking (Paid / Pending / Failed) against the mock payment API
- Customer dashboard: view wallet balance, billing history
- Delivery-ops/Admin: view open quality-issue report

**Deliverables:** Full order lifecycle from placement to quality resolution and billing tracking.

---

### **Phase 9 — Admin Analytics, Reports & Audit Logs (1 week)**
**Goal:** Give admin full oversight of platform health.
- Dashboard widgets: total customers, total orders, subscription retention rate, total revenue
- Zone-wise performance report (orders received/delivered/failed, avg on-time-by-7AM rate)
- Audit log viewer (who did what, when — reassignments, resolutions, edits)
- Exportable reports (CSV/PDF)

**Deliverables:** Admin has a data-driven view of the entire platform.

---

### **Phase 10 — Security Hardening, Testing & QA (1–1.5 weeks)**
**Goal:** Make the platform production-ready and safe for customer/payment data.
- Input validation & sanitization across all forms
- File upload security (type/size restrictions, malware scan if possible)
- Rate limiting & brute-force protection on auth endpoints
- Data encryption at rest for sensitive fields (address, payment tokens)
- Role-permission penetration testing (ensure no cross-role data leakage)
- Unit tests + integration tests for core flows
- UAT (User Acceptance Testing) with sample real-world scenarios

**Deliverables:** Security checklist signed off; test coverage report.

---

### **Phase 11 — Deployment & Launch (0.5–1 week)**
**Goal:** Ship to production.
- Production environment setup
- Domain, SSL, hosting finalization
- Data backup & disaster recovery plan
- Monitoring/alerting setup (uptime, error tracking)
- Soft launch with a limited delivery radius/set of customers
- Full launch

**Deliverables:** FarmFresh Direct live in production.

---

### **Phase 12 — Post-Launch Enhancements (Ongoing / Future Roadmap)**
Optional/future scope, not required for v1 launch:
- AI-driven route optimization / logistics engine
- Payment gateway integration for subscription auto-billing
- Real cold-chain IoT/logistics-partner integration for dispatch
- Mobile apps (iOS/Android)
- Chat-based support between customer and delivery-ops
- Multi-farm marketplace (onboarding partner farmers under the FarmFresh brand)
- Referral program with automated credit issuance
- Bulk/B2B ordering (restaurants, cafes, hotels)
- AI-based produce-quality photo verification for issue claims

---

## 10. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | Role-based access control, encrypted storage of address/payment data, HTTPS everywhere |
| **Performance** | Dashboard pages load under 2s; photo uploads support files up to configurable size limit |
| **Scalability** | Should support multiple delivery zones and concurrent orders without degradation |
| **Auditability** | Every reassignment/resolution/edit action must be logged with actor, timestamp, and reason |
| **Availability** | Target 99.5% uptime post-launch |
| **Freshness/Compliance** | Follow applicable food-safety and cold-chain handling norms for perishable goods and dairy transport |

---

## 11. Success Metrics (KPIs)

- On-time-by-7AM delivery rate
- Subscription retention / churn rate
- Average order-to-delivery turnaround time
- Quality-issue rate (indicates freshness/handling quality)
- Customer drop-off rate during checkout/subscription setup (funnel analysis)
- Number of active delivery zones & delivery-ops staff onboarded
- Platform uptime & error rate post-launch

---

## 12. Assumptions & Open Questions

Since this PRD is being generated for planning purposes, please validate/clarify the following before development starts:

1. Is zone assignment purely pincode/region-based, or should customers be able to manually select a preferred delivery slot/zone too?
2. Should customers be able to hold multiple active subscriptions simultaneously (e.g., separate produce and dairy plans)?
3. Is subscription billing handled fully manually in v1, or is there a target payment-gateway integration?
4. What product categories should launch first (fruits/vegetables only, or fruits+vegetables+dairy together)?
5. Any regulatory/compliance body this platform must adhere to (FSSAI food-safety norms, dairy handling regulations, etc.)?
6. Preferred tech stack — confirm or override the assumptions in Section 5.
7. Team size and expected timeline, to calibrate phase durations realistically.

---

*End of Document*
