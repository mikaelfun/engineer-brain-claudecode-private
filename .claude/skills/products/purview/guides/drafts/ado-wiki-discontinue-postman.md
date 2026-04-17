---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/SDK and API/Discontinue use of Postman"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FSDK%20and%20API%2FDiscontinue%20use%20of%20Postman"
importDate: "2026-04-05"
type: security-advisory
---

# Discontinue Use of Postman

## Background
Postman switched to cloud-only service in late 2023. All data including sensitive credentials and secrets are automatically uploaded to Postman cloud, exposing Microsoft to security risks.

**Action required**: Stop using Postman and urgently delete/rotate any secrets/credentials that may have been compromised.

## Approved Alternatives

1. **REST Client for VS Code** (endorsed by C+AI Security team)
   - Extension: https://marketplace.visualstudio.com/items?itemName=humao.rest-client
2. **Insomnia** (can import Postman Collections, approved for SAWs)
3. **Bruno** (can import Postman Collections)
4. **Visual Studio built-in .http file feature**

## Migration from Postman to Insomnia

1. Export collections from Postman (right-click collection → Export)
2. Download Insomnia free version: https://insomnia.rest/pricing
3. Choose "Keep storing locally in Local Vault" (do NOT enable Cloud Sync)
4. Import → select the JSON file exported from Postman
5. Go to "Imported Workspace" to access all API calls
