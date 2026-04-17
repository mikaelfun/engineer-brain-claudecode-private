---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Bulk Confidence Level"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Troubleshooting%20Guides/Bulk%20Confidence%20Level"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Bulk Confidence Level (BCL) — Troubleshooting Guide

---

## What is BULK?

Bulk email is often one-time advertisements or marketing messages. Some users want bulk email (they signed up for it), while others consider it spam. For example, some users want advertising from Contoso Corporation or conference invitations, while others consider these spam.

---

## What is BCL?

**Bulk Confidence Level** identifies messages as bulk. A higher BCL indicates a bulk message is more likely to generate complaints (and is therefore more likely to be spam).

Bulk mailers vary in sending patterns, content creation, and list acquisition:

- **Good bulk mailers**: Send wanted messages with relevant content; generate few complaints.
- **Other bulk mailers**: Send unsolicited messages that closely resemble spam; generate many complaints.

Microsoft uses both internal and third-party lists to assign a Bulk Complaint Level (BCL) rating, exposed in the `X-Microsoft-Antispam` header.

---

## Navigation

**Microsoft 365 Defender portal:**
Admin Center → Security → Email & Collaboration → Policies and Rules → Threat Policies → Anti-spam → Anti-spam inbound policy (Default) → "Edit spam threshold and properties" → adjust the **Bulk email threshold** slider.

> ⚠️ A **higher** bulk email threshold means **more** bulk email will be delivered (less restrictive).

**Important:** With a recent change, the **RECOMMENDED** Bulk Threshold Level for the **STRICT** profile in Preset Security Policies has changed from **4** to **5**.

### MarkAsSpamBulkMail setting (PowerShell-only)

By default, `MarkAsSpamBulkMail` is **On** in anti-spam policies:

- **MarkAsSpamBulkMail = On**: A BCL ≥ threshold is converted to SCL 6 (Spam), and the Bulk filtering verdict action is applied.
- **MarkAsSpamBulkMail = Off**: Message is stamped with BCL but no action is taken. BCL threshold and Bulk filtering verdict action are irrelevant.

---

## BCL Rating Table

| BCL Value | Description |
|-----------|-------------|
| 0 | The message is NOT from a bulk sender |
| 1, 2, 3 | From a bulk sender that generates **few** complaints |
| 4, 5, 6, 7 | From a bulk sender that generates a **mixed** number of complaints |
| 8, 9 | From a bulk sender that generates a **high** number of complaints |

Default threshold: **7** (inclusive — BCL ≥ 7 triggers spam action).

---

## How to Tune Bulk Email

**MDO Plan 2 — Advanced Hunting Query (available since September 2022):**

```kusto
EmailEvents
| where BulkComplaintLevel >= 1 and Timestamp > datetime(2022-09-01T00:00:00Z)
| summarize count() by SenderMailFromAddress, BulkComplaintLevel
```

This query lets admins identify wanted and unwanted senders. If a bulk sender has a BCL that doesn't meet the bulk threshold, admins can submit the sender's messages to Microsoft for analysis — adds the sender as an allow entry to the Tenant Allow/Block List.

**EOP (without MDO Plan 2):** Use the Threat protection status report:
- View data by Email > Spam → filter for Bulk email
- `https://security.microsoft.com/reports/TPSAggregateReport` (EOP)
- `https://security.microsoft.com/reports/TPSAggregateReportATP` (MDO)

---

## Troubleshooting Scenarios

### 1. Messages being blocked that customer wants to receive

- **End-user safe sender** — [Create safe sender lists in Office 365](https://docs.microsoft.com/microsoft-365/security/office-365-security/create-safe-sender-lists-in-office-365)
- **Transport Rule (ETR)** to allow the messages
- **Adjust BCL threshold** — if BCL ≥ threshold, SCL is set to 9 and treated as high confidence spam. Raising the threshold allows more bulk mail through.

### 2. Messages received that customer wants blocked

- **End-user blocked sender** — [Create block sender lists in Office 365](https://docs.microsoft.com/microsoft-365/security/office-365-security/create-block-sender-lists-in-office-365)
- **Transport Rule (ETR)** to block the messages
- **Lower the BCL threshold** — reduces the BCL at which bulk is treated as spam

---

## More Information

- [Bulk complaint level (BCL) in EOP](https://learn.microsoft.com/microsoft-365/security/office-365-security/bulk-complaint-level-values)
- [What's the difference between junk email and bulk email?](https://learn.microsoft.com/microsoft-365/security/office-365-security/what-s-the-difference-between-junk-email-and-bulk-email)
- [EOP Anti Spam Policy Recommended Settings](https://learn.microsoft.com/microsoft-365/security/office-365-security/recommended-settings-for-eop-and-office365)
- [Email Protection Basics in Microsoft 365: Bulk Email](https://techcommunity.microsoft.com/t5/microsoft-defender-for-office/email-protection-basics-in-microsoft-365-bulk-email/ba-p/3445337)
