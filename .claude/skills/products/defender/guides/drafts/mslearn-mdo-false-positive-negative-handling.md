# MDO False Positive + False Negative Handling

> Sources:
> - https://learn.microsoft.com/defender-office-365/step-by-step-guides/how-to-handle-false-positives-in-microsoft-defender-for-office-365
> - https://learn.microsoft.com/defender-office-365/step-by-step-guides/how-to-handle-false-negatives-in-microsoft-defender-for-office-365

## Prerequisites

- Microsoft Defender for Office 365 Plan 1 or Plan 2 (M365 A5/E5/G5 includes Plan 2)
- Security Administrator role in Entra ID

---

## False Positives (Legitimate Email Blocked)

### Scenario 1: Email landed in Junk folder

1. End user: Report as **Not junk** via built-in Report button in Outlook
2. End user: Add sender to **Safe Sender List**
3. Admin: Triage from **User reported** tab on Submissions page
4. Admin: Submit to Microsoft for analysis to understand why blocked
5. Admin: Create **allow entry** for sender in Tenant Allow/Block List if needed
6. Admin: Read verdict to understand root cause and improve org config

### Scenario 2: Email in Quarantine (end user)

1. End user receives email digest about quarantined messages
2. End user can: preview, block sender, release, submit to Microsoft, request release from admin

### Scenario 3: Email in Quarantine (admin)

1. Admin: View quarantined emails from review page
2. Admin: Release message + submit to Microsoft for analysis
3. Admin: Create temporary allow entry in Tenant Allow/Block List
4. Read verdict:
   - If due to org config → correct the config
   - If due to other factors → Microsoft learns from submission automatically
5. **Note**: Similar quarantined messages must be manually released (not automatic)

---

## False Negatives (Malicious Email Delivered)

### Scenario 1: Malicious email in Inbox

1. End user: Report as **Phishing** or **Junk** via built-in Report button
2. End user: Add sender to **Blocked Senders List** in Outlook
3. Admin: Triage from User reported tab on Submissions page
4. Admin: Submit to Microsoft for analysis
5. Admin: Create **block entry** for sender in Tenant Allow/Block List
6. Read verdict to understand why allowed and improve config

### Scenario 2: Malicious email in Junk folder

1. End user: Report as **phishing** via Report button
2. Admin: Triage + submit to Microsoft for analysis
3. Admin: Create block entry if needed
4. Review verdict for org improvements

### Scenario 3: Malicious email in Quarantine

1. End user: Receives email digest, can preview and submit to Microsoft
2. Admin: View quarantined emails, submit malicious ones to Microsoft + create block
3. Review verdict for improvements

---

## Key Admin Actions Summary

| Action | False Positive | False Negative |
|---|---|---|
| User report | "Not junk" | "Phishing" / "Junk" |
| Admin submission | Submit for analysis | Submit for analysis |
| Tenant Allow/Block | Create **allow** entry | Create **block** entry |
| Post-verdict | Fix org config if applicable | Fix org config if applicable |
