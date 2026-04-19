# Business Plan Summary for StakIt Hire

This document provides a comprehensive summary of the business logic, services, pricing, and operational plan as implemented in the StakIt Hire application.

---

## 1. Executive Summary & Mission

### 1.1. Business Concept

StakIt Hire is a modern equipment rental service designed to revolutionize the moving process. The service provides eco-friendly, durable, and stackable moving crates and a full range of moving essentials delivered directly to the customer's door. The core value proposition is to replace the traditional chaos and waste of cardboard boxes with a smarter, greener, and simpler system.

### 1.2. Mission Statement

To make the moving process simpler, smarter, and more sustainable for our community by providing a hassle-free rental service for high-quality moving equipment. We are committed to reducing waste and providing exceptional customer service.

### 1.3. Vision

To become the go-to alternative to cardboard boxes, setting a new standard for how people pack, move, and organise—with cleaner, smarter, and more sustainable solutions.

---

## 2. Complete Services & Pricing Structure

The pricing model is designed to be transparent, flexible, and profitable, encouraging higher average order values through bundling and clear add-on options.

### 2.1. Standard Fees

| Fee Name | Price | Description |
| :--- | :--- | :--- |
| **Delivery & Collection Fee** | $30.00 | A single flat fee for all orders within the Greater Penrith service area. |
| **Box Protection Plan** | $20.00 | Optional add-on covering damage for up to three moving boxes. |

---

### 2.2. Curated Moving Kits (Bundles)

| Bundle Name | Price (First Week) | Price (Per Extra Week) | Contents |
| :--- | :--- | :--- | :--- |
| **The Studio Starter Kit** | $115.00 | $65.00 | 25 Box Stak, 1x Bubble Wrap Roll, 1x Queen Mattress Protector (Hire) |
| **The Essentials Kit** | $160.00 | $90.00 | 35 Box Stak, 1x Bubble Wrap Roll, 1x Queen Mattress Protector (Hire), 1x Moving Sticker Pack |
| **The Family Move Kit** | $235.00 | $120.00 | 50 Box Stak, 2x Bubble Wrap Rolls, 1x Queen Mattress Protector (Hire), 1x Single Mattress Protector (Hire), 1x Moving Sticker Pack |
| **The Ultimate Home Kit** | $310.00 | $160.00 | 70 Box Stak, 2x Bubble Wrap Rolls, 1x Packing Paper, 1x King Mattress Protector (Hire), 1x Moving Sticker Pack |

---

### 2.3. Box Hire (À La Carte)

| Package Name | First Week Rate | Each Additional Week |
| :--- | :--- | :--- |
| **70 Box Stak** | $260.00 | $160.00 |
| **50 Box Stak** | $195.00 | $120.00 |
| **35 Box Stak** | $135.00 | $90.00 |
| **25 Box Stak** | $105.00 | $65.00 |
| **Single Box Hire** | $4.00 | $2.50 |

---

### 2.4. Optional Add-Ons (Flat Hire Fee)

These items are hired for a single flat fee that covers the entire rental period.

| Item | Hire Price |
| :--- | :--- |
| **Moving Blanket** (1.8m x 2m) | $6.00 |
| **Moving Blanket** (1.8m x 3.2m) | $10.00 |
| **Insulated Cold Boxes 39L**| $8.00 |
| **Hand Trolley** (300kg capacity) | $30.00 |
| **Stair Climber Trolley** (180kg Capacity) | $35.00 |

---

### 2.5. Protection Add-Ons (Hire or Purchase)

| Item | Hire Price | Purchase Price |
| :--- | :--- | :--- |
| **Single Mattress Protector** | $5.00 | $8.00 |
| **Double/Queen Protector** | $6.00 | $9.00 |
| **King Mattress Protector**| $7.00 | $10.00 |
| **Reusable Mattress Protector (All Sizes)**| $15.00 | $40.00 |
| **TV Protector (22-48 inches)**| $20.00 | $40.00 |
| **TV Protector (50-70 inches)**| $28.00 | $60.00 |

---

### 2.6. Consumables (For Purchase)

| Item | Price |
| :--- | :--- |
| **Bubble Wrap Roll** | $15.00 |
| **Packing Paper** | $15.00 |
| **Tape Roll** | $4.00 |
| **Moving Sticker Pack** | $12.00 |

---

## 3. Target Market & Service Area

The primary target market consists of individuals and families moving homes within the **Greater Penrith Area**. The service caters to a range of move sizes, from studio apartments to large family houses. The business model explicitly states that the standard delivery zone covers this region, with a clear process for customers outside this area to request a custom quote.

---

## 4. Customer Workflow

The application provides a seamless, end-to-end digital experience for the customer.

1.  **Browse & Select:** The user explores the services on the Home and Pricing pages.
2.  **Request a Quote:** The user fills out the quote form, selecting their items, rental dates, and delivery addresses. The system provides a real-time estimate of the total cost.
3.  **Agree to Terms:** Before submission, the user must agree to the company's Terms and Conditions, ensuring they understand the rental policies.
4.  **Submit & Track:** Upon submission, a quote request is created with a 'Pending' status. The user is redirected to the "My Requests" page, where they can track the status of all their current and past quotes.
5.  **Admin Review:** The business admin reviews the request in the Admin Dashboard, checks inventory availability, and approves or rejects the quote.
6.  **Payment:** Once approved, the user can see the "Pay Now" button on the tracking page. They are directed to a secure Stripe checkout to complete the payment.
7.  **Confirmation:** After successful payment, the quote status updates to 'Paid', and the rental is officially booked for delivery.
8.  **Self-Service Extension:** During an active rental period, customers can visit their "My Requests" page and use the "Extend Rental" feature to select a new end date, view the additional cost, and pay for the extension securely online.

---

## 5. Operational Plan & Built-in Business Safeguards

The Admin Dashboard serves as the central command center for all business operations, with several key safeguards built in to protect the business and ensure smooth operations.

*   **Analytics Dashboard:** This new section provides at-a-glance metrics on profitability and asset management.
    *   **Safeguard:** By tracking KPIs like revenue, average order value, item popularity, and damage/loss rates, you can make data-driven decisions to optimize pricing, inventory, and operational workflows.

*   **Live Rentals View:** Shows a real-time list of customers with active rentals and a summary of all equipment currently on hire.
    *   **Safeguard:** This provides immediate visibility into where your assets are at any given moment, helping to prevent loss and manage logistics.

*   **Request Management:** Admins can view and manage all incoming quote requests.
    *   **Safeguard (Manual Approval Gate):** No customer can pay for an order until an admin has manually reviewed and **Approved** it. This is your primary control to prevent overbooking, accept orders outside your service area, or reject problematic requests.
    *   **Safeguard (Automated Inventory Check):** When viewing a quote, the system performs an automated stock check for the requested period, showing you if required items are available, low in stock, or out of stock. This prevents you from accidentally committing to an order you can't fulfill.
    *   **Safeguard (Quote Editing):** Admins have the ability to edit a customer's submitted quote (items, dates, addresses) before approval. The system automatically recalculates the total, ensuring pricing accuracy.

*   **Order Documentation & Evidence:** For each order, there is a dedicated section to upload and view evidence.
    *   **Safeguard (Immutability):** Records uploaded here (photos or documents) are permanent. Security rules prevent them from being edited or deleted via the app, creating a tamper-proof audit trail for every rental. This is critical for resolving damage disputes.
    *   **Safeguard (QR Code Delivery Confirmation):** The "digital handshake" feature allows you to get on-the-spot confirmation from the customer at delivery. They must explicitly acknowledge receipt and condition of the items.
    *   **Safeguard (Secure Timestamps):** All uploads and confirmations are timestamped using Firebase's secure server time, not the user's device time. This guarantees an accurate, unchangeable record of when an event occurred.

*   **Rental Schedule:** A two-month calendar visually displays all rental start and end dates for logistical planning.

*   **Inventory Management:** A dedicated tab allows the admin to set the total quantity of the crate pool and trackable items.
    *   **Safeguard (Loss Tracking):** The **"Retire Crates"** feature allows you to log crates that are being permanently removed from circulation. This data feeds into your analytics, providing clear insight into asset loss rates and long-term profitability.

*   **Message Center:** Admins can read and manage all incoming messages from the public contact form.

*   **Automated Data Retention:**
    *   **Safeguard (Privacy & Legal Compliance):** A scheduled function automatically runs every day to delete rental records (including customer details and evidence) that have been inactive for more than 12 months. This enforces your privacy policy, reduces data liability, and keeps your database clean.
