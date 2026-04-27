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

## 2. Services & Detailed Pricing Structure

The pricing model is designed to be transparent, flexible, and profitable, encouraging higher average order values through bundling and clear add-on options.

### 2.1. Standard Fees

*   **Delivery & Collection Fee:** A single, flat fee of **$30.00** applies to all orders within the service area. This is a one-time charge covering both drop-off and pick-up.

### 2.2. Curated Moving Kits (Bundles)

To simplify customer choice and increase value, four pre-packaged bundles are offered at a discounted rate compared to individual item prices.

| Bundle Name | Contents | Price |
| :--- | :--- | :--- |
| **The Studio Starter Kit** | 25 Box Stak, 1x Bubble Wrap Roll, 1x Queen Mattress Protector (Hire) | **$115.00** |
| **The Essentials Kit** | 35 Box Stak, 1x Bubble Wrap Roll, 1x Queen Mattress Protector (Hire), 1x Moving Sticker Pack | **$160.00** |
| **The Family Move Kit** | 50 Box Stak, 2x Bubble Wrap Rolls, 1x Queen Mattress Protector (Hire), 1x Single Mattress Protector (Hire), 1x Moving Sticker Pack | **$235.00** |
| **The Ultimate Home Kit** | 70 Box Stak, 2x Bubble Wrap Rolls, 1x Packing Paper, 1x King Mattress Protector (Hire), 1x Moving Sticker Pack | **$310.00** |

### 2.3. Box Hire Pricing (À La Carte)

The core rental service uses a "First Week & Follow-On" pricing model to encourage longer hires while protecting profit margins.

| Package Name | First Week Rate | Each Additional Week |
| :--- | :--- | :--- |
| **70 Box Stak** | $260.00 | **$160.00** |
| **50 Box Stak** | $195.00 | **$120.00** |
| **35 Box Stak** | $135.00 | **$90.00** |
| **25 Box Stak** | $105.00 | **$65.00** |
| **Single Box Hire** | $4.00 | **$2.50** |

### 2.4. Optional Add-Ons (Flat Hire Fee)

These items are hired for a single flat fee that covers the entire rental period, regardless of duration.

| Item | Description | Hire Price |
| :--- | :--- | :--- |
| **Moving Blanket** | 1.8m x 2m | $6.00 |
| **Moving Blanket** | 1.8m x 3.2m | $10.00 |
| **Insulated Cold Boxes 39L**| | $8.00 |
| **Hand Trolley** | 300kg capacity | $30.00 |
| **Stair Climber Trolley** | 180kg Capacity | $35.00 |

### 2.5. Protection Add-Ons (Hire or Purchase)

Customers have the flexibility to either hire or purchase protection items.

| Item | Hire Price | Purchase Price |
| :--- | :--- | :--- |
| **Single Mattress Protector** | $5.00 | $8.00 |
| **Double/Queen Protector** | $6.00 | $9.00 |
| **King Mattress Protector**| $7.00 | $10.00 |
| **Reusable Mattress Protector (All Sizes)**| $15.00 | $40.00 |
| **TV Protector (22-48 inches)**| $20.00 | $40.00 |
| **TV Protector (50-70 inches)**| $28.00 | $60.00 |

### 2.6. Consumables (For Purchase)

These items are sold to the customer and not returned.

| Item | Description | Price |
| :--- | :--- | :--- |
| **Bubble Wrap Roll** | 500mm x 10m | $15.00 |
| **Packing Paper** | 125 sheets | $15.00 |
| **Tape Roll** | | $4.00 |
| **Moving Sticker Pack** | | $12.00 |

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

## 5. Operational Plan (Admin Features)

The Admin Dashboard serves as the central command center for all business operations.

*   **Analytics Overview:** Provides at-a-glance metrics, including Total Requests, Approved Quotes, Pending Actions, and a chart visualizing the status of all quotes.
*   **Live Rentals View:** Shows a real-time list of customers with active rentals and a summary of all equipment currently on hire.
*   **Request Management:** Admins can view all incoming quote requests. They can expand each request to see an itemized breakdown and customer details. From here, admins can:
    *   **Approve or Reject:** Change the status of any quote.
    *   **Edit Quotes:** Modify a customer's submitted quote by changing items, quantities, dates, and addresses. The system automatically recalculates the total price, ensuring accuracy before re-approval.
    *   **Check Inventory:** An automated stock check confirms if items are available for the requested dates.
*   **Rental Schedule:** A two-month calendar visually displays all rental start and end dates, allowing for easy logistical planning.
*   **Inventory Management:** A dedicated tab allows the admin to set and update the total quantity of the central crate pool and all other trackable rental items.
*   **Message Center:** Admins can read and manage all incoming messages from the public contact form.
