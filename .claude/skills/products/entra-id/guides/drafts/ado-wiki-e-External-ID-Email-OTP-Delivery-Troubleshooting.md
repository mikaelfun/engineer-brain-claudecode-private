---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/Entra External ID Troubleshooting/External ID Email OTP Delivery Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20%28CIAM%29%2FEntra%20External%20ID%20Troubleshooting%2FExternal%20ID%20Email%20OTP%20Delivery%20Troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# External ID Email OTP Delivery Troubleshooting

Entra External ID uses eSTS for authentication and email OTP delivery. The following steps are the basic steps to troubleshoot email delivery for Email OTP.

## Steps

1. **Verify ASC access** to the Entra External ID tenant (not a workforce tenant) from which the Email OTP would have been sent.

2. **Request customer provide the correlation ID / timestamp** of the sign-in via one of the below methods:
   - Collect HAR/Fiddler and follow Entra External ID Data Collection guide to locate Correlation ID / Timestamp
   - Request customer repro while clicking the diagnostics "..." link on UX and copy the correlation ID / timestamp
   - From ASC tenant graph explorer locate the correlation ID and timestamp via:
     - For sign **up** failures via EOTP: `/auditLogs/signUps?$filter=signUpIdentityProvider eq 'Email OTP' and signUpIdentity/signUpIdentifier eq '<email>'`
     - For sign **in** failures via EOTP: `/auditLogs/signIns?$filter=userId eq '<objectId>' or signInIdentifier eq '<email>'`

3. **Use ASC Auth Troubleshooter** to query the correlation ID + timestamp.

4. **Review Diagnostic Logs**: From ASC Auth Troubleshooter -> click each request -> Expert view -> Diagnostic Logs.

5. **Filter by `otp`** and confirm if the log value `Queued OTP email delivery request` is returned.

6. **If log IS found**: eSTS sent the OTP email successfully. Advise customer to check inbox for spam/deleted items/blocked messages from `account-security-noreply@accountprotection.microsoft.com`.

7. **If log is NOT found**: Escalate to eSTS engineering team following ESTS Escalation Guidelines with the customer's correlation ID + timestamp.
