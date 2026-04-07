---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Escalation Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Escalation%20Process"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR Escalation Process

## Scenario 1

If you get a case with support topic ACR and if you are not aware of the Solution or Possible Case then perform the following :

1. Reach out to SME over [AVA SME-ACR Triage](https://teams.microsoft.com/l/channel/19%3a6cb43a325b764abca5654897b32c60cd%40thread.skype/AVA%2520SME-ACR%2520Triage?groupId=074e4c99-14b9-4454-98ae-9eff23b77872&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)
2. If no, response or as per SME's direction, you can also update in [ACR-SUP](https://teams.microsoft.com/l/channel/19%3a587a166080b64df99c2375a0b22c91b1%40thread.skype/General?groupId=3854ec50-7444-40d8-94a4-5989ec49b470&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

   **Note:** ACR PG is not well versed with ACR AVA Channel. Prefer using ACR-SUP Support Channel for time being until PG is completely onboarded to AVA.

3. Identify & Fix the issue
4. Close the case.

## Scenario 2

If you need assistance from PG and you are not getting any response in ACR-SUP or AVA, please log an ICM. Before determining Severity of the IcM:

- Please read <https://aka.ms/azurecen> to understand the definition of the IcM Severity. Basically please default to use Sev-3 unless it's regional outage issue of the product.
- Before logging any IcM, please leverage the [CSS wiki](https://aka.ms/akswiki), your TA, [acr-sup](https://teams.microsoft.com/l/channel/19%3a587a166080b64df99c2375a0b22c91b1%40thread.skype/General?groupId=3854ec50-7444-40d8-94a4-5989ec49b470&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) channel to make enough investigation.
- If the ACR product is not covered in your specialty, please reach out for help to Steven Xiao, Sathana Balasubramanian, or the Azure Container pod.

## Scenario 3

If you get response over ACR-SUP and if the issue is identified to be a BUG or waiting on HOTFIX, please log an ICM using the template <https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=32J233>.

**Note: ICM is preferred way of tracking any issue from CSS perspective.**

## Scenario 4

In case of any outage scenario, log a Master ICM with severity 2 and update the cases with the same ICM to track from CSS perspective. In case of outage scenario, ensure you also update **CSS CONTAINERS NOTIFY DL** with the ICM and outage information.

**Note:** Once the outage is mitigated, get a public facing statement on the RCA from PG to deliver to Customer.

## ICM TEMPLATES FOR ACR

1. Regular incident [ICM Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=32J233)

### Include the following information in ICM

| Field                             | Value |
|-----------------------------------|-------|
| Case Reference                    |       |
| ASC Link from the case            |       |
| Issue (as per customer verbatim)  |       |
| Issue (as per case owner's words) |       |
| Error Message                     |       |
| ASK on the IcM                    |       |
| Subscription ID                   |       |
| Resource Name                     |       |
| ACR Name                          |       |
| ACR Region                        |       |
| Any additional information        |       |
