---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Customer LockBox/Lockbox Workflow in Pictures"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FCustomer%20LockBox%2FLockbox%20Workflow%20in%20Pictures"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Customer Lockbox - Workflow and Permissions Guide

## Two Products Named "Customer Lockbox"

- **Customer Lockbox for Azure** (Azure Customer Lockbox)
- **Customer Lockbox for O365**

## Access Request Permissions and Expected Behavior

A Microsoft employee can request access on two different levels: to a **subscription** or to a **tenant**. Both requests are submitted through ASC.

### Tenant Request
- Users with **Global Admin role** receive notification email
- All users who receive the email can approve or reject

### Subscription Request
- Users with **Subscription Owner role**, **Global Admin role**, or **Azure Customer Lockbox Approver role** receive notification email
- Azure Customer Lockbox Approver is a role providing subscription-level lockbox approval with least privileged access

> **Important**: An _inherited_ owner role will NOT receive the email nor be able to approve/reject. They do not count as owners in regards to Lockbox.

## PIM (Privileged Identity Management) Interaction

### Key Rules
1. When PIM is enabled without active owner/GA rights assigned at the time of the MS engineer request, the request will NOT reach the customer
2. If customer grants rights via PIM AFTER the request was submitted, they still will NOT see the pending request or receive an email
3. If customer has rights when request is made but removes then re-adds them, they cannot see the request or approval history

### Correct Workflow with PIM
1. Give user GA (for tenant) or GA/Azure Customer Lockbox Approver (for subscription) via PIM
2. Notify the Microsoft engineer that they may request access
3. Microsoft engineer requests access
4. Temporary GA may approve via email or the Lockbox GUI pending tab

> **Warning**: If MS engineer requests access before PIM is enabled, the request will be stuck "pending" with no notification. The engineer cannot retry until the request times out in **four days**.

## Workflow Steps

### 1. ASC - Data Restricted
- Tenant Explorer shows: "The customer has opted-in to Customer Lockbox and Lockbox consent must be provided before accessing this data."
- Click "Request consent" button

### 2. Request Consent Dialog
- Confirms customer data is protected by Customer Lockbox
- Click "Submit Request" to generate Azure Portal request and automated email

### 3. Customer Email
- Lockbox owner and appropriate admins receive email notification

### 4. Azure Portal
- Customer Lockbox blade shows pending request
- Customer must provide justification and approve

### 5. Access Granted
- ASC access becomes available within ~5 minutes of approval
