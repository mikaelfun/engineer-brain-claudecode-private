---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Support Topics/Authoring a Policy/Assistance with aliases"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FSupport%20Topics%2FAuthoring%20a%20Policy%2FAssistance%20with%20aliases"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Policy/Authoring a Policy/Assistance with Aliases
This support topic should be selected by customers when they are not able to find the right alias for the required property.

[[_TOC_]]

## 1. Identify how that property looks in the resource payload
[[TSG] Get the right resource payload](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623716/)

## 2. Check if we can support the requirement
Verify is this is not in the list of known issues:
[[GH] Azure Policy known issues](https://github.com/Azure/azure-policy#known-issues)

## 3. Verify if the property is available only in Data Plane
[[TSG] Identify DP vs CP](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623717/)

### 3.1 Check if we already have a built-in policy definition to cover the requirement
From the Azure Portal
- Go to **Policy** > **Definitions**.
- Search for keywords and look for a built-in definition that fulfills the requirement. You can also filter the definitions by Category.

### 3.2 It is a Data Plane only property, but there is no built-in definition for the requirement
Ask the customer to file a feedback request on [UserVoice](https://feedback.azure.com/forums/915958-azure-governance)

## 4. It is a Control Plane property, but there is no alias for it
Double check existence of the alias by following [[TSG] Find the right alias](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623713/), if it is not available, open a SME request with all the above information.
