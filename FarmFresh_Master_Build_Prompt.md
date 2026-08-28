# Build FarmFresh Direct — Farm-to-Doorstep Delivery & Subscription Platform

You are the **lead product architect, senior full-stack engineer, AI engineer, and UI/UX designer** for the FarmFresh Direct project.

I have attached (or you already have, from earlier in this conversation) the **PRD.md** and **Phase-by-Phase Build Instructions** for FarmFresh Direct.

Treat those documents as the **primary source of truth for the project requirements and MVP scope**.

Do NOT blindly implement every possible feature. Follow the explicit MVP boundary below and prioritize a **working end-to-end prototype over feature quantity**.

---

## 1. Understand the product first

We are building a centralized **Farm-to-Doorstep Delivery & Subscription Platform** that digitizes and monitors the order lifecycle:

**Order/Subscription → Zone Assignment → Harvest & Packing → Dispatch → Delivery (by 7 AM) → Quality Resolution → Billing/Renewal**

The core product principle is:

> **One platform should connect customers, delivery zones, product catalog, subscriptions, fulfillment workflow, dispatch and billing — while AI helps ops staff catch demand/supply mismatches before the morning cutoff.**

This is an **operations and fulfillment monitoring platform**, NOT a generic e-commerce template and NOT a chatbot.

---

## 2. Primary users

Implement role-based access for these users:

### Customer
Needs:
- Browse today's/seasonal catalog
- Place a one-time order or create a subscription (weekly/monthly)
- Pause/skip/swap items on a subscription
- Upload/report a quality issue with photo
- Track order status (harvested → packed → out for delivery → delivered)
- View delivery history & subscription billing
- Notifications

### Delivery-Ops Staff
Needs:
- Queue of orders assigned to their zone/route for tonight
- Customer + order detail viewer
- Item-level fulfillment actions (Harvested / Packed / Substituted / Out of Stock)
- Order-level dispatch action (Out for Delivery / Delivered / Failed Delivery)
- Proof-of-delivery capture
- Zone performance view
- Cutoff/dispatch deadline alerts

### Admin (Super Admin)
Needs:
- Delivery zone & pincode-mapping management
- Product catalog & daily stock-ceiling management
- Platform-wide order oversight (with reassignment override)
- Platform-wide analytics dashboard
- Overdue/high-risk order & subscription monitoring
- Audit trail
- System configuration (cutoff times, discount tiers)

The architecture should allow additional roles later (e.g., Farm/Harvest Coordinator, Regional Ops Head, Support Staff).

---

## 3. Core MVP

The MVP MUST have these working end-to-end:

1. Role-based login (Customer / Delivery-Ops / Admin)
2. Delivery zone & pincode-mapping management (Admin)
3. Product catalog management with daily stock ceilings (Admin)
4. One-time order placement (Customer) with cutoff-time enforcement
5. Subscription creation (weekly/monthly) with auto-discount and auto order generation
6. Auto-assignment of each order to the correct delivery zone (pincode-based routing)
7. Delivery-Ops fulfillment queue
8. Item-level fulfillment tracking (harvested/packed/substituted/out-of-stock) with remarks
9. AI demand-vs-supply mismatch detection (before dispatch cutoff)
10. Dispatch workflow (out for delivery / delivered / failed) with remarks and audit trail
11. Quality-issue reporting & resolution (replace/refund/wallet credit)
12. Wallet & subscription billing tracking
13. Notifications (email/SMS/WhatsApp/in-app)
14. Admin dashboard with filters and drill-down
15. 7 AM delivery-window compliance alerts
16. Audit trail
17. Mock payment integration
18. One meaningful AI/risk feature (explainable delivery-risk flag)

Do NOT overbuild.

Do not spend time creating:
- Huge microservice architecture
- Generic AI chatbot as the core feature
- Blockchain
- Dozens of unfinished dashboards
- Fake live payment/logistics-partner integrations
- Complex ML models without useful data
- Nationwide real-time cold-chain IoT integration

---

## 4. DELIVERY ZONE ROUTING MODULE — IMPORTANT

The zone-routing module is a core part of the product (this is FarmFresh's equivalent of a "location intelligence" layer).

Build:

- Pincode/region → delivery zone mapping (configured by Admin)
- Auto-assignment of each placed order (one-time or subscription-generated) to the correct zone
- Fallback logic if no exact zone match exists (waitlist / Admin manual assignment queue, or "not currently serviceable")
- Optional: a simple zone-locator map (zones plotted on a map, not mandatory for MVP)
- Delivery-Ops queue filtered strictly to their own zone's orders for that night
- Admin override to manually reassign an order to a different zone/route

Example order record after routing:

```text
Order ID: FF-2026-08231
Customer: Example Customer
Plan: Weekly Subscription
Items: 2kg Tomatoes, 1L Milk, 1kg Spinach
Zone Assigned: Lucknow - Gomti Nagar Route
Status: PACKED
```

The routing logic should not be decorative — it must actually determine which Delivery-Ops staff member's queue the order lands in.

---

## 5. AI FEATURE — DEMAND / SUPPLY MISMATCH DETECTION

This should be one of the strongest features in the prototype.

Example:

Total committed demand for tomorrow (from placed orders + active subscriptions):

```text
Item: Tomatoes
Committed Demand: 42 kg
```

Confirmed harvest/collection quantity (entered by Delivery-Ops/Farm Coordinator at cutoff):

```text
Item: Tomatoes
Confirmed Harvest: 30 kg
```

The system should:

1. Aggregate all confirmed orders (one-time + subscription-generated) per item, per zone, for the next delivery
2. Compare committed demand against confirmed harvest/collection quantity entered at cutoff
3. Detect shortfalls (demand exceeds supply) per item
4. Display the exact shortfall and affected orders
5. Explain why it was flagged
6. Suggest substitutions using the substitution mapping from the catalog
7. Create a fulfillment flag on the affected orders
8. Notify the assigned Delivery-Ops staff and the Admin
9. Record the action in the audit trail

Display:

```text
⚠ SUPPLY SHORTFALL

Item:              Tomatoes
Committed Demand:  42 kg
Confirmed Supply:  30 kg
Shortfall:         12 kg (-29%)

Reason:
Confirmed harvest quantity is lower than the
total quantity committed across tonight's orders.

Affected Orders: 6 (in Gomti Nagar, Alambagh zones)

Action:
[Apply Suggested Substitution] [Notify Affected Customers] [Manual Review]
```

IMPORTANT:

AI must NOT declare:

- Which specific customers get the item and who is substituted (a human decides prioritization if it matters, e.g. subscription tenure)
- Final refund/credit decisions
- Food-safety/quality verdicts

AI is **decision support only**.

It should surface mismatches and risk signals for authorized human (Delivery-Ops/Admin) review.

---

## 6. WORKFLOW ENGINE

The system must always know where an order currently stands.

Example:

```text
Order ID: FF-2026-08231

Current Stage:
PACKED

Assigned To:
Delivery-Ops - Gomti Nagar Route

Dispatch Deadline:
29-Aug-2026, 04:30 AM

Status:
ON TRACK
```

Actions:

- Move to next stage (Harvested → Packed → Out for Delivery → Delivered)
- Send back (mark item unavailable, trigger substitution)
- Mark failed delivery (with reason)
- Complete (delivered/closed)

The workflow should support:

- Required fields per stage
- Assignment
- Dispatch deadlines (tied to the 7 AM delivery promise)
- Status
- Remarks
- Escalation (if a zone is at risk of missing the 7 AM window)
- Audit history

The system must answer:

> Who is responsible for this order right now?
> What is the next action?
> When must it be dispatched/delivered by?
> Why is it at risk of being late?

---

## 7. DASHBOARD

Create a professional, trustworthy operations dashboard (Admin-facing).

It should show KPIs such as:

- Total Orders (one-time + subscription-generated)
- Total Customers / Active Subscriptions
- Subscription Retention / Churn Rate
- Total Revenue
- Total Delivered vs Failed Deliveries
- On-Time-by-7AM Percentage
- Pending/In-Progress Orders
- Overdue/At-Risk Dispatches
- Open Quality Issues & Refund/Credit Totals
- High-Risk Zones (recurring shortfall or late-delivery patterns)

Important drill-down:

**Platform → Zone → Order → Item/Event**

Every major dashboard number should lead to useful detail, not be a dead-end statistic.

---

## 8. CATALOG & QUALITY-EVIDENCE MANAGEMENT

Products and issue evidence should not simply be uploaded and forgotten.

Support (products):

- Category (fruit/vegetable/dairy)
- Unit of measure & price
- Daily availability toggle ("Today's Harvest")
- Daily stock ceiling
- Substitution mapping
- Version history (price/availability changes tracked, not silently overwritten)

Support (quality-issue evidence):

- Photo upload
- Issue type (spoiled/missing/wrong item)
- Order/item association
- Reporting customer
- Timestamp
- Access permissions (role-restricted viewing)
- Audit history
- Search/filter within a zone's open issues

---

## 9. ORDER VALUE & FULFILLMENT TRACKING

Keep these separate:

```text
Ordered Quantity
Fulfilled Quantity (after substitution/shortfall)
Delivered Quantity
```

Do not use a single boolean like:

```text
orderFulfilled = true
```

because the platform needs to represent partial fulfillment, item-level substitutions, and multi-item orders where some items succeed and others don't.

---

## 10. DISPATCH & DELIVERY

Track:

- Not Dispatched
- Out for Delivery
- Delivered
- Failed Delivery
- Delivery timestamp (for 7 AM compliance check)
- Delivery-Ops staff / route reference
- Proof of delivery (photo/signature, optional)

An order can be:

**Packed = Yes**

while:

**Delivered = Pending**

Do not incorrectly combine these states.

---

## 11. SUBSCRIPTION & BILLING MODULE

Track billing separately from the fulfillment lifecycle.

For each active subscription:

- Billing cycle (weekly/monthly)
- Next billing date
- Amount
- Status (Paid / Pending / Failed)
- Payment date (once paid)
- Responsible zone (for delivery follow-up)

Dashboard should show:

```text
Active Subscriptions: 214
Renewals Due This Week: 38
Failed Renewals: 5
Outstanding Amount: ₹12,400
```

---

## 12. ALERTS

Build useful alerts.

Examples:

### Cutoff approaching
Countdown reminder to the customer before order-lock time.

### Dispatch deadline approaching
Reminder to Delivery-Ops for orders not yet packed.

### Dispatch deadline missed
Mark order as at-risk of missing the 7 AM window.

### Repeated delay
Escalate zone to Admin.

### Supply shortfall
Create a fulfillment flag on affected orders (see Section 5).

### Quality issue reported
Notify assigned Delivery-Ops/Admin.

### Subscription renewal failed
Notify customer and flag on Admin dashboard.

### High-risk zone
Show on the risk dashboard.

---

## 13. AI / RISK ANALYTICS

If implementing a second AI feature, prioritize a transparent, explainable delivery-risk score — not a black box.

Possible factors:

- Zone order volume vs available Delivery-Ops capacity for the night
- Number of supply shortfalls found for that night's orders
- Existing late-delivery pattern at the assigned zone (if relevant)
- Distance/route density for the zone
- Weather-related collection delay (if available)

Show WHY a zone/order is high risk.

Example:

```text
HIGH RISK OF MISSED 7AM WINDOW — 71%

Factors:
• Zone order volume 40% above average staffing capacity
• 2 unresolved supply shortfalls affecting this route
• Route has missed the 7AM window 3 times in the last 2 weeks
• Heavy rain forecast overnight
```

Do not create an unexplained black-box score.

---

## 14. DATA MODEL

Use a relational architecture.

Important entities:

```text
User (Customer)
DeliveryZone
DeliveryOpsStaff
Admin
Product
Order
Subscription
OrderItem
FulfillmentEvent
Dispatch
QualityIssue
Wallet
Notification
RiskScore
AuditLog
```

An order should connect:

```text
User
   ↓
Order / Subscription-generated Order
   ↓
Delivery Zone (auto-assigned)
   ↓
Order Items
   ↓
Fulfillment Events (harvest/pack/substitute)
   ↓
Dispatch
   ↓
Delivery Outcome
   ↓
Quality Issue (if any) → Wallet Credit/Refund
```

---

## 15. TECHNOLOGY

Use a practical, production-reasonable stack. (Confirm against whatever you used in your earlier build before locking this in.)

### Frontend
React / Next.js
TypeScript
Tailwind CSS

### Backend
Node.js + Express or NestJS

### Database
PostgreSQL (relational — well suited to structured order/subscription/fulfillment data)

### AI
Python + FastAPI (demand-aggregation + supply-comparison + substitution-suggestion microservice, called from the main backend)

### Storage
S3-compatible object storage (for quality-issue photos, proof-of-delivery images)

### Authentication
JWT-based authentication + RBAC

### API
REST + OpenAPI/Swagger

### Deployment
Docker

For the prototype, a **modular monolith is preferred over unnecessary microservices** — the AI demand/supply piece is the one component that reasonably deserves to be a separate service.

---

## 16. UI/UX DIRECTION

Design it as a fresh, trustworthy, operationally-serious platform.

Do NOT make it look like:
- A generic admin template
- A social media app
- A flashy startup landing page
- A chatbot application

Use:

- Clean typography
- Warm, farm-fresh but professional aesthetic (greens/earth tones, not garish)
- Strong information hierarchy
- Responsive layout
- Accessible contrast
- Clear status indicators (color-coded order/subscription/dispatch states)
- Tables + charts + status cards
- Minimal unnecessary decoration

The Admin dashboard should feel like a **decision-support / operations-control system**.

The Delivery-Ops fulfillment screen should feel like a fast, checklist-driven field workspace, not a generic form.

---

## 17. DEMO STORY

The final prototype should support this coherent demo:

### 0:00
Login as Customer.

### 0:20
Browse today's catalog, select items, start a Weekly Subscription.

### 0:40
Confirm delivery address, pincode auto-validates zone serviceability, confirm plan and discount.

### 1:00
Place a one-time add-on order for tonight — show cutoff countdown, then submit and show auto-assignment to the correct zone.

### 1:10
Login as Delivery-Ops staff for that zone.

### 1:20
Open tonight's queue — show all assigned orders + items.

### 1:40
AI compares committed demand vs confirmed harvest:

```text
Committed Demand: 42kg Tomatoes
Confirmed Supply:  30kg Tomatoes
```

### 2:00
System flags the shortfall with an explanation and suggested substitution.

### 2:10
Delivery-Ops applies the substitution and notifies affected customers.

### 2:20
Show:
- Assigned zone/staff
- Dispatch deadline
- Workflow status
- Audit event

### 2:30
Mark items packed → dispatch → mark delivered, timestamp checked against the 7 AM window.

### 2:45
Customer reports a minor quality issue on a different order → Delivery-Ops resolves with a wallet credit.

### 3:00
Login as Admin — open dashboard.

Show:
- Total orders / subscription retention
- Revenue and outstanding renewals
- On-time-by-7AM percentage
- High-risk zones

### 3:20
Drill down from dashboard → zone → order → audit trail.

The demo should tell **one coherent story** instead of showing disconnected features.

---

## 18. DEVELOPMENT APPROACH

Before writing large amounts of code:

### Phase 1 — Architecture
Define:
- Pages
- Components
- Database schema
- API structure
- Roles
- Workflow states
- Zone-routing data model

### Phase 2 — Core application
Implement:
- Authentication
- Dashboard shell
- Zones & product catalog
- Orders
- Database

### Phase 3 — Workflow
Implement:
- Order/subscription creation
- Zone assignment
- Status transitions
- Dispatch deadlines
- Audit events

### Phase 4 — Fulfillment + AI
Implement:
- Item-level fulfillment tracking
- Demand aggregation
- Supply comparison
- Shortfall/mismatch alert

### Phase 5 — Dispatch + Quality + Billing
Implement:
- Dispatch/delivery states
- Quality-issue resolution
- Subscription billing cycle
- Wallet credits

### Phase 6 — Dashboard + Alerts
Implement:
- KPIs
- Filters
- Drill-down
- Alerts
- Risk indicators

### Phase 7 — Polish
Improve:
- UI consistency
- Responsive behavior
- Loading/error states
- Empty states
- Accessibility
- Demo data
- Performance

*(This mirrors, at a summary level, the detailed 15-phase execution plan in the separate Build Instructions document — use that document for the actual step-by-step, stop-after-each-phase build process.)*

---

## 19. VERY IMPORTANT RULES

1. Do not invent requirements that contradict the PRD/build-instructions documents.
2. Do not claim access to real payment/logistics-partner/cold-chain-IoT APIs.
3. Clearly label integrations as MOCK when real access is unavailable.
4. Use synthetic/sample data for the prototype.
5. Do not make final refund/substitution-prioritization decisions using AI — it is decision support only.
6. Do not build a generic chatbot as the main AI feature.
7. Do not overengineer the architecture.
8. Every important alert should have explainable evidence.
9. Every workflow action should create an audit event.
10. Keep catalog, subscriptions, orders, and fulfillment data connected — no orphaned records.
11. Make the prototype actually runnable.
12. Prioritize a complete working flow over dozens of incomplete features.

---

## 20. What I want from you

First, **analyze the PRD and Build Instructions completely**.

Then produce:

### A. Product architecture
Explain the complete system architecture and module relationships.

### B. Database design
Provide the schema/entities, relationships and important fields.

### C. Application structure
Define the frontend pages/routes and reusable components per dashboard.

### D. Backend API design
Define the important REST endpoints.

### E. Zone routing implementation
Explain how pincode/region mapping, auto-assignment, and manual override will work.

### F. AI implementation
Explain the demand-aggregation + supply-comparison + mismatch/substitution pipeline.

### G. Workflow implementation
Define stages, transitions, assignments, deadlines and audit events.

### H. MVP implementation plan
Break the project into concrete development tasks in priority order.

### I. Then BUILD
After the architecture is clear, start implementing the actual application — following the phase-by-phase Build Instructions document strictly (one phase at a time, STOP after each).

Do not stop at wireframes or pseudo-code once building begins.

The final result should be a **working prototype**, not merely a design document.

If a requirement is ambiguous, choose the simplest implementation that preserves the intent of the PRD and clearly state the assumption.

Most importantly:

> **Build one complete, convincing order-to-doorstep-delivery workflow rather than ten disconnected features.**
