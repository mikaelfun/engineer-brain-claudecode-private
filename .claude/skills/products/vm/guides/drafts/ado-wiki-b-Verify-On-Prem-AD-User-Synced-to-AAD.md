---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Azure Files Identity/AD DS with AD Connect Syncing to AAD with AAD DS/Verify On   Prem AD User Synced to AAD_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FAzure%20Files%20Identity%2FAD%20DS%20with%20AD%20Connect%20Syncing%20to%20AAD%20with%20AAD%20DS%2FVerify%20On%20%20%20Prem%20AD%20User%20Synced%20to%20AAD_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.TSG
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]

Please use the following TSG to verify if the On-Prem AD user is synced to Azure Active Directory appropriately. This is one of the pre-requisites for AD Auth to work properly. 

#Description

On the portal, you should see an entry for your on-prem user and the source for that user/group should be **"Windows Server AD"**. Once this is confirmed, follow below TSG to find out if the **on-prem SID** matches whats on AAD.

[Use graph explorer to identify OnPremiseSID associated with OID](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495034?anchor=how-to-detect)

![ADUserinAAD.png](/.attachments/SME-Topics/Azure-Files-All-Topics/ADUserinAAD-0b9af851-11eb-446b-9646-729f267357e0.png)

::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
