# AKS ACI 网络与 DNS — managed-identity — 排查工作流

**来源草稿**: ado-wiki-a-acr-escalation-process.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: ACR Escalation Process
> 来源: ado-wiki-a-acr-escalation-process.md | 适用: 适用范围未明确

### 排查步骤

#### ACR Escalation Process


#### Scenario 1

If you get a case with support topic ACR and if you are not aware of the Solution or Possible Case then perform the following :

1. Reach out to SME over [AVA SME-ACR Triage](https://teams.microsoft.com/l/channel/19%3a6cb43a325b764abca5654897b32c60cd%40thread.skype/AVA%2520SME-ACR%2520Triage?groupId=074e4c99-14b9-4454-98ae-9eff23b77872&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)
2. If no response or as per SME's direction, update in [ACR-SUP](https://teams.microsoft.com/l/channel/19%3a587a166080b64df99c2375a0b22c91b1%40thread.skype/General?groupId=3854ec50-7444-40d8-94a4-5989ec49b470&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

   **Note:** ACR PG is not well versed with ACR AVA Channel. Prefer using ACR-SUP Support Channel for time being until PG is completely onboarded to AVA.

3. Identify & Fix the issue
4. Close the case.

#### Scenario 2

If you need assistance from PG and you are not getting any response in ACR-SUP or AVA, please log an ICM. Before determining Severity of the IcM:

- Read https://aka.ms/azurecen to understand the definition of the IcM Severity. Default to Sev-3 unless it's a regional outage.
- Before logging any IcM, leverage the [CSS wiki](https://aka.ms/akswiki), your TA, [acr-sup](https://teams.microsoft.com/l/channel/19%3a587a166080b64df99c2375a0b22c91b1%40thread.skype/General?groupId=3854ec50-7444-40d8-94a4-5989ec49b470&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) channel to make enough investigation.
- If the ACR product is not covered in your specialty, reach out to Steven Xiao, Sathana Balasubramanian, or the Azure Container pod.

#### Scenario 3

If you get response over ACR-SUP and if the issue is identified to be a BUG or waiting on HOTFIX, log an ICM using the template https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=32J233.

**Note: ICM is the preferred way of tracking any issue from CSS perspective. If issue is identified as a BUG, get the Work Item reference from PG, update the ICM with the information. Anything requiring much interaction between CSS and PG should be tracked via ICM.**

#### Scenario 4

In case of any outage scenario, log a Master ICM with severity 2 and update the cases with the same ICM. Ensure you also update **CSS CONTAINERS NOTIFY DL** with the ICM and outage information.

**Note:** Once the outage is mitigated, get a public facing statement on the RCA from PG. Do not reveal sensitive information without PG's awareness. For clarification contact **Sajay Antony**.

#### ICM TEMPLATES FOR ACR

1. Regular incident [ICM Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=32J233)

##### Include the following information in ICM

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

#### Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>
**Contributors:** Alfredo Diaz, Steven Xiao, Ines Monteiro, Karina Jacamo, johngose

---
