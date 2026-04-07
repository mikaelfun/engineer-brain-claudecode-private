---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Roles and Permission/Local test for  role&permission issue"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Roles%20and%20Permission/Local%20test%20for%20%20role%26permission%20issue"
importDate: "2026-04-05"
type: troubleshooting-guide
---

Prepare your own lab for local test of role&permission issue. For all the role&permission related issue, please reproduce and verify locally before escalation. Request the escalation with the reproducing result.

You should have an initial account which is the tenant level admin of your lab. This account has full access to everything in your subscription. Another user account is required to reproduce the issue.

## Steps

1. Find **Microsoft Entra ID** in Azure Portal
2. Create a new user in this tenant:
   - **Option 1**: Create a new user directly, then login by this account for test
   - **Option 2**: Invite external user (e.g. your @microsoft.com account). Login via your Microsoft account to continue the test.
