# Purview 自动标签 (客户端 / 服务端) — 排查工作流

**来源草稿**: `ado-wiki-a-client-side-auto-labeling-support-boundaries.md`, `ado-wiki-a-required-information-server-side-auto-labeling.md`, `ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md`, `ado-wiki-a-server-side-auto-labeling-support-boundaries.md`, `ado-wiki-a-test-dlppolicies-auto-labeling-report.md`, `ado-wiki-b-client-side-auto-labeling-required-information.md`, `ado-wiki-client-side-auto-labeling-not-applying.md`, `ado-wiki-server-side-auto-labeling-not-applying.md`
**Kusto 引用**: 无
**场景数**: 21
**生成日期**: 2026-04-07

---

## Scenario 1: Scenario
> 来源: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md | 适用: 未标注

### 排查步骤
This troubleshooting guide is for investigating when a Server Side Auto Labeling policy is in simulation and does not return the expected results

- Email missing in Auto label simulation
- Document not showing in the Items for Review for auto labeling

`[来源: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md]`

---

## Scenario 2: Step 1: Verify the conditions of the policy
> 来源: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md | 适用: 未标注

### 排查步骤
First we must verify the conditions of the policy to verify it if indeed should match the expected file

- Follow the guide on how to [Analyze the Conditions](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/8998/Scenario-Server-Side-Auto-Labeling-not-applying-correctly?anchor=step-1%3A-analyze-conditions) to verify if the policy should match or not

`[来源: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md]`

---

## Scenario 3: Step 2: Understand how simulation works for SharePoint and OneDrive
> 来源: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md | 适用: 未标注

### 排查步骤
Simulation mode for SharePoint and OneDrive documents will query all the documents at the time the policy is ran and report the results

- Was the file modified after the simulation was started?
  - Simulation mode will only return documents that match the conditions when the simulation was started
  - If the document was created or changed to match the policy conditions after simulation started, it will not match
  - Emails do not follow this, as Simulation policies are evaluated when the email is sent and received
  - If a custom SIT was created after the document was last modified, that SIT will not be found on the document in Simulation
  - Only 100 files per site/user per policy will be shown
- How does simulation work?
  - For each Site/User in the Auto Label Policy, Up to 100 files from each Site/User that match the Auto Label rule will be queried
    - Only previously classified files will be returned in the initial query
    - This is why the Custom SIT needs to be created before the document was created/modified
    - SPO/ODB classification only happens when documents are created or modified
  - Then, from the initial query of up to 100 documents per Site/User, all of those documents will have classification re-run on them to see if they still meet the Auto Label Rule criteria
  - After the second scan, if they meet the Auto Label Rule criteria, then they will be shown in the Simulation Results
- Verify the [prerequisites in the public documentation for simulation mode](https://learn.microsoft.com/en-us/purview/apply-sensitivity-label-automatically#prerequisites-for-auto-labeling-policies)

`[来源: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md]`

---

## Scenario 4: Step 3: Understand how simulation works for Exchange
> 来源: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md | 适用: 未标注

### 排查步骤
Auto label simulations in Exchange work by evaluating emails in transport, and if they should apply to the policy

- Follow the [Auto Labeling not matching section for Exchange](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/8998/Scenario-Server-Side-Auto-Labeling-not-applying-correctly?anchor=emails-sent-in-exchange-online) TSG to see if the policy matched in the Extended Message Trace

`[来源: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md]`

---

## Scenario 5: Step 4: Get Assistance
> 来源: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md | 适用: 未标注

### 排查步骤
If the steps above do not resolve your issue, [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case) and get the [required information](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10522/Required-Information-Server-Side-Auto-Labeling)

`[来源: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md]`

---

## Scenario 6: Introduction
> 来源: ado-wiki-a-test-dlppolicies-auto-labeling-report.md | 适用: 未标注

### 排查步骤
This will show how to gather a Test-DlpPolicies report for a document in SharePoint or OneDrive. This report will show the evaluation results of Auto Labeling Policies at the time of the cmdlet execution

`[来源: ado-wiki-a-test-dlppolicies-auto-labeling-report.md]`

---

## Scenario 7: Step 1: Follow the instructions
> 来源: ado-wiki-a-test-dlppolicies-auto-labeling-report.md | 适用: 未标注

### 排查步骤
The instructions for running Test-DlpPolicies are detailed in the public documentation

- Connect to the [Exchange Online PowerShell](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9073/How-to-Connect-to-Exchange-Online-PowerShell)
- Follow [How to: Run Test-DlpPolicies - Overview](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8939/How-to-Run-Test-DlpPolicies)
- Once the report is finished, a DLP results email and an Auto Labeling results email will be sent

`[来源: ado-wiki-a-test-dlppolicies-auto-labeling-report.md]`

---

## Scenario 8: Step 2: Analyze the Auto Labeling report
> 来源: ado-wiki-a-test-dlppolicies-auto-labeling-report.md | 适用: 未标注

### 排查步骤
Next we will analyze the Auto Labeling report sent to the given report address

- Find the email with the subject `Test-DlpPolicies for Autolabeling on File` in the inbox of the `-SendReportTo` email
- `Classification Results for the last execution` will show the Sensitive Information Types found on the file
- `Currently applied label ID` is the label that is applied
- `Label stamped to item by MIP processor` shows the label applied if it was automatically applied
- `Policy Evaluation Results` will show the results of the policy evaluation at the time of running the cmdlet
  - It will show which Auto Label policies did/did not match

`[来源: ado-wiki-a-test-dlppolicies-auto-labeling-report.md]`

---

## Scenario 9: Scenario: Client Side Auto Labeling not applying correctly
> 来源: ado-wiki-client-side-auto-labeling-not-applying.md | 适用: 未标注

### 排查步骤
This troubleshooting guide covers:
- Client Side Auto Labeling not applying in Outlook
- Word not applying sensitivity label automatically
- Excel online not recommending sensitivity label
- Client Side Auto labeling false positive

`[来源: ado-wiki-client-side-auto-labeling-not-applying.md]`

---

## Scenario 10: Step 1: Verify the user is entitled to use Auto Labeling
> 来源: ado-wiki-client-side-auto-labeling-not-applying.md | 适用: 未标注

### 排查步骤
Check the user has capability and correct licensing for Auto Labeling using Assist365.
Plans: Microsoft E5, Office 365 E5, Microsoft 365 E5 Compliance, Office 365 Advanced Compliance → MIP_S_CLP2.

`[来源: ado-wiki-client-side-auto-labeling-not-applying.md]`

---

## Scenario 11: Step 2: Verify the label can be manually applied
> 来源: ado-wiki-client-side-auto-labeling-not-applying.md | 适用: 未标注

### 排查步骤
If the label is not visible, follow "Sensitivity Label is not showing" TSG.

`[来源: ado-wiki-client-side-auto-labeling-not-applying.md]`

---

## Scenario 12: Step 3: Verify the configuration
> 来源: ado-wiki-client-side-auto-labeling-not-applying.md | 适用: 未标注

### 排查步骤
In Purview Portal → Information Protection → Edit Label → Auto-labeling for files and emails:
- Check Sensitive Information Types (SITs)
- Check if label should auto-apply or recommend
- Verify user has appropriate license

`[来源: ado-wiki-client-side-auto-labeling-not-applying.md]`

---

## Scenario 13: Step 4: Test the Sensitive Information Type
> 来源: ado-wiki-client-side-auto-labeling-not-applying.md | 适用: 未标注

### 排查步骤
Put text into .txt file and test against SIT tester portal.
- If SIT doesn't match → follow Classifier guides (Built-in SIT, Custom SIT, Trainable Classifier, EDM)
- If SIT matches but is false positive → follow False Positive Guide
- If SIT matches as expected → continue

`[来源: ado-wiki-client-side-auto-labeling-not-applying.md]`

---

## Scenario 14: Step 5: Route to the correct client
> 来源: ado-wiki-client-side-auto-labeling-not-applying.md | 适用: 未标注

### 排查步骤
Reproduce in OWA:
- If reproduces in OWA → issue is with backend service, continue
- If doesn't reproduce in OWA → issue is with desktop client (Word, PowerPoint, Outlook Desktop)

`[来源: ado-wiki-client-side-auto-labeling-not-applying.md]`

---

## Scenario 15: Step 6: Grab a network trace
> 来源: ado-wiki-client-side-auto-labeling-not-applying.md | 适用: 未标注

### 排查步骤
In OWA network trace:
1. Find label API call: `compliancepolicy/api/v1.0/user/label`
2. Check `AutoLabeling_SensitiveTypeIds` is set for affected label
   - If missing but Conditions set in IPPSSession → escalate to DLP team
3. Check WebSocket calls for `AugLoop_SecurityClp_LabellingAnnotation`
   - Verify connection established
   - Verify request/response present
   - If no request → re-check licensing and Assist365, or route to OWA team
   - If correct label returned but not shown → route to OWA team

`[来源: ado-wiki-client-side-auto-labeling-not-applying.md]`

---

## Scenario 16: Resolution: Auto Labeling not working due to licensing
> 来源: ado-wiki-client-side-auto-labeling-not-applying.md | 适用: 未标注

### 排查步骤
Root Cause: User not entitled for Auto Labeling per Microsoft 365 Compliance Licensing.
Resolution: Verify and assign correct license (E5 or equivalent with MIP_S_CLP2).

`[来源: ado-wiki-client-side-auto-labeling-not-applying.md]`

---

## Scenario 17: Scenario: Server Side Auto Labeling not applying correctly
> 来源: ado-wiki-server-side-auto-labeling-not-applying.md | 适用: 未标注

### 排查步骤
Covers: auto labeling not applied to sent email, not applying to SPO/ODB document, false positive.

`[来源: ado-wiki-server-side-auto-labeling-not-applying.md]`

---

## Scenario 18: Step 1: Analyze Conditions
> 来源: ado-wiki-server-side-auto-labeling-not-applying.md | 适用: 未标注

### 排查步骤
- Verify policy scope (users, sites)
- Policy must be scoped to the SENDER of the email
- Test file against expected SITs using SIT tester
- Verify rule is enabled
- Verify policy is in Enforce mode (simulation won't apply labels)
- Overwriting manually applied labels only supported for Exchange
- Document Properties must be crawled and mapped in SharePoint

`[来源: ado-wiki-server-side-auto-labeling-not-applying.md]`

---

## Scenario 19: Admin Units
> 来源: ado-wiki-server-side-auto-labeling-not-applying.md | 适用: 未标注

### 排查步骤
- SPO does NOT support Admin Units — assigning AU + SPO location breaks the policy
- If AU assigned, verify user is included in the AU

`[来源: ado-wiki-server-side-auto-labeling-not-applying.md]`

---

## Scenario 20: Exchange Online
> 来源: ado-wiki-server-side-auto-labeling-not-applying.md | 适用: 未标注

### 排查步骤
- Get Extended Message Trace → analyze AgentInfo
- Check which policies evaluated and matched
- If expected policy didn't evaluate → simulation mode or wrong user scope
- Policy scoping = sender scope; external senders require "All" scope
- Check if manual label was already applied (override rules apply)

`[来源: ado-wiki-server-side-auto-labeling-not-applying.md]`

---

## Scenario 21: SharePoint/OneDrive
> 来源: ado-wiki-server-side-auto-labeling-not-applying.md | 适用: 未标注

### 排查步骤
- Run Test-DlpPolicies cmdlet
- Analyze report for policy match and SIT findings
- Check if existing label will be overridden per override rules

`[来源: ado-wiki-server-side-auto-labeling-not-applying.md]`

---
