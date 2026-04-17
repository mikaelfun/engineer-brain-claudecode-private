# EOP Case Triage Best Practices

> Source: OneNote - Case Triage meeting with MW SME | Quality: guide-draft | 21v: Yes

## Key Takeaways from SME Triage Sessions

### 1. FN/FP Identification
- Use **SPF result** as primary indicator to qualify FN (false negative) or FP (false positive)
- Check Authentication-Results and X-Forefront-Antispam-Report headers

### 2. Sample Collection
- Use **DTM workspace** to collect malware/phishing samples from customer
- Collect samples from **recent 3 days** (not 7 days) due to PG timezone differences
- Samples include: attachments, QR codes, URLs from phishing emails

### 3. Portal Issues Workaround
- Collect **Fiddler** or **HAR logs** for portal-related issues
- Quick workaround: Use **mail flow rules** to set SPF value to allow/block emails

### 4. Mail Flow Scope
- Mail flow scope is under **Microsoft Defender for O365 (MDO)**
- But closely related to Exchange Online - can request **EXO collaboration**

### 5. ICM Templates
Three ICM template types for EOP escalation:
1. **FN/FP issues** - Include NMIDs, sample details, SPF results
2. **EOP service issues** - For service-level problems
3. **Anti-spam analytics** - For detailed spam analysis requests

## Common Case Types (from triage)

| Case Pattern | Example |
|-------------|---------|
| Phishing not blocked (FN) | Image-based phishing, QR code phishing |
| Legitimate mail blocked (FP) | Auto-junk, quarantine false positive |
| Policy configuration | Cannot create anti-spam policy |
| Third-party integration | Third-party mail system in front of EOP |
| 21v feature gaps | User report not working, TABL PS gaps |
