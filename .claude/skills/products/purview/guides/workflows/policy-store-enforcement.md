# Purview 策略存储与执行 — 排查工作流

**来源草稿**: `ado-wiki-a-policy-change-removing-corp-access.md`, `ado-wiki-get-tenant-xml-scc-labeling-policy.md`
**Kusto 引用**: 无
**场景数**: 10
**生成日期**: 2026-04-07

---

## Scenario 1: dSTS Enforcement to Block Corp Access
> 来源: ado-wiki-a-policy-change-removing-corp-access.md | 适用: 未标注

### 排查步骤
Production Access Standard requires all access paths to be from secure identities like *ME/Torus. Secure Identity, Device and Network (Secure IDN) is a key principle of this standard requiring use of production identities and SAW devices for all access paths.

In light of the recent security incident [Midnight Blizzard](https://www.microsoft.com/security/blog/2024/01/25/midnight-blizzard-guidance-for-responders-on-nation-state-attack/), dSTS service will be blocking dSTS claims access for all Corp account (Microsoft.com). This dSTS enforcement roll out for Geneva Actions is planned to begin **3/31/2024** and complete by **4/30/2024** in all the dSTS Cloud environments noted below.

The enforcement will impact all Geneva Actions (GA) customers for all environments.

`[来源: ado-wiki-a-policy-change-removing-corp-access.md]`

---

## Scenario 2: What this Change means?
> 来源: ado-wiki-a-policy-change-removing-corp-access.md | 适用: 未标注

### 排查步骤
Every engineer who are identified as a user who has used dSTS claim using Corp account to execute one or more Geneva Actions operations in past 90 days OR you are the owner of an extension published in Geneva Actions. This will be impacting your use of Corp credentials to receive dSTS claim.

`[来源: ado-wiki-a-policy-change-removing-corp-access.md]`

---

## Scenario 3: What does this mean? What are the impacted scenarios?
> 来源: ado-wiki-a-policy-change-removing-corp-access.md | 适用: 未标注

### 排查步骤
This change is going to be enforced at the dSTS service level. Once enforced, dSTS will not issue any tokens to Corp credentials.

- Publishing new Geneva Actions Extensions packages with Corp credentials will be blocked for all Geneva Actions environments.
- Any Geneva Actions operation using Corp credentials will fail as dSTS will not provide tokens in the Geneva Actions environments.
- Users will be required to use production identities like *ME or Torus to publish new packages and receive claims to run existing operations since these production identities enforce SAW device, you will need to procure SAW machines for Geneva Actions operation execution.

`[来源: ado-wiki-a-policy-change-removing-corp-access.md]`

---

## Scenario 4: Geneva Actions environments in scope for this enforcement
> 来源: ado-wiki-a-policy-change-removing-corp-access.md | 适用: Mooncake ✅

### 排查步骤
Configurations for dSTS enforcement across various cloud environments (Test, Prod, Fairfax, MoonCake), with corresponding dSTS endpoints and Geneva Actions environments.

`[来源: ado-wiki-a-policy-change-removing-corp-access.md]`

---

## Scenario 5: What action is needed from me as Geneva Actions Extension owner?
> 来源: ado-wiki-a-policy-change-removing-corp-access.md | 适用: 未标注

### 排查步骤
Extension owners need to remove Corp Claim mappings for GA dSTS service accounts by 3/31 in dSCM.

`[来源: ado-wiki-a-policy-change-removing-corp-access.md]`

---

## Scenario 6: What action is needed from me as Geneva Actions user executing an operation?
> 来源: ado-wiki-a-policy-change-removing-corp-access.md | 适用: 未标注

### 排查步骤
After Corp claim mappings are removed, all Geneva Actions user will require production identities (*ME/Torus) with a SAW device to execute Geneva Actions operations.

`[来源: ado-wiki-a-policy-change-removing-corp-access.md]`

---

## Scenario 7: Support Contacts
> 来源: ado-wiki-a-policy-change-removing-corp-access.md | 适用: 未标注

### 排查步骤
For E+D services and users: Joel Hendrickson, Harry Kaur
For C+AI CSS / support scenarios: Chris Geisbush, Alok Kumar
For dSTS support questions: Krishan Veer, Thomas Knudson
For Azure Core services and dependencies: Sandeep Ramatarak

`[来源: ado-wiki-a-policy-change-removing-corp-access.md]`

---

## Scenario 8: Purpose
> 来源: ado-wiki-get-tenant-xml-scc-labeling-policy.md | 适用: 未标注

### 排查步骤
If SCC may not be working due to tenant specific issues or policy, this script will retrieve the XML Policy. This process allows the Babylon CSS team to identify if the support ticket should be moved to SCC CSS team for investigation (in case policy is not retrieved correctly) or it should be managed by the Babylon CSS team.

`[来源: ado-wiki-get-tenant-xml-scc-labeling-policy.md]`

---

## Scenario 9: Key Points
> 来源: ado-wiki-get-tenant-xml-scc-labeling-policy.md | 适用: 未标注

### 排查步骤
- Customer can check if SCC policy is being pulled correctly by running the GetPolicy.ps1 script
- The PS script returns the match policy in the context of the user running the command
- Good starting point to check SCC responsiveness (small chance script works but Babylon still has issues retrieving policy)
- Customer running the script should be able to see all scoped and un-scoped labels
- With new SCC UX change, customers can scope labels just for Babylon (making them inapplicable for Office apps labeling)

`[来源: ado-wiki-get-tenant-xml-scc-labeling-policy.md]`

---

## Scenario 10: Running the Script
> 来源: ado-wiki-get-tenant-xml-scc-labeling-policy.md | 适用: 未标注

### 排查步骤
1. Login with admin privileges
2. Windows compatible
3. Use any account: Uses msal.ps package (supports MFA) - script will request if not installed
4. Download & Run GetPolicy.ps1 from PowerShell prompt (available in wiki attachment)
5. Review results — script returns the Policy XML

`[来源: ado-wiki-get-tenant-xml-scc-labeling-policy.md]`

---
