# FarmFresh Direct — Phase-by-Phase Build Instructions

# CRITICAL: BUILD PHASE BY PHASE

Do NOT attempt to build the entire application in one operation.

You must develop the project **strictly phase by phase**.

For every phase:

1. First inspect the existing codebase.
2. Identify what is already implemented.
3. Plan only the current phase.
4. Implement only the current phase.
5. Run/build/test the application.
6. Fix errors introduced by the current phase.
7. Verify that previously working functionality still works.
8. Summarize exactly what was implemented.
9. STOP and wait for my instruction before starting the next phase.

**Never automatically continue to the next phase.**

Do not make large unrelated changes to future modules.

---

## PHASE 0 — PROJECT ANALYSIS & ARCHITECTURE

Do NOT write application code yet.

Analyze the platform requirements and define:

* Product architecture
* User roles
* Frontend routes/pages (per dashboard)
* Backend modules
* Database entities and relationships
* Delivery-zone / pincode routing data model
* Order & subscription lifecycle workflow states
* Order-cutoff and next-morning dispatch scheduling model
* API structure
* Catalog & inventory architecture (produce, dairy, batch/harvest tracking)
* Notification architecture
* Dashboard structure (Customer / Delivery-Ops / Admin)
* MVP boundaries
* Development dependencies

Also inspect the existing repository before making architectural decisions (if a previous build exists, identify what's reusable vs. what needs rebuilding).

At the end, provide:

* Proposed folder structure
* Database schema
* API structure
* Development roadmap
* Important assumptions

Then STOP.

---

## PHASE 1 — FOUNDATION

Implement ONLY the project foundation.

Build:

* Frontend setup
* Backend setup
* Database connection
* Environment configuration
* Base application layout (shared shell for 3 dashboards)
* Design system/components
* Basic routing (role-aware but not yet permission-enforced)
* Error handling
* Basic API structure

Do NOT implement catalog, subscriptions, order routing, or notifications yet.

Run the application and verify it works.

Then STOP.

---

## PHASE 2 — AUTHENTICATION & RBAC

Implement ONLY:

* Login
* Logout
* User model
* Roles
* Role-based permissions
* Protected routes
* Basic user profile (with delivery address + pincode)

Roles:

* Customer
* Delivery-Ops Staff (packing/dispatch/route staff)
* Admin (Super Admin)

Rules:

* Customers self-register.
* Delivery-Ops accounts are created only by Admin (no self-registration).
* Admin account(s) seeded/created separately.

Test each role — confirm each lands on its correct dashboard and cannot access another role's routes.

Do NOT build the other modules yet.

Then STOP.

---

## PHASE 3 — DELIVERY ZONE & PINCODE MANAGEMENT (Admin)

Implement:

* DeliveryZone model (name, covered pincodes, cutoff time, max daily capacity)
* Zone CRUD (Create/Edit/Deactivate)
* Pincode-to-zone mapping (used later for order auto-routing/serviceability check)
* Zone listing with search/filter
* "Check if we deliver to your pincode" lookup (used on the public site before signup)

Use realistic synthetic data (a handful of zones around the farm's delivery radius).

Test create → view → update → deactivate, and test the pincode-serviceability lookup.

Then STOP.

---

## PHASE 4 — PRODUCT CATALOG MANAGEMENT (Admin)

Implement:

* Product model (fruits, vegetables, milk, dairy — with category, unit of measure, price, image)
* Product CRUD
* Daily/seasonal availability toggle ("Today's Harvest" flag)
* Stock/quantity ceiling per day (so orders can't exceed what the farm can actually supply)
* Substitution mapping (e.g., "if tomatoes unavailable, suggest spinach") for later use in fulfillment

Create a small realistic dataset (a dozen or so SKUs across produce and dairy).

Do NOT implement cart/ordering yet.

Then STOP.

---

## PHASE 5 — ORDERING MODULE (Customer)

Implement:

* Cart model
* One-time order flow (browse catalog → add to cart → address/slot confirm → checkout)
* Order-cutoff enforcement (e.g., orders after 9:30–10 PM roll to the following delivery day, not the next morning)
* "My Orders" list with status field
* Order detail page

Create a small realistic dataset of sample orders.

Do NOT implement the subscription engine, dispatch routing, or fulfillment workflow yet — orders can sit in "Placed" status only.

Test create → view → cancel-before-cutoff → checkout.

Then STOP.

---

## PHASE 6 — SUBSCRIPTION ENGINE (Customer)

Now implement subscriptions on top of the ordering module.

Implement:

* Subscription model (frequency: weekly / monthly; item list; delivery days)
* Subscription plan CRUD for the customer (create, edit item list, cancel)
* Auto-discount application per plan tier (weekly vs monthly vs one-time)
* Pause/skip-a-day (vacation mode)
* Item swap for an upcoming delivery without cancelling the whole plan
* One-time add-on items layered on top of a subscription for a specific night
* Auto-renewal + reminder before next billing cycle
* Auto-generation of a daily "Order" record from each active subscription (feeds Phase 7)

Do NOT implement dispatch routing or fulfillment yet.

Test: Create weekly plan → confirm correct discount applied → skip a day → confirm no order generated for that day → resume → confirm order generation resumes.

Then STOP.

---

## PHASE 7 — DISPATCH ROUTING (Auto-Assignment)

Now implement the routing module.

Implement:

* Auto-assignment of each night's orders (one-time + subscription-generated) to a delivery zone/route, based on the customer's pincode and the mapping defined in Phase 3
* Fallback logic if no zone match exists (e.g., waitlist / admin manual assignment queue)
* Delivery-Ops staff queue (only shows orders assigned to their zone/route for that night)
* Admin override — ability to manually reassign an order to a different zone/route
* Filters: by zone, status, delivery date, product category

Do NOT implement harvest/pack/dispatch status updates yet — this phase is routing/visibility only.

Test:

Order Placed (before cutoff) → Correct Zone Auto-Assigned → Visible in that zone's Delivery-Ops queue only.

Then STOP.

---

## PHASE 8 — HARVEST, PACKING & FULFILLMENT WORKFLOW

Implement the workflow engine.

Stages:

PLACED
→ CUTOFF LOCKED
→ HARVEST/COLLECTION
→ PACKED
→ OUT FOR DELIVERY
→ DELIVERED / FAILED-DELIVERY
→ (loop) SUBSTITUTION APPLIED, if an item was unavailable

Implement:

* Item-level fulfillment actions (Mark Harvested / Packed / Substituted / Out of Stock) with remarks, performed by Delivery-Ops
* Order-level status progression, auto-derived from item-level actions
* Substitution application using the mapping from Phase 4, with customer notification
* Remarks/reason capture on every status change
* Status timeline visible on the Customer dashboard ("Harvested ✅ → Packed ✅ → Out for delivery 🚚")
* Audit events for every status change (who, what, when)
* 7 AM delivery-window compliance flag (on-time vs late) per order, for later reporting

Test one complete case end-to-end: Placed → Harvested → Packed → Delivered.
Test one substitution case and one failed-delivery case with reattempt/refund flag.

Then STOP.

---

## PHASE 9 — QUALITY GUARANTEE & REFUNDS

Implement:

* One-tap "Report an Issue" on any delivered order (spoiled, missing, wrong item)
* Issue model (type, description, optional photo, linked order/item)
* Delivery-Ops/Admin resolution workflow: Replace / Refund / Wallet Credit / Reject-claim, with remarks
* Wallet model (prepaid credits, refund credits) usable against future orders/subscriptions
* Issue status visible on Customer dashboard

Test: Delivered order → Report issue → Admin resolves with wallet credit → Credit reflected and usable at next checkout.

Then STOP.

---

## PHASE 10 — NOTIFICATIONS & ALERTS

Implement:

* Email/SMS/WhatsApp notifications: order placed, cutoff reminder, harvested, packed, out for delivery, delivered, substitution applied, subscription renewal reminder, payment due, issue resolved
* In-app notification center (bell icon) for all 3 dashboards
* Alert types: cutoff approaching (countdown), low-stock item affecting an upcoming subscription, missed 7 AM delivery-window, unresolved issue aging

Connect alerts to the workflow system built in Phase 8.

Then STOP.

---

## PHASE 11 — ADMIN DASHBOARD & ANALYTICS

Now build the decision-maker dashboard.

Include:

* Total customers, total orders, subscription-vs-one-time split, subscription retention/churn rate
* Total revenue, revenue by product category
* Zone-wise performance (orders received/delivered/failed, on-time-by-7AM percentage)
* Pending/overdue fulfillment cases
* Open quality-issue report and refund/credit totals

Implement drill-down:

PLATFORM
→ ZONE
→ ORDER
→ ITEM/EVENT

Dashboard numbers must come from actual order/subscription data.

Do NOT hard-code KPI numbers except for clearly marked demo/synthetic data.

Then STOP.

---

## PHASE 12 — AUDIT LOGS & SECURITY HARDENING

Implement:

* Full audit log viewer for Admin (who updated/refunded/edited what, and when)
* Input validation & sanitization across all forms
* File upload security (issue-report photos: type/size restrictions)
* Rate limiting & brute-force protection on auth endpoints
* Encryption at rest for sensitive fields (address, payment tokens)
* Role-permission testing — confirm no cross-role data leakage (a Customer cannot see another customer's orders; Delivery-Ops in one zone cannot see another zone's queue)

Then STOP.

---

## PHASE 13 — MOCK PAYMENT INTEGRATION

Implement a clearly labelled MOCK integration.

Demonstrate:

Checkout / Subscription Billing
→ Mock Payment Gateway API
→ Request
→ Response
→ Validation
→ Database synchronization (order/subscription payment status updated)
→ Sync log

Do NOT claim this is a live payment gateway integration.

Then STOP.

---

## PHASE 14 — DELIVERY-OPS MOBILE/FIELD EXPERIENCE (Optional)

If time permits, implement a responsive mobile-friendly interface for Delivery-Ops staff supporting:

* Assigned route/orders for the night, on the go
* Quick harvest/pack/dispatch checklist per order
* Mark delivered / failed-delivery with remarks
* Photo/evidence upload at doorstep (proof of delivery)

Do not let this phase delay the core web application.

Then STOP.

---

## PHASE 15 — FINAL INTEGRATION & DEMO

Only after all previous phases are individually working:

Test the complete end-to-end demo:

REGISTER/LOGIN
→ CHECK PINCODE SERVICEABILITY
→ SUBSCRIBE / PLACE ORDER (before cutoff)
→ AUTO-ROUTE TO DELIVERY ZONE
→ HARVEST → PACK → DISPATCH
→ DELIVERED BY 7 AM
→ QUALITY ISSUE (optional) → RESOLUTION
→ NOTIFICATIONS
→ ADMIN DASHBOARD
→ AUDIT TRAIL

Fix integration problems.

Do not add new major features during this phase.

Then STOP.

---

# STRICT AGENT BEHAVIOR

You are working with a human developer.

Therefore:

* Do not silently skip phases.
* Do not implement future phases early.
* Do not rewrite working modules unnecessarily.
* Do not replace the architecture without explaining why.
* Do not introduce new technologies without justification.
* Do not create placeholder features and claim they are complete.
* Do not generate fake live payment data.
* Do not create a generic chatbot unless explicitly requested.
* Do not over-engineer.

At the end of every phase, report:

### Completed

What was actually implemented.

### Files Changed

Which files were created/modified.

### Database Changes

Any schema/migration changes.

### APIs Added

Endpoints added or modified.

### Tests

What was tested.

### Known Issues

Anything remaining.

### Next Phase

State the next phase, but **DO NOT START IT**.

Then wait for my instruction.

**The highest priority is a stable, working end-to-end prototype — not maximum code generation.**
