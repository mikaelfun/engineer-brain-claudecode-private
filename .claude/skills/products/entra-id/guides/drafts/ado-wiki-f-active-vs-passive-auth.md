---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/Authentication and Access/ADFS/Active Vs Passive Auth"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FAuthentication%20and%20Access%2FADFS%2FActive%20Vs%20Passive%20Auth"
importDate: "2026-04-07"
type: troubleshooting-guide
---

### Active vs. Passive Explained

**Active:** This is a thick client such as Outlook. The client first contacts the O365 CAS, which then contacts the STS Endpoint (ADFS Proxy/WAP) to authenticate. The client never holds the token.

**Passive:** This is used for web based logins via a web browser and the protocol used in this case is https. The client contacts the O365 CAS, which redirects the client directly to the On-Premises STS Endpoint to authenticate. After authentication, the client is redirected back to the O365 CAS with an auth token.

### Client Listing

| Client | Authentication Type |
|--------|---------------------|
| Outlook 2010 | Active |
| Outlook 2013 (default) | Active |
| Outlook 2016 | Passive |
| ExO Powershell | Active |
| Exchange Web Services | Active |
| Exchange Active Sync | Active |
| OWA | Passive |

### Things to know

- A single type of auth attempt working does not mean ADFS is working properly.
- If EAS and Outlook both fail but OWA works internally, check for a failed WAP. External OWA will also fail in this situation.
