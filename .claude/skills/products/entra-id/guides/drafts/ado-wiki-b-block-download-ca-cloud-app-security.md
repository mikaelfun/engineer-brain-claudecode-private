---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/ACE Identity TSGs/Identity Technical Wiki/Knowledge Base/Block download of files through Conditional Access Policy and cloud app security"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FACE%20Identity%20TSGs%2FIdentity%20Technical%20Wiki%2FKnowledge%20Base%2FBlock%20download%20of%20files%20through%20Conditional%20Access%20Policy%20and%20cloud%20app%20security"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Block Download of Files Through Conditional Access Policy and Cloud App Security

Through Conditional Access session controls and Microsoft Defender for Cloud Apps (formerly MCAS) session policies, you can block file downloads on end-user machines.

> **Note:** Cloud App Security policy configuration is beyond the standard Azure AD support boundary. If the scenario is complex, engage the Cloud App Security team.

## Step 1: Configure Conditional Access Policy

In the Azure Portal, configure a Conditional Access policy with a **Session** control to use Conditional Access App Control:

1. Azure AD > Security > Conditional Access > New policy
2. Set **Users/Groups**, **Cloud apps** (target application)
3. Under **Session** → select **Use Conditional Access App Control** → choose "Use custom policy" or "Block downloads"
4. Enable and save the policy

Reference: [Deploy Cloud App Security Conditional Access App Control for Azure AD apps](https://docs.microsoft.com/en-us/cloud-app-security/proxy-deployment-aad#step-1--configure-your-idp-to-work-with-cloud-app-security)

## Step 2: Configure Session Policy in Cloud App Security Portal

1. Log in to the Microsoft Defender for Cloud Apps portal
2. Navigate to **Control > Templates**
3. Create a Session policy:
   - Policy type: **Session policy**
   - Session control type: **Block activities** or use the **Block download (with DLP)** template
   - Filter: select target users/groups and cloud apps
   - Action: **Block**

Reference: [Block downloads from unmanaged devices with Cloud App Security Conditional Access App Control](https://docs.microsoft.com/en-us/cloud-app-security/use-case-proxy-block-session-aad#step-2-create-a-session-policy)

## End User Experience

When a user attempts to download a file:
1. They see a download prompt as normal
2. Upon clicking download, they receive a warning message from Cloud App Security
3. If they proceed, the downloaded file cannot be opened and shows a Cloud App Security block message

## Support Scope Note

Cloud App Security session policy configuration is beyond the Azure AD support boundary. For complex scenarios, engage the **Microsoft Defender for Cloud Apps** support team.
