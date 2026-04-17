---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Azure Files Identity/AAD_Kerb_Auth/Azure Files AAD Kerb with AVD and FSLogix Support Boundaries_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FAzure%20Files%20Identity%2FAAD_Kerb_Auth%2FAzure%20Files%20AAD%20Kerb%20with%20AVD%20and%20FSLogix%20Support%20Boundaries_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Files AAD Kerb with AVD and FSLogix Support Boundaries

The tickets should ideally start with the AVD team. AVD team will use their master TSG to verify that the customer has followed all the setup instructions appropriately. Depending on the type of issue the customer is facing, the following teams can be engaged.

| Scenario | Sub-Scenario | Supporting team | Support topic |
|----------|-------------|-----------------|---------------|
| AAD Setup | Creating App Identity for Storage Account in Azure | AAD Team | |
| | Creating service principal for the storage account | AAD Team | |
| | Setting the service principal password by calling the graph api | AAD Team | |
| | Setting up API permissions - User.Read and Grant Admin | AAD Team | |
| Storage Setup | Setting up storage account - Creation of the account, enabling AAD Kerb property, setting up RBAC or NTFS permissions | Azure Files Team | Azure\Files Storage\Security\Azure Active Directory(AAD) Kerberos authentication |
| FSLogix setup | Configure FSLogix on the session host | AVD Team | |
| Post setup issues | Klist not showing TGT or Storage Account Kerberos ticket | AAD Team | |
| | TGT and service ticket available but still can not mount or see profile containers | Azure Files Team | Azure\Files Storage\Security\Azure Active Directory(AAD) Kerberos authentication |
