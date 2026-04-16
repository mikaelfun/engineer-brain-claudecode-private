# Purview 工程师内部工具 (DTM/rCRI/ICM) — 排查工作流

**来源草稿**: `ado-wiki-a-case-management-acronyms.md`, `ado-wiki-a-case-management-basics.md`, `ado-wiki-a-citizen-alliance-support-program.md`, `ado-wiki-a-cri-creation-through-asc.md`, `ado-wiki-a-cri-escalation-framework.md`, `ado-wiki-a-dfm-introduction.md`, `ado-wiki-a-guidance-for-internal-non-css.md`, `ado-wiki-a-handling-feature-requests.md`, `ado-wiki-a-icm-process.md`, `ado-wiki-a-icm-terminology.md`, `ado-wiki-a-icm-waiting-customer-or-css.md`, `ado-wiki-a-logs-required-for-escalation-3p-data-source-scan.md`, `ado-wiki-a-mapping-purview-components-icm.md`, `ado-wiki-a-rca-escalation-process.md`, `ado-wiki-a-supportability-restricted-cris.md`, `ado-wiki-a-teams-sharing-dos-and-donts.md`, `ado-wiki-ava-process-escalation-data-collection.md`, `ado-wiki-b-ICM-Quality-Step-by-Step-Flow.md`, `ado-wiki-b-azure-support-center-asc.md`, `ado-wiki-b-duplicate-case-best-practices.md`, `ado-wiki-collaboration-support-boundary.md`, `ado-wiki-get-adf-datascan-activityids.md`, `ado-wiki-internal-system-error-connectivity-scripts.md`, `ado-wiki-kusto-datascanagent-event-migration.md`, `ado-wiki-logs-required-for-escalation.md`, `ado-wiki-system-error-launch-datascan-process.md`
**Kusto 引用**: 无
**场景数**: 149
**生成日期**: 2026-04-07

---

## Scenario 1: CASE DETAILS
> 来源: ado-wiki-a-case-management-acronyms.md | 适用: 未标注

### 排查步骤
##DFM
Dynamics for Microsoft

##ASC
Azure Support Center

##FQR
First Quality Response refers to the quality of the first communication to the customer. This first communication sets stage for a happy customer by helping the customer feel heard, their needs will be addressed, ensure helpful communication, and requesting initial details. This can be by Phone, Email, Teams chat but always needs to be recorded in the case.

##FCR
First Contact Resolution indicates that the customer was provided a resolution on the FQR contact.

##FDR
First Day Resolution indicates the customer was provided a resolution with in the first day that the case was opened.

##FWR
First Week Resolution indicates the customer was provided a resolution within the first week that the case was opened.

##SAP
Support Area Path of the case. Each case is routed to a particular product support team based on a defined area of support for the product requested. This is used to route cases to the appropriate team for support.

#PEOPLE

##IM
Incident Manager is a Microsoft Employee assigned to a Premier level case to ensure customer satisfaction. Leverage these people for engaging a non-responsive customer.

##CSAM
Customer Satisfaction Account Manager is to help escalate a Premier level customer case to ensure the customer is getting the help they need.

##SLA IR
Service Level Agreement Initial Response. Different levels of support expect the support to engage the customer more frequently until the issue is resolved.

##PG
Product Group

#Escalation
##IcM
Incident Management System (Much like Service Desk)
You may see IcM and CRI used interchangeably, and you may see LSI referenced as well.

##ETA
Estimate Time of Arrival indicates the expected time that the Product Group provides a resolution

##RCA
Root Cause Analysis indicates the customer would like an official Microsoft statement as to what caused their Product issue. The Product Team has to provide an RCA. We do not offer an RCA unless requested by the customer.

##CRI
Customer-Reported Incident (Much like CSS Service Requests)

`[来源: ado-wiki-a-case-management-acronyms.md]`

---

## Scenario 2: Training
> 来源: ado-wiki-a-case-management-basics.md | 适用: 未标注

### 排查步骤
Case Management Standards: https://internal.evergreen.microsoft.com/en-us/topic/d7fe6e16-2bd8-e4b8-d060-100876eb3f9f
Delivery Design and Execution: https://internal.evergreen.microsoft.com/en-us/topic/6efd7476-2ad3-6080-2688-83e2b8be3ce4

PLEASE CALL YOUR CUSTOMERS and understand the problem if possible.

`[来源: ado-wiki-a-case-management-basics.md]`

---

## Scenario 3: 1. Assignment
> 来源: ado-wiki-a-case-management-basics.md | 适用: 未标注

### 排查步骤
First step: determine if SLA has been met and review case description/communication.

What to find in case verbatim:
- Clear description of the problem with additional information
- Customer resource URI selected (logical server/database)

If sufficient information: attempt FQR while meeting SLA.
Consider Contract and required SLA (ARR/Unified/Premier/Pro).

`[来源: ado-wiki-a-case-management-basics.md]`

---

## Scenario 4: Preferred contact method
> 来源: ado-wiki-a-case-management-basics.md | 适用: 未标注

### 排查步骤
- If preferred contact is phone but no answer, write email for first contact
- Propose other contacts in following communication

`[来源: ado-wiki-a-case-management-basics.md]`

---

## Scenario 5: SLA Help (yanking cases)
> 来源: ado-wiki-a-case-management-basics.md | 适用: 未标注

### 排查步骤
- If case is from your shift and to be reassigned shortly: make phone call for IR if phone number provided
- If case is non 24x7 and from different shift: complete FQR if time permits, else meet SLA with phone record first

`[来源: ado-wiki-a-case-management-basics.md]`

---

## Scenario 6: FQR Should Include:
> 来源: ado-wiki-a-case-management-basics.md | 适用: 未标注

### 排查步骤
- Customer name
- Self introduction (name, product, working shift/hours)
- Description of the problem
- Scoping
- Initial checking

`[来源: ado-wiki-a-case-management-basics.md]`

---

## Scenario 7: Scoping
> 来源: ado-wiki-a-case-management-basics.md | 适用: 未标注

### 排查步骤
Case can be archived when:
- Solution/workaround provided
- Issue identified as by design
- Bug detected and PG answer on fix obtained
- Issue caused by third party
- No solutions available

`[来源: ado-wiki-a-case-management-basics.md]`

---

## Scenario 8: Issue scoping
> 来源: ado-wiki-a-case-management-basics.md | 适用: 未标注

### 排查步骤
If multiple unrelated issues: focus on one topic first, separate tickets for different root causes.

`[来源: ado-wiki-a-case-management-basics.md]`

---

## Scenario 9: Initial checking
> 来源: ado-wiki-a-case-management-basics.md | 适用: 未标注

### 排查步骤
Simple analysis, assumptions, links to public documentation matching customer query.

`[来源: ado-wiki-a-case-management-basics.md]`

---

## Scenario 10: Guidelines for Raising CRIs
> 来源: ado-wiki-a-cri-creation-through-asc.md | 适用: 未标注

### 排查步骤
1. **Mandatory Use of ASC** - All CRIs must be created through the ASC (Automated Submission Channel) for consistency, traceability, and compliance.
2. **Template Compliance** - The provided template in ASC must be strictly followed. CRIs that do not adhere will be automatically mitigated without further review.
3. **When No Template Exists** - Ping an EEE for guidance. Create through the normal CRI portal only after confirmation.
4. **Why ASC is Important** - Standardization, faster processing, reduced errors, better visibility.

**Key Takeaway:** Always start with ASC. If ASC doesn't have what you need, escalate to an EEE before using any alternative method.

`[来源: ado-wiki-a-cri-creation-through-asc.md]`

---

## Scenario 11: Steps
> 来源: ado-wiki-a-cri-creation-through-asc.md | 适用: 未标注

### 排查步骤
1. On DFM, go to Apps -> ASC
2. On ASC, press "Escalate Case"
3. Based on the Support Topic, the system will recommend the likely best CRI template based on target PG team
4. Alternatively, go to "All" and search for PG team (search "Purview Data Governance" for all options)
5. Fill all mandatory fields in the template
6. Once created, ICM appears in "Associated Incidents" on ASC and on DFM

`[来源: ado-wiki-a-cri-creation-through-asc.md]`

---

## Scenario 12: Existing CRI Templates (Reference Only - DO NOT USE directly)
> 来源: ado-wiki-a-cri-creation-through-asc.md | 适用: 未标注

### 排查步骤
| PG Team | Template Link |
|---------|--------------|
| DataScan | [Create Incident](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=KO43JP) |
| DataSources | [Create Incident](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=U2323A) |
| DataMap | [Create Incident](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Y3U3G1) |
| UX | [Create Incident](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=A1L2X3) |
| DataCatalog | [Create Incident](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=aO3w24) |
| DataQuality | [Create Incident](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=w3KZ2y) |
| DataEstateHealth | [Create Incident](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=nOY1H3) |
| Insights | [Create Incident](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=s1L53o) |
| Provisioning | [Create Incident](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=NS3y3y) |

`[来源: ado-wiki-a-cri-creation-through-asc.md]`

---

## Scenario 13: CRI Escalation Framework
> 来源: ado-wiki-a-cri-escalation-framework.md | 适用: 未标注

### 排查步骤
Ensures timely resolution of CRIs by defining clear escalation paths, responsibilities, and SLAs across CSS, EEE, and PG.

`[来源: ado-wiki-a-cri-escalation-framework.md]`

---

## Scenario 14: Layer 1: CSS -> CSS Triages
> 来源: ado-wiki-a-cri-escalation-framework.md | 适用: 未标注

### 排查步骤
**Objective:** Enable CSS to escalate unresolved cases internally before involving EEEs or PG.

**Process Steps:**
1. CSS engineers attempt resolution using AVA channels and Troubleshooting Guides (TSGs)
2. CRI creation must be approved by CSS SMEs when AVA fails or PG engagement is unavoidable

**Trigger for Escalation:**
- No AVA/CRI response within 48 hours or no resolution within 7 days
- For Sev-A cases, escalate immediately without waiting for AVA

**Mandatory details:**
- Case severity, Ticket and CRI number, Case Summary
- Full repro steps, Logs and diagnostics, Customer impact statement

`[来源: ado-wiki-a-cri-escalation-framework.md]`

---

## Scenario 15: Layer 2: CSS Triages -> EEEs
> 来源: ado-wiki-a-cri-escalation-framework.md | 适用: 未标注

### 排查步骤
**Objective:** Engage Embedded Escalation Engineers for advanced troubleshooting.

**Trigger for Escalation:**
- CSS Triages confirm case complexity or PG dependency
- CRI remains unresolved after 2 weeks post-creation
- No PG response for 48 hours after CSS Triage escalation

**EEE Responsibilities:**
- Perform deep technical analysis
- Partner with CSS SMEs for additional repro or logs
- Prepare escalation package for PG with all required context

**Expected Outcome:** Reduce aged CRIs (>30 days) by enforcing workaround or ETA within 1 month.

`[来源: ado-wiki-a-cri-escalation-framework.md]`

---

## Scenario 16: Layer 3: EEEs -> PG/CSS MGMT
> 来源: ado-wiki-a-cri-escalation-framework.md | 适用: 未标注

### 排查步骤
**Objective:** Secure Product Group engagement for fixes requiring code changes or roadmap decisions.

**Trigger for Escalation:**
- CRI exceeds 30 days without workaround or ETA
- Poor quality responses + 48 hours without PG response since CSS triage
- PG involvement is critical for resolution (e.g., bug fix, feature gap)

**SLA compliance:**
- PG response within 48 hours
- ETA or workaround within 30 days
- Discuss inclusion of unresolved CRIs in Known Issues documentation if ETA > 1 month

`[来源: ado-wiki-a-cri-escalation-framework.md]`

---

## Scenario 17: DFM Site
> 来源: ado-wiki-a-dfm-introduction.md | 适用: 未标注

### 排查步骤
aka.ms/onesupport (log in with @microsoft credentials)

`[来源: ado-wiki-a-dfm-introduction.md]`

---

## Scenario 18: Resources
> 来源: ado-wiki-a-dfm-introduction.md | 适用: 未标注

### 排查步骤
- DfM Wiki: https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/59/Welcome
- DfM Access, Logging In, Setting Up Profiles, DfM Training (see wiki links)

`[来源: ado-wiki-a-dfm-introduction.md]`

---

## Scenario 19: Demo Videos
> 来源: ado-wiki-a-dfm-introduction.md | 适用: 未标注

### 排查步骤
DFM Intro Case-Basics, Logging, Meet SLA by Phone/Email, Launch ASC, Change status/Severity, Adding notes/Labor, Edit SAP, Link ICM, Transfer Case, Open Collaboration, Escalations, Close Case

`[来源: ado-wiki-a-dfm-introduction.md]`

---

## Scenario 20: Introduction
> 来源: ado-wiki-a-dfm-introduction.md | 适用: 未标注

### 排查步骤
There is a Global DfM portal (main) and a EU DfM portal (EMEA region). EU cases do not show in CaseBuddy.

`[来源: ado-wiki-a-dfm-introduction.md]`

---

## Scenario 21: Initial Response: FQR
> 来源: ado-wiki-a-dfm-introduction.md | 适用: 未标注

### 排查步骤
Check IR SLA timer first. FDR and FWR have timers but no hard requirement. Meeting SLA is a priority.

Key checks:
- Case severity (Sev A validation: https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/911654/Confirm-Valid-Sev-A)
- Support Level: S500 > Premier > Broad Commercial/Pro
- Read case title, Customer Statement, view attachments

`[来源: ado-wiki-a-dfm-introduction.md]`

---

## Scenario 22: Purview Supportability
> 来源: ado-wiki-a-guidance-for-internal-non-css.md | 适用: 未标注

### 排查步骤
Purview supportability team helps connecting CSS and the product group. Best community for general Purview questioning. Reach by emailing Microsoft Purview EEEs <azurepurvieweees@microsoft.com>, or ping Pedro Martins (pemar) or Vimal Sharma (vimals).

`[来源: ado-wiki-a-guidance-for-internal-non-css.md]`

---

## Scenario 23: Friends of Purview
> 来源: ado-wiki-a-guidance-for-internal-non-css.md | 适用: 未标注

### 排查步骤
Primary method of engagement with the Purview community. Teams channel daily monitored by the PG, fast response rate, great for any general Purview questions.
Link: https://teams.microsoft.com/l/channel/19%3a55a61c23d3074b57a080dd4c44c9dcf5%40thread.tacv2/General?groupId=3cd47d55-5a9c-49c8-a74c-c9962366b752

`[来源: ado-wiki-a-guidance-for-internal-non-css.md]`

---

## Scenario 24: Purview AVA
> 来源: ado-wiki-a-guidance-for-internal-non-css.md | 适用: 未标注

### 排查步骤
Channel used internally to discuss Purview troubleshooting and issues. Substitutes ICMs. Only when you can provide proper evidence and description. Not for simple advisory questions.

`[来源: ado-wiki-a-guidance-for-internal-non-css.md]`

---

## Scenario 25: Purview customer support
> 来源: ado-wiki-a-guidance-for-internal-non-css.md | 适用: 未标注

### 排查步骤
Third option: raise a normal support ticket for CSS. Long backlog, avoid except for complex questions. Recommend reaching supportability team first.

`[来源: ado-wiki-a-guidance-for-internal-non-css.md]`

---

## Scenario 26: NOTICE: FR Tracker Tool access
> 来源: ado-wiki-a-handling-feature-requests.md | 适用: 未标注

### 排查步骤
1) After Creating a "New Feature Request" post in the Purview Teams Channel for Feature Requests
2) Then email Purview EEEs with a request for a tracking code. Please allow 24 hours for a response.

`[来源: ado-wiki-a-handling-feature-requests.md]`

---

## Scenario 27: What Qualifies as a Feature Request
> 来源: ado-wiki-a-handling-feature-requests.md | 适用: 未标注

### 排查步骤
Scenario: a specific support ticket is summarized by the customer ask, or requirement, of a product limitation to be lifted; or of a specific new feature (data source, functionality, improvement, etc.) to be added to Purview. Distinguish from GA functionality not working as described (which should generate bug fix or doc update).

`[来源: ado-wiki-a-handling-feature-requests.md]`

---

## Scenario 28: STEPS
> 来源: ado-wiki-a-handling-feature-requests.md | 适用: 未标注

### 排查步骤
1. Confirm Feature Request
2. Create Discussion in Teams Feature Request Channel
3. Email EEEs with the link to the Feature Request and ask for a tracking code.

`[来源: ado-wiki-a-handling-feature-requests.md]`

---

## Scenario 29: Case Notes Template
> 来源: ado-wiki-a-handling-feature-requests.md | 适用: 未标注

### 排查步骤
[DATE] FEATURE REQUEST
1. Confirmed Valid Feature Request: [DETAILS]
2. Created Discussion in Teams Feature Request Channel [AVA LINK]
3. Updated Internal Title with Feature Tracker ID
4. Sent customer email with Feature Request Tracking ID

`[来源: ado-wiki-a-handling-feature-requests.md]`

---

## Scenario 30: Goal of Customer Engagement
> 来源: ado-wiki-a-handling-feature-requests.md | 适用: 未标注

### 排查步骤
- Our joint interest in Purview coverage of customer needs
- We maintain an internal database of feature requests and customer requirements
- Customer feedback guides development plan
- Development plan maximizes ratio new features / customers affected
- No ETA available on-demand for individual requirements
- For features under Preview, development is ongoing. OK to ping PG for ETA.

`[来源: ado-wiki-a-handling-feature-requests.md]`

---

## Scenario 31: Feature Tracker Communication (no ETA)
> 来源: ado-wiki-a-handling-feature-requests.md | 适用: 未标注

### 排查步骤
Hi [CUSTOMER],

As requested, the feature request using the tracker has been created for your case [CASE NUMBER]. The Feature Request number is [FEATURE TRACKING ID]. When you would like to check back regarding the status, please provide the support engineer the Feature Request Tracking ID.

Public feedback forum: https://feedback.azure.com/d365community/forum/82d7bddb-fb24-ec11-b6e6-000d3a4f07b8

Can we agree to archive this case for now with the understanding that you may contact the Microsoft Support Team at anytime to reopen or open a new case?

`[来源: ado-wiki-a-handling-feature-requests.md]`

---

## Scenario 32: ICM Process
> 来源: ado-wiki-a-icm-process.md | 适用: 未标注

### 排查步骤
Authors: Tiffany Fischer, Yvonne Zhang

`[来源: ado-wiki-a-icm-process.md]`

---

## Scenario 33: Always use ASC to escalate ICMs to PG
> 来源: ado-wiki-a-icm-process.md | 适用: 未标注

### 排查步骤
If you cannot find a template for Purview:
1. Use the Empty Template
2. Type "Security Platform" as the Service
3. Select the Purview Team under the Field "Team"
4. Select the appropriate team based on [Product Mapping](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/1214463/-Updated-Mapping-for-Purview-Components-at-ICM)

`[来源: ado-wiki-a-icm-process.md]`

---

## Scenario 34: Gather Basics
> 来源: ado-wiki-a-icm-process.md | 适用: 未标注

### 排查步骤
Before escalating, collect:
- Always include the AVA link related to the DFM case
- Follow TSG: [Logs for Escalation](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912731/Logs-Required-for-Escalation-General)
- For billing related: follow [Look Up Billing Charges](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912980/Look-Up-Billing-Charges)

`[来源: ado-wiki-a-icm-process.md]`

---

## Scenario 35: ICM Title Format
> 来源: ado-wiki-a-icm-process.md | 适用: 未标注

### 排查步骤
**Consistent title format**: `[CSS SEV A/B/C] [Premier/ARR] [Cx Name] - Short Description - Case Number`

- Do NOT modify or replace the `[CSS SEV x]` tag in the title
- APPEND additional tags like "CSAT Impacting" to the title
- Open the ICM and verify "Incident Type" is marked as "Customer Reported"
- For "IcM Owning Team = Purview Data Governance": add `[Region]` to the title

`[来源: ado-wiki-a-icm-process.md]`

---

## Scenario 36: ICM Severity Levels
> 来源: ado-wiki-a-icm-process.md | 适用: 未标注

### 排查步骤
| Severity | Reason | Required Approval |
|----------|--------|-------------------|
| 1 | Complete outage of an entire region | TA/Manager/EEE/PG |
| 2 | Impacting multiple customers, massive costs, block for massive users, no workaround | TA/Manager |
| 3 | Standard customer issue | SME recommended |
| 4 | Low impact / feature request | None |

Use appropriate [ICM Templates](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912729/IcM-Templates)

`[来源: ado-wiki-a-icm-process.md]`

---

## Scenario 37: IcM Terminology
> 来源: ado-wiki-a-icm-terminology.md | 适用: 未标注

### 排查步骤
IcM is the one Incident Management System for all of Microsoft Services. With high availability, national cloud support and cloud based access, IcM supports Azure and many other services across Microsoft.

`[来源: ado-wiki-a-icm-terminology.md]`

---

## Scenario 38: Acronyms
> 来源: ado-wiki-a-icm-terminology.md | 适用: 未标注

### 排查步骤
| Acronym | Full Name | Description |
|---------|-----------|-------------|
| IcM | Incident Management System | Much like Service Desk |
| CRI | Customer-Reported Incident | Much like CSS Service Requests |
| LSI | Live Site Incident | Indicates degradation of a service rather than a specific customer. Often reported by internal monitoring, can be triggered by influx of CRIs |
| WASU | Windows Azure Support | Team managing Severity 2 CRIs, focused on customer-reported incidents |
| WALS | Windows Azure Live Site | Team monitoring alerting across the platform and managing LSI responses (Sev 2 or higher) |
| ASC | Azure Support Center | |
| RCA | Root Cause Analysis | |

Note: **IcM and CRI are often used interchangeably**.

`[来源: ado-wiki-a-icm-terminology.md]`

---

## Scenario 39: After you remove the tag from ICM
> 来源: ado-wiki-a-icm-waiting-customer-or-css.md | 适用: 未标注

### 排查步骤
* ### If ICM is still in engineering ICM team
  * If you are actively working on the issue with a specific engineer, make sure the ICM is assigned/re-assigned to that owner
  * If you are not actively working with someone, make sure the ICM is not assigned to anybody
  * or escalate to EEE/CSS escalation team to find the next proper action for that ICM

If you need help please reach out to EEEs ([azurepurvieweees](mailto:azurepurvieweees@microsoft.com))

`[来源: ado-wiki-a-icm-waiting-customer-or-css.md]`

---

## Scenario 40: Logs Required for Escalation - 3P Data Source Scan
> 来源: ado-wiki-a-logs-required-for-escalation-3p-data-source-scan.md | 适用: 未标注

### 排查步骤
Please collect troubleshooting package and share when you raise AVA/ICM for scanning issue related to 3P data resources.

`[来源: ado-wiki-a-logs-required-for-escalation-3p-data-source-scan.md]`

---

## Scenario 41: Applicable Scenario
> 来源: ado-wiki-a-logs-required-for-escalation-3p-data-source-scan.md | 适用: 未标注

### 排查步骤
- Scan for 3rd party sources
- Scan via SHIR

`[来源: ado-wiki-a-logs-required-for-escalation-3p-data-source-scan.md]`

---

## Scenario 42: 3P Data Resources List
> 来源: ado-wiki-a-logs-required-for-escalation-3p-data-source-scan.md | 适用: 未标注

### 排查步骤
- Big Query
- Cassandra
- PostgreSQL
- MongoDB
- SAP HANA
- Erwin
- SAP S4HANA
- Hive
- Databricks
- SAP ECC
- Oracle
- Salesforce
- SAP BW
- Looker
- MySQL
- Snowflake
- DB2
- Teradata
- Redshift (private preview)
- Tableau (private preview)

`[来源: ado-wiki-a-logs-required-for-escalation-3p-data-source-scan.md]`

---

## Scenario 43: Steps to Generate Troubleshooting Package
> 来源: ado-wiki-a-logs-required-for-escalation-3p-data-source-scan.md | 适用: 未标注

### 排查步骤
Follow the steps in: [3P Data Sources - How to generate trouble shooting package](https://msdata.visualstudio.com/Babylon/_git/EngineeringHub?path=/TSGs/troubleshooting/Connector/3P%20Data%20Sources%20-%20How%20to%20generate%20trouble%20shooting%20package.md&_a=preview)

`[来源: ado-wiki-a-logs-required-for-escalation-3p-data-source-scan.md]`

---

## Scenario 44: Note to CSS
> 来源: ado-wiki-a-mapping-purview-components-icm.md | 适用: 未标注

### 排查步骤
AVA configuration is ongoing and some teams are not properly configured yet. Please reach your local EEE for help.

Copilot for DFM can be used to help find EM and PM for escalations.

`[来源: ado-wiki-a-mapping-purview-components-icm.md]`

---

## Scenario 45: Classic Data Governance Experience
> 来源: ado-wiki-a-mapping-purview-components-icm.md | 适用: 未标注

### 排查步骤
| Purview Team Map | IcM Owning Team | Component | PM | EM |
|---|---|---|---|---|
| Platform - Data Map | Security Platform Data Map\Data Map | Asset Updates, Assets Not Found, Duplicate Assets, Orphaned Assets, Lineage, Search, SDK/API in DataMap | | Sudheer |
| Platform - Ingestion | Purview Data Map\Data Map | Ingestion | pragyarathi | Sudheer Kumar |
| Platform - Integration Runtime | Kubernetes Runtime / WorkloadInfra | K8s SHIR, VNET IR V2, AWS IR, Managed PE and VNet | pragyarathi | hapal |
| Platform - Atlas Classification | Security Platform (Purview)/Classification | Custom Classifications (deprecated, use SITs) | vlrodrig | vimitta/subrahmanyam |
| Apps - Share | Azure Data Share | Data Share | sidontha | faisalaltell |
| Platform - Provisioning | MSG Tenant Provisioning | ADF/Synapse Lineage, Account Provisioning, Private Endpoint/VNET, Unified Portal quota | | Prateek Jain |
| Platform - Authorization | Sentinel Graph Gateway/Authorization | Collections, Access Control/RBAC, Unified Portal Domain | Sujith Narayanan / Amy Dang | Sharmadha Moorthy |
| Platform - Offline Tier | Security Platform (Purview)/Offline Tier | Resource Sets, Path Normalization, Deleted items | sidontha | nayenama |
| Platform - Labeling | Security Platform (Purview)/Analytics | Sensitivity Labeling | tothemel | piyug |
| Apps - Insights | Data Governance/Insights | Map & Discover, Classification/Labeling Reports, Data Estate Insights | mannan | dlacy/dubhatt |

`[来源: ado-wiki-a-mapping-purview-components-icm.md]`

---

## Scenario 46: Data Security & Data Governance
> 来源: ado-wiki-a-mapping-purview-components-icm.md | 适用: 未标注

### 排查步骤
| Purview Team Map | IcM Owning Team | Component | PM | EM |
|---|---|---|---|---|
| Apps - Data Quality | Purview Data Governance/Data Quality | Data Quality | mannan | dlacy |
| Apps - Discovery/Search | Purview Data Governance/Data Catalog/Management | Discovery, Understanding | sidontha | dlacy |
| Apps - Curation | Purview Data Governance/Data Catalog/Management | Biz Domains, Data Products, Glossary, OKRs, CDEs | sidontha/nayenama | dlacy |
| Apps - MDM | Purview Data Governance/Data Catalog/Management | MDM via 3p plugins | mannan | dlacy |
| Apps - Data Access | Purview Data Governance/Data Catalog/Management | Access | sidontha | dlacy |
| Apps - DEH | Purview Data Governance/Data Estate Health | DEH, Lineage | mannan | dlacy |
| Apps - Roles & Permissions | | Roles, Permissions | nidought | dlacy |
| Apps - AI & Copilot | | Copilot, AI | jife | dlacy |
| Apps - Policy | Purview/Policy sync | Data Policy, Self-Service Access, DevOps policies | Huong | |

`[来源: ado-wiki-a-mapping-purview-components-icm.md]`

---

## Scenario 47: New Squad Structure
> 来源: ado-wiki-a-mapping-purview-components-icm.md | 适用: 未标注

### 排查步骤
| Squad | ICM Queue | EM | PM |
|---|---|---|---|
| Catalog and Search | Purview Data Governance/Data Catalog/Management | Naga Krishna Yenamandra | Sita Dontharaju |
| Growth, Access, SRE, QA | Purview Data Governance/Data Estate Health + Insights + Data Access | Darren Lacy | Shafiq Mannan |
| Data Quality and UX | Security Platform UX + Purview Data Governance/Data Quality | Shibnath Mukherjee | Pragya Rathi |
| Connectors | Security Platform Data Scan + Data Sources | Nitin Dubey | Chinmaya Gupta |
| DataMap | Purview DataMap/Data Map | Sudheer Kumar | Blesson John |

`[来源: ado-wiki-a-mapping-purview-components-icm.md]`

---

## Scenario 48: Workflow
> 来源: ado-wiki-a-rca-escalation-process.md | 适用: 未标注

### 排查步骤
This process covers how CSS should escalate RCA requests with engineering.
![RCA-Escalation.png](/.attachments/RCA-Escalation-62599c82-8635-4065-a081-d31008d7bfd4.png)
> Chart representing a detailed workflow for the RCA (Root Cause Analysis) escalation process:
> 
> 1. **Case Submission**: The process starts with the submission of a case.
> 2. **Service Request**: The case is translated into a service request.
> 3. **RCA Requested**: Decision pointif RCA is needed (Y for Yes), the process proceeds; if not (N for No), the engineer resolves the issue and closes the service request.
> 4. **ICM (New/Existing) - ASC**: If RCA is needed, it moves to ICM (Incident and Change Management).
>    - New ICM is opened for RCA only.
>    - Existing ICM transforms from Break/Fix to RCA after mitigation.
>    - PG (Program Group) engagement may be required for a deeper RCA.
>    - Engineer sets the "RCA Needed" field to Yes, starting a countdown to deliver RCA in less than 5 days.
> 5. **Engineer sets [RCA Needed] flag in ICM**: Engineer marks RCA requirement in the system.
> 6. **PG tracks and provides RCA**: The Program Group monitors and provides the root cause analysis.
>    - PG reviews CRI (Customer Reported Issues) with RCA requests during live site meetings.
>    - EEE (Escalation Engineering Experts) can provide RCA if capable.
>    - PS (Product Support) leverages CRI Dashboard from CXP (Customer Experience and Platforms) or SQL MI (Managed Instance) dashboards.
> 7. **CSS Deliver RCA to Customer**: The provided RCA is then communicated to the customer.
>    - RCA is recorded in the Root Cause Field.
>    - EEE reviews to ensure the customer readiness.
> 8. **Close Service Request**: Final step involves closing the service request.
> 
> Additional Notes:
> - If the issue is resolved by the engineer at the RCA Requested stage (N decision), the service request is closed without proceeding to deeper RCA steps as specified on the right side of the


**Note to CSS**: Please feel free to get further clarity from the TA/SME/EEE in case if you are unclear with the provided RCA before delivering to the Customer.

**When to use this RCA process?**
This process should be used ONLY when one or more of the below conditions is true.

 - ASC Insight not generated OR generated without customer-ready content (CRC) and No TSG available.
- Customer requesting for detailed RCA after providing resolution to the Customer or initial cause of the issue.
- Active Incident turn into RCA Request and incident requires engineering expertise to root cause.

If one or more of the above conditions is true, engage engineering for RCA thru ASC (Escalate Ticket) following the steps below.

**How to Create/Update RCA Incident**
- When creating ICM from ASC follow the template and make sure to include Issue StartTime and EndTime of issue occurrence and share the findings from the ASC/TSG Analysis (for new RCA requests) to the summary section.

- Submit ICM from ASC.

- Open the ICM created (https://portal.microsofticm.com/imp/v3/incidents/details/your_icm# ) to update custom field [RCA Needed] as shown below. It is critical to set this column to [Yes] for engineering to qualify the incident for root cause analysis.

![RCA-Escalation-IcM-Image.png](/.attachments/RCA-Escalation-IcM-Image-8c28000f-929c-4f09-8bfe-f2745fc37a8b.png)
> Screenshot displaying an incident management portal, specifically from a Microsoft service (https://portal.microsofticm.com). The page is focused on the incident details for the service category Azure. The user interface includes a navigation bar with options such as Dashboard, Incidents, Outages, On Call Lists, Reporting, Automation, and Administration. The highlighted section shows custom fields for recording incident details such as "Ops Team Effort," "Alert Name," and whether "RCA Needed" (Root Cause Analysis) is set to "Yes." There are action buttons for saving, resetting, and acknowledging the incident.


Note - the above step to set [RCA Needed] is also required for break/fix incidents that turns into RCA request after mitigation.

By default [RCA Needed] column will hold the default value as [No] when ICM created from ASC.

FYI - (We have a feature request pending with ASC team to integrate [RCA Needed] column directly into ASC. Upon rollout the above step will be revised to set [RCA Needed] flag directly in ASC)

##**Tracking RCA incidents**
- Engineering /CSS will be able to track the RCA Incidents status using [RCA Needed] custom column.
- Time to RCA is measured as the delta between the latter of [ICM mitigated time, time when [RCA Needed] is set to Yes] and the time when the Root Cause section is populated
- Backlogs of RCAs will be managed /reviewed by Engineering during live site meetings.
- Tracking thru P360 and PBI Dashboard will be enabled in a later phase.

##**Severity guidelines**

- New RCA requests should open as a Severity 3 or 4 ONLY (including ARR/Pulse). RCA do not qualify for Sev2 and this is applicable for all support plans.
- RCA requests for ARR customers should include [ARR Customer] to the title. This will help engineering team to work on these requests at a higher priority over other RCA requests.
- When an active Sev-2 turns into a RCA (self healed or mitigated and waiting for RCA), please ensure to lower the severity to continue working with engineering on RCA request.
- FYI - in most cases, when Sev-2 is mitigated and pending for RCA, the status will be updated from Active to Mitigated by PG.

##**SLAs / Delays**
- We do not have an service level agreement with engineering for RCA delivery request.
- Due to the nature and complexity of the issue, the duration required for identifying root cause will vary and makes harder to set SLA.
- However, idle RCA incidents over 72 hours and/or issue occurred timeframe is close to rollover (data retention period) which ever is closer, then follow-up with engineering and/or loop the associated EEE engineers to the communication.
- Follow CSAT Impacting process, when RCA pending with extended delay and/or customer unhappy with the delay to expedite.
- **Exceptions** - Complexity of the issue influence RCA delays which can take extremely long to determine the cause. Also, the increase in volumes and engineering bandwidth can force delays at times.

##**RCA Delivery**

- PG will check for [RCA Needed] column RCA ICMs to deliver the root cause.
- RCA by PG should be delivered only in the Root cause section of the ICM and not in the discussion tab or other places. Sample icm w/RCA updated

![RCA-Escalation-IcM-Image2.png](/.attachments/RCA-Escalation-IcM-Image2-b5f4cb50-d56c-4a26-b15e-473e08c81441.png)
> Screenshot displaying the "Root Cause" section of a workflow within an RCA escalation process. It includes information such as the number of incidents linked to the root cause, the root cause title, category, and subcategory. There is a text box for root cause details, and options to link or unlink related incidents. A notification highlights that changes to the root cause will be reflected in all linked incidents. The "Repair Items" section is partially visible below.


- If RCA is no longer needed, set the RCA Needed field to No under Custom Fields for Service Category Azure.
- If for any reason (pure customer error or ICM creator misunderstanding), unable to provide an RCA, use Root Cause Category as "Unable to determine" and provide a reason in the "Root Cause Details" as shown below:

![RCA-Escalation-IcM-Image3.png](/.attachments/RCA-Escalation-IcM-Image3-a9e5eb31-3fd7-402e-8ddd-e898a2d46aea.png)
> Screenshot displaying the 'Root Cause' input form within an RCA Escalation Process. The form features fields for 'Root Cause Title', 'Root Cause Category' (highlighted in yellow and marked as 'Unable to Determine'), 'Root Cause Subcategory', and 'Root Cause Details'. Additionally, there is a 'Repair Items' section and a warning message that instructs users not to enter personally identifiable information (PII), accompanied by a link to learn more about PII.


##**Some other follow up questions:**

 - If an ICM is opened only for an RCA, the case should stay in the Active state and RCA needed should be set to RCA Needed asap, correct? In that case, the ICM is mitigated when the RCA is provided, so the RCA time is essentially zero, right?

   -   When RCA Needed Flag is checked, the clock starts ticking irrespective of the state.  When an RCA is delivered in the Root cause section then the  RCA clock stops.
If the ICM is opened for a technical issue and the customer knows they also want an RCA, support can open the case w/RCA Needed = Yes, but then the RCA timer doesnt start until the case is mitigated and the timer stops when the RCA field is populated, correct?

- When RCA Needed flag is set to [Yes] before Mitigation,    RCA Start time will choose the  latest, and in this case -  Mitigated time
   - (Mitigated time will be greater than the RCA request status  (RCANeeded=Yes)  change time.  

  - And if  RCA needed set to [Yes ] by the engineer after ICM is mitigated, then the same logic will be applied.  In this case, RCA needed =Yes will be treated as start time, which is the latest.

- ICM has been marked Mitigated without providing the RCA. What should I do?
    - If an ICM has been marked Mitigated without providing the RCA, engineers will keep the ICM in the mitigated state and follow-up with the Icm owner and involve EEEs. If still no response on the follow-up, engineers will reactivate the Icm so that RCA can be added by the PG.

`[来源: ado-wiki-a-rca-escalation-process.md]`

---

## Scenario 49: Supportability for Restricted CRIs (rCRI)
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
Restricted CRI (rCRI) is the communication channel between delivery and product teams for escalating incidents. rCRI restricts visibility and access to support data to only those necessary for resolving the incident.

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 50: Key Features
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
1. **Access Control List (ACL)**: Only authorized employees can access the incident
2. **Just-In-Time (JIT) Access**: Access granted only when necessary and for limited time
3. **Compliance**: Helps Microsoft comply with data handling commitments

> **rCRI cannot be used for managing Outages.**

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 51: Via ASC (Recommended)
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
Use Azure Support Center (ASC EU or ASC WW) to escalate as ICM of type RCRI.

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 52: Via IcM Portal (Fallback)
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
Only if ASC is down. Select incident type as Restricted CRI in IcM portal.

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 53: ACL Behavior
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
| Action | ACL Behavior |
|---|---|
| Incident creation | Creator + assigned IcM team added to ACL |
| Incident transfer | Target IcM team added to ACL |
| Request Assistance acknowledgment | Acknowledger added to ACL |
| Auto-invite acknowledgment | Acknowledger added to ACL |

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 54: ACL Roles
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
| Role | Permission |
|---|---|
| Reader | Read incident contents |
| Contributor | Modify incident |
| Owner | Change ACL members |

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 55: Requesting Access
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
When opening an incident not on your ACL, a dialog allows you to request access. Requests go to the owning IcM Team's Distribution List (NOT to ACL owners).

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 56: Auto Invite Rules
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
Service admins can configure Auto Invite rules in Tenant Manager > Manage Services > Auto Invite Management tab.

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 57: Databases
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
1. **IcMDataWarehouse** - Redacted data
2. **IcMDataWarehouseRestricted** - Unredacted data (requires Kusto Restricted View)

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 58: Identifying Restricted Incidents
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
| Column | Description |
|---|---|
| IsRestricted | Incident is Restricted |
| IsCustomerSupportEngagement | Incident is a Restricted CRI |

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 59: Redacted Fields
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
**Incidents/IncidentHistory**: CommsMgrEngagement*, Component, CustomerName, ImpactedScenarios, Keywords, Summary, Tags, TsgId, TsgOutput
**IncidentDescriptions**: Text
**PostIncidentReports**: Title, all Impact/Description fields, PublicSummary/RootCause/NextSteps

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 60: Getting Unredacted Access
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
Request a Kusto Restricted View via [ADO task template](https://msazure.visualstudio.com/One/_workitems/create/Task?templateId=85de9f72-977a-454b-a32f-268fb730a584).

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 61: Known Issues
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
1. **EU DfM + WW ICM**: Cross-boundary access fails for transferred case owners (bugs 35507191, 35507130)
2. **New Case Owner / JIT**: Log out and back into ICM portal to force access refresh
3. **Multiple Cases**: Design limitation - 1:1 relationship only between rCRI and DFM case
4. **ASC with TSE/MID/AME**: UPN format bug prevents ACL addition (bugs 35715517, 35743502). Ask EEE to add explicitly.
5. **Impact Assessment**: Close and reopen browser tab to see newly linked cases

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 62: Training Resources
> 来源: ado-wiki-a-supportability-restricted-cris.md | 适用: 未标注

### 排查步骤
- [Fabric CSS Training Sessions](https://microsoftapc.sharepoint.com/:f:/t/CSSTridentReadinessLibrary/EuXpHU4OmSFFtcz5Ql1V9coBXtu15iXOE-_SrWiyNEVhLw)
- [Restricted CRI Onboarding](https://eng.ms/docs/products/icm/workflows/incidents/rcri/rcri_onboarding)
- [Kusto Access and Reporting](https://eng.ms/docs/products/icm/reporting/kusto-ri)

`[来源: ado-wiki-a-supportability-restricted-cris.md]`

---

## Scenario 63: Teams Sharing Dos and Donts
> 来源: ado-wiki-a-teams-sharing-dos-and-donts.md | 适用: 未标注

### 排查步骤
Author: Gustavo Garibay Covarrubias

`[来源: ado-wiki-a-teams-sharing-dos-and-donts.md]`

---

## Scenario 64: OVERVIEW
> 来源: ado-wiki-a-teams-sharing-dos-and-donts.md | 适用: 未标注

### 排查步骤
Why are we covering Teams screen sharing sessions best practices? The overarching process we follow, DDX standard process, has made some updates on standard protocol we need to be in compliance of.

This helps protect customer data from Microsoft's end and does not keep us liable if we follow this procedure. If guidelines are not followed, customer data or Microsoft confidential data may be accidentally shared with unauthorized users, causing a data loss or a privacy incident.

`[来源: ado-wiki-a-teams-sharing-dos-and-donts.md]`

---

## Scenario 65: Before The Customer Call
> 来源: ado-wiki-a-teams-sharing-dos-and-donts.md | 适用: 未标注

### 排查步骤
Email your customer to explain that on the scheduled meeting:

1. The call cannot be recorded.
2. You cannot take screenshots.
3. The customer can take screenshots but cannot post them on the Teams chat. They must either:
   - a.) attach it directly to the ticket or
   - b.) email it to the Microsoft Support Ticket
4. You cannot take remote device control on the screen sharing session, you can assist through verbal navigation. You cannot give remote device control of a Microsoft environment.
5. You cannot share your own screen during the call.

You can inform the customer that if they would like to record the meeting, they are at liberty to schedule their own call in their own tenant and invite you to that call as a guest.

`[来源: ado-wiki-a-teams-sharing-dos-and-donts.md]`

---

## Scenario 66: During the Customer Call
> 来源: ado-wiki-a-teams-sharing-dos-and-donts.md | 适用: 未标注

### 排查步骤
1. The following disclosure text must be pasted into chat at the initiation of every Teams for Support collaboration with a customer that involves screensharing:

> Support from Microsoft
>
> Any information you include in this Teams chat may be retained into the record of your Service Request. Avoid entering any personally identifiable data such as email addresses or sensitive data such as credit card numbers and government IDs.
>
> During screen sharing we may ask you to take screen shots relevant to your service request. Close all windows and documents that may contain personal or sensitive information. View our Privacy Policy.

2. **If screenshots are shared on the Teams Chat**: Teams chat should not be used to share or send any Support Data, and where inadvertently sent, must be deleted by the person who sent the message.

3. Video calls are not supported, please do not turn on your camera during a customer call.
   - **Exception**: Customer has profound hearing loss and relies on lip reading. Video sharing is permitted with written permission in advance.

`[来源: ado-wiki-a-teams-sharing-dos-and-donts.md]`

---

## Scenario 67: FAQ
> 来源: ado-wiki-a-teams-sharing-dos-and-donts.md | 适用: 未标注

### 排查步骤
1. **What should I do if I find Support Data in Teams?**
   - If you are the message owner, remove the message immediately, or ask the message owner to remove it.
   - If a customer shares Support Data, ask the customer to remove the message.
   - If Support Data is stored in an unauthorized location, report to the Incident Response Team (KB 4094950).

`[来源: ado-wiki-a-teams-sharing-dos-and-donts.md]`

---

## Scenario 68: AVA/IcM Escalation Data Collection Guide
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
> Check for Known Issues and try to search keywords in AVA channel before opening a new Ava thread. If it is confirmed the same issue, and we have RCA/Solution already, just deliver the information to cx.

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 69: Portal UI
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Issue Background (Whole Picture, Navigation thread, issue existed before or not) with screenshots
- Tenant ID, Region (note down if part of ongoing outage/bug/known issue)
- Affected user permissions
- The Error message
- Browser Trace (.HAR file)
- Your analysis from the .har file
- Reproduced in your environment or not reproducible
- Clear PG Ask

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 70: Roles and Permissions
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Issue Background (Whole Picture, issue existed before or not) with screenshots
- Affected user permissions
- Browser Trace (.HAR file)
- Your analysis from the .har file
- Reproduced in your environment or not reproducible
- Clear PG Ask

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 71: Data Sources
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Issue Background (Purview Networking, Source Networking, Source Registration Details, Scan Ruleset if not system rules, Issue existed before or not) with screenshots
- If networking is not public, collect their PE configurations.
- Affected user permissions
- The Error message
- Documented comparison of cx scenario with source documentation
- Test-Net Connections and Network Trace Package Capture (if using SHIR, from Machine hosting SHIR)
- Does DNS team need to be involved or not
- Browser Trace (.HAR file)
- Your analysis from the .har file
- Reproduced in your environment or not reproducible
- Clear PG Ask

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 72: Scan/IR
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Issue Background (Purview Networking, Source Networking, Source Registration Details, Scan Ruleset if not system rules, Issue existed before or not). Combine the documentation with their configuration steps and provide screenshots.
- If networking is not public, collect their PE configurations.
- If ongoing Outage/Bug: Tenant ID, Region
- Affected user permissions
- The Error message
- Scan Run ID
- If applicable: SHIR Report ID with troubleshooting package turned on.
- Your analysis from the Scan and Report ID logs
- Reproduced in your environment or not reproducible
- Clear PG Ask

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 73: If Source Configuration Issues (scan fails to connect)
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
See Data Sources Section + capture browser trace and provided analysis on .HAR file.

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 74: If Scan Configuration Issues — compare cx scenario with source documentation
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Authentication Method, its credential permissions
- Integration Runtime Type, its documented steps of set up
- Other details depending on the source being scanned

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 75: If Scan taking too long
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Completion time, assets discovered/ingested, source, scan configuration
- Number of SHIR Nodes & memory (if applicable)
- Other scans running in parallel or shortly after
- Download scan logs if available

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 76: Data Map
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Issue Background (Asset FQN, overview, schema, lineage panes). Combine the documentation with their configuration steps and provide screenshots.
- If ongoing Outage/Bug: Tenant ID, Region
- Affected user permissions
- The Error message
- Browser Trace with your analysis on the .har file
- Reproduced in your environment or not reproducible
- Clear PG Ask

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 77: Schema not captured
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Scan Rule Sets applied if not system rules
- Collect the schema customer expects to see that is present on their original source
- Search logs for the schema and provide those findings

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 78: Lineage not captured
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- From Scan: Check Data lineage user guide
- Is Lineage a supported feature for the data source
- Is it column/attribute level lineage vs asset-level automatic/manual lineage
- Does the lineage exist in sources
- From ADF: Follow ADF connection documentation
- From Synapse: Follow Synapse connection documentation

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 79: Classifications not applied
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Are classifications supported for the data source
- System Classifications or Custom Classifications
- Scan Rule Sets applied if not system rules
- Did cx abide by the scan rule logic (schema or keyword correlation + 8 distinct values minimum)

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 80: Sensitivity Labels not applied
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Are sensitivity labels supported for the data source

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 81: Assets not being ingested
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Do they form part of a Resource Set
- Has 24 hours elapsed from last successful scan
- Search logs for the asset name

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 82: Assets not updated
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Check asset scan breadcrumbs, compare scan config to the source
- Does asset still exist in the original data source
- Check if Asset has been moved prior to scan

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 83: Domains (Roles and Permissions)
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Permissions to create/manage Domains, Data Products, CDEs, access reviews
- Browser trace + HAR analysis
- Clear PG Ask

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 84: Data Products
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Permissions to create/manage Domains, Data Products, data access requests
- If unable to manage Assets: permissions, error, browser trace, check "Dependencies" documentation
- Clear PG Ask

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 85: Glossary Terms and OKRs
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Issue with adding/removing, importing/exporting, managing term policies
- Related terms or CDEs, OKR management
- Browser trace + HAR analysis
- Clear PG Ask

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 86: Data Quality and Data Profiling
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Source Connection config, Purview Permissions, DQ Scan/Profiling Job config, Rules
- Error message of Failed Profiling Job/Data Quality Scan
- What are they scanning/profiling? Are these supported? FQN and asset type
- Ensure DQ Troubleshooting public documentation was investigated
- Clear PG Ask

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 87: Schema blank or columns missing
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Was the schema imported from the DQ page? Was this refreshed?
- Was the column name changed? Rules use the column name as the key

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 88: DEH Reports and Insights
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Controls, Reports in DQ Page, Actions, or Reports
- Classic Reports Type or Data Governance Report Type
- Self-Serve Analytics permissions
- Browser trace + HAR analysis
- Clear PG Ask

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 89: Workflow
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Granting access to DPs or publishing DPs/Glossary terms
- Required permissions, documented limitations
- Browser trace + HAR analysis

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 90: Azure Audit
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Scope: compliance auditing vs Azure Audit Logs
- Audit enabled? Event hub enabled? Required permissions?
- Verify logged items within supported Azure Audit Logs list

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 91: API
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Which API, purpose, documentation compliance
- Response/payload, script, certificate/token expiry, reproducibility

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 92: Billing
> 来源: ado-wiki-ava-process-escalation-data-collection.md | 适用: 未标注

### 排查步骤
- Which feature causing billing concern, amount charged, business impact
- Identify billing meter
- Verify charges vs historical through Billing Logs

`[来源: ado-wiki-ava-process-escalation-data-collection.md]`

---

## Scenario 93: Escalation Flow
> 来源: ado-wiki-b-ICM-Quality-Step-by-Step-Flow.md | 适用: 未标注

### 排查步骤
1. Collect logs from customer → follow public docs → try Q&A Bot → discuss with TA/SEE
2. If unresolved → create AVA thread with detailed issue description and troubleshooting steps
3. Involve SMEs → if SME acknowledges → SME works on issue; if not → tag regional SME → escalate to PG/EEE
4. Post-investigation → if unresolved → discuss in Triage → open CRI in correct queue

`[来源: ado-wiki-b-ICM-Quality-Step-by-Step-Flow.md]`

---

## Scenario 94: Guidance for Quality
> 来源: ado-wiki-b-ICM-Quality-Step-by-Step-Flow.md | 适用: 未标注

### 排查步骤
- CRI must include latest status and valid logs (refer to Logs Required for Escalation TSG)
- Try to repro in lab before escalating
- Every CRI/AVA should attach ONE issue only
- AVA requests needing PG attention get automatic notifications

`[来源: ado-wiki-b-ICM-Quality-Step-by-Step-Flow.md]`

---

## Scenario 95: Common Quality Issues
> 来源: ado-wiki-b-ICM-Quality-Step-by-Step-Flow.md | 适用: 未标注

### 排查步骤
- Logs missing or expired
- Directly copy-pasting customer questions → paraphrase into technical questions
- Network issues in customer environment → address by CSS SMEs, discuss in triage
- Flag RCA only when actually needed

`[来源: ado-wiki-b-ICM-Quality-Step-by-Step-Flow.md]`

---

## Scenario 96: FAQ
> 来源: ado-wiki-b-ICM-Quality-Step-by-Step-Flow.md | 适用: 未标注

### 排查步骤
- **PG mitigates ICM when**: fix applied, ICM idle 2+ days, by-design confirmed, workaround provided, work item created
- **Multiple ICMs for same ticket**: only for complex issues needing multiple PG teams (check with EEE/PG first)
- **Tagging PG directly**: first use InvolvePG, then tag directly if no response
- **Case owner as SME raising AVA**: still recommended to check with another SME first
- **Weekend AVA with customer pressure**: indicate Priority/Criticality and Business Impact in Ava, tag PG SMEs (Sev3 has no weekend coverage)
- **Finding right team**: use Mapping for Purview Components TSG, check PG involvement in AVA, or ask EEE in Triage
- **Customer refuses new case for different issue**: open multiple IcMs for same case but one issue per ICM
- **Expected PG response time in AVA**: SLA is 48 hours, auto-notification after 24 hours idle

`[来源: ado-wiki-b-ICM-Quality-Step-by-Step-Flow.md]`

---

## Scenario 97: SME & EEE Contacts by Region
> 来源: ado-wiki-b-ICM-Quality-Step-by-Step-Flow.md | 适用: 未标注

### 排查步骤
| Region | AVA SMEs | EEEs |
|--------|----------|------|
| EMEA | carlossilva, yazanabusair, mlezanska | pemar, v-sahilgupta |
| AMER | tifische, tgrenell | vimals |
| APGC & India | yuzhang4 | rongli |

`[来源: ado-wiki-b-ICM-Quality-Step-by-Step-Flow.md]`

---

## Scenario 98: Azure Support Center (ASC) for Purview
> 来源: ado-wiki-b-azure-support-center-asc.md | 适用: 未标注

### 排查步骤
In the initial phase of public preview, we have basic integration with ASC. We display the provisioning information, Scan run details and permissions and access control on the Purview account.

**We have submitted our first batch of ASC Insights request to the Purview Service Engineering team which is expected to speed up a lot of our troubleshooting process.**
Details here:

- [Scan Insights](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Azure%20Purview/444472/Scan-Insights)
- [Assets and Classification Insights](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Azure%20Purview/444473/Classification-Insights)
- Lineage Insights  //TODO
- [Exception Insights](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Azure%20Purview/444474/Exception-Insights)

`[来源: ado-wiki-b-azure-support-center-asc.md]`

---

## Scenario 99: Provisioning
> 来源: ado-wiki-b-azure-support-center-asc.md | 适用: 未标注

### 排查步骤
ASC displays the top failed provisioning errors and the status of successful provisions. Useful while debugging Account creation errors.

`[来源: ado-wiki-b-azure-support-center-asc.md]`

---

## Scenario 100: Scan
> 来源: ado-wiki-b-azure-support-center-asc.md | 适用: 未标注

### 排查步骤
Input the Scan Run Id and ASC displays useful information about the Scan run like status, assets discovered, assets classified, any errors during scan run and so on.

`[来源: ado-wiki-b-azure-support-center-asc.md]`

---

## Scenario 101: Access Control
> 来源: ado-wiki-b-azure-support-center-asc.md | 适用: 未标注

### 排查步骤
Displays the MSIs and users added to the Purview account and what roles they have. Useful while debugging Access control and permission issues.

Please make sure you use ASC as your first point of investigation and always use ASC to escalate tickets to the Product team (IcMs) using the appropriate template.

Demo on ASC Capabilities:

Babylon Troubleshooting Session 2: Babylon ASC Integration for Public Preview - https://msit.microsoftstream.com/video/425da1ff-0400-b9eb-22e1-f1eb3424f8c0

`[来源: ado-wiki-b-azure-support-center-asc.md]`

---

## Scenario 102: Verify Before Closure
> 来源: ado-wiki-b-duplicate-case-best-practices.md | 适用: 未标注

### 排查步骤
Compliance V-Team identified cases incorrectly closed as Duplicate — should have been closed as customer unresponsive.

`[来源: ado-wiki-b-duplicate-case-best-practices.md]`

---

## Scenario 103: Un-Resolved Status
> 来源: ado-wiki-b-duplicate-case-best-practices.md | 适用: 未标注

### 排查步骤
A case can be "Resolved" (closed) with "Un-Resolved" status when:
- Solution provided but customer doesn't agree
- Customer rejected solution but approved closure
- Customer choosing to discontinue case
- Customer is unresponsive

`[来源: ado-wiki-b-duplicate-case-best-practices.md]`

---

## Scenario 104: Why Customers Open Duplicates
> 来源: ado-wiki-b-duplicate-case-best-practices.md | 适用: 未标注

### 排查步骤
- New case with similar (not identical) info to existing case
- Intended to update existing case but opened new ticket
- Two people from same org opened tickets for same issue
- Contract expired, new ticket required

`[来源: ado-wiki-b-duplicate-case-best-practices.md]`

---

## Scenario 105: Duplicate Case Closure Process
> 来源: ado-wiki-b-duplicate-case-best-practices.md | 适用: 未标注

### 排查步骤
1. Request confirmation from Customer/CSAM/IM+ that it's a duplicate
2. Include closing script: "As agreed, we have associated this case with your original support request <case number>..."
3. Confirm with customer (use soft skills)
4. Add case note recording status, approvals, and active case number
5. Update original case notes with any new info from duplicate case

**Important**: Every SE must confirm customer understands why case is being closed. Incorrect duplicate identification leads to poor customer experience.

`[来源: ado-wiki-b-duplicate-case-best-practices.md]`

---

## Scenario 106: Purview Governance Support Boundary Matrix
> 来源: ado-wiki-collaboration-support-boundary.md | 适用: 未标注

### 排查步骤
Purview Governance connects to a lot of data sources to obtain asset and lineage information. The following table summarizes the guidelines for collaboration between different CSS teams.

`[来源: ado-wiki-collaboration-support-boundary.md]`

---

## Scenario 107: Queue & Contact
> 来源: ado-wiki-collaboration-support-boundary.md | 适用: 未标注

### 排查步骤
- Azure Purview Support Queue Name: **DnAI - DGP - Data Governance**
- Azure Purview Queue Owner: asmaahmad@microsoft.com
- Azure Purview CSS Team Alias: asma_directs@microsoft.com

`[来源: ado-wiki-collaboration-support-boundary.md]`

---

## Scenario 108: Product Relationship with Purview
> 来源: ado-wiki-collaboration-support-boundary.md | 适用: 未标注

### 排查步骤
| CSS Partners | Overlapping Component | Isolation Method | CSS Partner Queue |
|--|--|--|--|
| Data Factory | SHIR | SHIR setup, registration, start/stop service | |
| Azure SQL DB | Connectivity | | |
| Azure Synapse Analytics | Connectivity | Connect to the SQL pools or SQL ADW instance from outside Purview e.g., Synapse Studio or SSMS. If connection fails outside Purview, involve the Synapse support team. | |
| Storage (Blob, ADLS Gen 1/2) | Storage access, Storage types | Connect to the storage outside Purview using Azure Storage Explorer. If access to the storage fails, engage respective storage support group. | |
| Power BI | | | |
| Security and Compliance Center (SCC) | Sensitivity Labels – Creation/Configuration/Policy issues. Any permission or GUI issues related to the compliance portal | Enterprise – Security Compliance (RAVE) | O365 SCC Global Support (SCCSupport@microsoft.com) |
| Azure Key Vault | Connectivity | | |
| Azure Networking | Private Endpoint | | |
| SQL Server (On prem) | Connectivity | Test the connection to the SQL server using a UDL file. If the connection from UDL file fails, engage SQL connectivity team. If the connection from UDL succeeds, then the issue is either with Purview or SHIR. | MSaaS SQL Networking Tier 1/2 (SQLCONNIS@microsoft.com) |
| All 3rd party connectors | N/A. Support is best effort | Test the connection to the data sources outside of Purview and Azure if possible. If connectivity fails from outside Azure, Customer needs to fix their infra. | |

`[来源: ado-wiki-collaboration-support-boundary.md]`

---

## Scenario 109: Swarm First
> 来源: ado-wiki-collaboration-support-boundary.md | 适用: 未标注

### 排查步骤
Before creating a collaboration, use the swarming channel for VM, Network, and AAD questions.

`[来源: ado-wiki-collaboration-support-boundary.md]`

---

## Scenario 110: Background
> 来源: ado-wiki-get-adf-datascan-activityids.md | 适用: 未标注

### 排查步骤
The number of activities usually start with four. For auto-scaling case, the count will grow to at most 8. In the case where you want to check out the rough vCore during the scan or you want to make sure all activities are running fine. Use below to get information for all activites

`[来源: ado-wiki-get-adf-datascan-activityids.md]`

---

## Scenario 111: Steps
> 来源: ado-wiki-get-adf-datascan-activityids.md | 适用: 未标注

### 排查步骤
- Find starting <PipelineRunId> from scanning service:
  ```
  ScanningLog 
  | where ScanResultId == "<ScanResultId>"
  | where Message contains "ADF Pipeline RunId"
  | project ['time'], Message
  ```

- Find activityIds for initializing/scaling DataScan sub-pipeline activities
  ```
  //cluster("https://adfcus.kusto.windows.net").database("AzureDataFactory").
  cluster("https://adfneu.kusto.windows.net").database("AzureDataFactory"). 
  ActivityRuns 
  | where pipelineRunId == <PipelineRunId> 
  | where activityType == "ExecutePipeline"
  | where activityName =="InitialDataScanExcecutionPipeline" or activityName 
  =="ScalingDataScanExcecutionPipeline"
  | project PreciseTimeStamp, activityName, activityRunId
  // <activityRunId1>, <PreciseTimeStamp1>

  If no record is found above, use below
  //cluster("https://adfcus.kusto.windows.net").database("AzureDataFactory").
  cluster("https://adfneu.kusto.windows.net").database("AzureDataFactory").
  ActivityRuns
  | where pipelineRunId == "31e6e0e7-a04c-49af-a71d-aa5fc8473ed8" //f3482963-f794-4825-96a8-020548de9364 
  | where activityName =="dataScan" 
  | project PreciseTimeStamp, activityName, activityRunId
  If you found activityRunId in this query, then you DO NOT have to go through the steps below and you already have the activityRunId.
  ```

- Find <DataScanPipelineRunId> for each initializing/scaling DataScan sub-pipeline
  ```
  //cluster("https://adfcus.kusto.windows.net").database("AzureDataFactory").
  cluster("https://adfneu.kusto.windows.net").database("AzureDataFactory").
  AdfTraceEvent 
  | where env_time between (<PreciseTimeStamp minus 1m> .. 2m) 
  | where InternalCorrelationId == <activityRunId1> and Message has "pipeline run"
  | project env_time, InternalCorrelationId, Message
  ```

- Find DataScan activity runIds for each DataScan sub-pipeline
  ```
  //cluster("https://adfcus.kusto.windows.net").database("AzureDataFactory").
  cluster("https://adfneu.kusto.windows.net").database("AzureDataFactory").
  ActivityRuns 
  | where pipelineRunId == <DataScanPipelineRunId>
  | where activityName == "dataScan"
  | distinct activityRunId
  | project activityRunId
  ```

`[来源: ado-wiki-get-adf-datascan-activityids.md]`

---

## Scenario 112: Issue
> 来源: ado-wiki-internal-system-error-connectivity-scripts.md | 适用: 未标注

### 排查步骤
Scanning fails with "Internal System Error". This is a generic error — the underlying cause could be many things.

`[来源: ado-wiki-internal-system-error-connectivity-scripts.md]`

---

## Scenario 113: Initial Diagnosis
> 来源: ado-wiki-internal-system-error-connectivity-scripts.md | 适用: 未标注

### 排查步骤
Check ScanningLogs table for underlying error:

```kql
cluster('Babylon').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxxx" //Scan ID
| project PreciseTimeStamp, Type, EventName, ElapsedTimeInMS, ScanResultId, Message, FullException, Uri
```

`[来源: ado-wiki-internal-system-error-connectivity-scripts.md]`

---

## Scenario 114: Checklist
> 来源: ado-wiki-internal-system-error-connectivity-scripts.md | 适用: 未标注

### 排查步骤
1. **SHIR version**: Ensure latest version: https://www.microsoft.com/en-us/download/details.aspx?id=39717. Try uninstall and reinstall (corrupted installations can cause assembly load failures).

2. **VNET/Private Endpoint**: Check known limitations: https://docs.microsoft.com/en-us/azure/purview/catalog-private-link-troubleshoot. Validate SHIR connectivity to source (proxies/firewalls may block).

3. **DNS Name Resolution for PE**: https://docs.microsoft.com/en-us/azure/purview/catalog-private-link-name-resolution

4. **Private endpoint ingestion limits**: Only Azure Blob Storage and ADLS Gen2 support Azure IR with ingestion PE. All other data sources require SHIR.

5. **Public access disabled**: Some configurations do not support Purview having Public access disabled (e.g., Power BI).

`[来源: ado-wiki-internal-system-error-connectivity-scripts.md]`

---

## Scenario 115: 1. The system cannot find the file specified
> 来源: ado-wiki-internal-system-error-connectivity-scripts.md | 适用: 未标注

### 排查步骤
- SHIR logs: `Module atlas-ingestion-write initialize failed` → `System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.DataTransfer.Common.RetryPolicies'`
- **Fix**: Corrupted SHIR. Uninstall and install latest version.

`[来源: ado-wiki-internal-system-error-connectivity-scripts.md]`

---

## Scenario 116: 2. AccountProtectedByPrivateEndpoint
> 来源: ado-wiki-internal-system-error-connectivity-scripts.md | 适用: 未标注

### 排查步骤
- Logs: `403 Forbidden` → `"code":"AccountProtectedByPrivateEndpoint","message":"Not authorized to access account"`
- **Fix**: Use SHIR instead of Azure IR for non-Blob/ADLS sources behind PE.

`[来源: ado-wiki-internal-system-error-connectivity-scripts.md]`

---

## Scenario 117: 3. System.Exception: Forbidden
> 来源: ado-wiki-internal-system-error-connectivity-scripts.md | 适用: 未标注

### 排查步骤
- SHIR logs: `Module atlas-ingestion-write initialize failed: System.Exception: Forbidden`
- GatewayEvent: `403` on `/tokenprovider/tokens/acquire` → `PrivateLink|Access from internet not authorized`
- **Fix**: Validate PE configuration and DNS settings.

`[来源: ado-wiki-internal-system-error-connectivity-scripts.md]`

---

## Scenario 118: Information to Collect from Customer
> 来源: ado-wiki-internal-system-error-connectivity-scripts.md | 适用: 未标注

### 排查步骤
1. SHIR Version
2. Purview Network Configuration
3. Data Source Network Configuration
4. Key Vault Network Configuration
5. Purview Storage Network configuration

`[来源: ado-wiki-internal-system-error-connectivity-scripts.md]`

---

## Scenario 119: From the SHIR VM
> 来源: ado-wiki-internal-system-error-connectivity-scripts.md | 适用: 未标注

### 排查步骤
1. SHIR Report ID (Diagnostic Tab → Send Logs → copy Report ID)
2. `Test-NetConnection -ComputerName web.purview.azure.com -Port 443`
3. `Test-NetConnection -ComputerName [PURVIEWNAME].purview.azure.com -Port 443`
4. `Test-NetConnection -ComputerName [STORAGE].blob.core.windows.net -Port 443`
5. `Test-NetConnection -ComputerName [STORAGE].queue.core.windows.net -Port 443`
6. `Test-NetConnection -ComputerName [KEYVAULT].vault.azure.net -Port 443`
7. `Test-NetConnection -ComputerName [SOURCE] -Port 443`
8. If EventHub: `Test-NetConnection -ComputerName [EVENTHUB].servicebus.windows.net -Port 443`

`[来源: ado-wiki-internal-system-error-connectivity-scripts.md]`

---

## Scenario 120: Comprehensive Proxy Detection Script
> 来源: ado-wiki-internal-system-error-connectivity-scripts.md | 适用: 未标注

### 排查步骤
```powershell
$fqdnList = @("web.purview.azure.com",
    "[PURVIEWNAME].purview.azure.com",
    "[STORAGE].blob.core.windows.net",
    "[STORAGE].queue.core.windows.net",
    "[KEYVAULT].vault.azure.net",
    "[EVENTHUB].servicebus.windows.net",
    "[SOURCE_FQDN]",
    "")
$return = @()
foreach($f in $fqdnList){
    if($f -eq "") { continue }
    $return += "`nProcessing $f `n---------------------------------------------------------------------`n"
    $url = "https://$f"
    $req = [Net.HttpWebRequest]::Create($url)
    $req.Timeout = 1000
    try { $return += "ServicePoint:"; $return += $req.ServicePoint }
    Catch { $return += $_.Exception.Message }
    try { $return += "Web Request:"; $return += $req.GetResponse() }
    Catch { $return += $_.Exception.Message }
    try { $return += "Test NetConnection:"; $return += Test-NetConnection $f -Port 443 }
    Catch { $return += $_.Exception.Message }
    try { $return += "nslookup: "; $return += nslookup $f 2>&1; $return += "ResolveDNS: "; $return += Resolve-DnsName -Name $f }
    Catch { $return += $_.Exception.Message }
    $return | out-file $env:userprofile\Documents\TroubleshootPurview.txt
}
```

`[来源: ado-wiki-internal-system-error-connectivity-scripts.md]`

---

## Scenario 121: Expected Error Responses (successful connection)
> 来源: ado-wiki-internal-system-error-connectivity-scripts.md | 适用: 未标注

### 排查步骤
| FQDN | Expected Error |
|------|---------------|
| `[PURVIEW].purview.azure.com` | 404 Not Found |
| `[STORAGE].blob.core.windows.net` | 400 Bad Request |
| `[KEYVAULT].vault.azure.net` | 403 Forbidden |

**Proxy indicator**: `"Could not establish trust relationship for the SSL/TLS secure channel"` = certificate chain invalid due to proxy.

**Note**: 403 error could also mean authenticated proxy blocking or Azure resource Network config blocking — cannot easily rule out without further investigation.

`[来源: ado-wiki-internal-system-error-connectivity-scripts.md]`

---

## Scenario 122: [Kusto] DataScanAgentEvent Migration to DataScanAgentLinuxEvent
> 来源: ado-wiki-kusto-datascanagent-event-migration.md | 适用: 未标注

### 排查步骤
Due to migration in Purview infra, the Kusto table **DataScanAgentEvent** is being replaced with **DataScanAgentLinuxEvent** for Azure IR troubleshooting.

`[来源: ado-wiki-kusto-datascanagent-event-migration.md]`

---

## Scenario 123: How to Check if K8S Migration Applies
> 来源: ado-wiki-kusto-datascanagent-event-migration.md | 适用: 未标注

### 排查步骤
Run the following query to check if the scan job is running via K8S:

```kql
database("babylonMdsLogs").ScanningLog
| where ScanResultId == "{scanResultID}"
| where Message contains "k8s"
```

- If **no output** → continue using original `DataScanAgentEvent` queries
- If **output found** → use `DataScanAgentLinuxEvent` queries below

`[来源: ado-wiki-kusto-datascanagent-event-migration.md]`

---

## Scenario 124: DataScanAgentLinuxEvent Query
> 来源: ado-wiki-kusto-datascanagent-event-migration.md | 适用: 未标注

### 排查步骤
```kql
cluster('{kustoCluster}').database('{kustoDatabase}').DataScanAgentLinuxEvent
| where ScanResultId == '{scanResultID}'
//| where Message contains "syntax error" or Message contains " unexpected " or Message contains "failed " or Message contains "terminated " or Message contains "unsupported " or Message contains "exception " or Message contains "memory" or Level == "1" or Level == "2" or Level == "3"
// Level 1 = Critical, 2 = Error, 3 = Warning
```

`[来源: ado-wiki-kusto-datascanagent-event-migration.md]`

---

## Scenario 125: Find Cluster by Region
> 来源: ado-wiki-kusto-datascanagent-event-migration.md | 适用: 未标注

### 排查步骤
Use the following query to get the region name:

```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "{scanResultID}"
| project Tenant
```

Then find the cluster from the [Kusto Cluster Details page](https://eng.ms/docs/microsoft-security/cloud-ecosystem-security/azure-data-governance/security-platform-ecosystem/microsoft-purview/microsoft-purview-troubleshooting-guides/regionexpansion/regionexpansion/kustoclusterdetails).

`[来源: ado-wiki-kusto-datascanagent-event-migration.md]`

---

## Scenario 126: Cluster List (DataScanAgentLinuxEvent uses same clusters as DataScanAgentEvent)
> 来源: ado-wiki-kusto-datascanagent-event-migration.md | 适用: 未标注

### 排查步骤
| Region | Cluster |
|--------|---------|
| East US 2 | `babylon.eastus2.kusto.windows.net` |
| East US 2 EUAP | `purviewadxeus2euap.eastus2euap.kusto.windows.net` |
| West Central US | `purviewadxwcus.westcentralus.kusto.windows.net` |
| East US | `purviewadxeus.eastus.kusto.windows.net` |
| West Europe | `purviewadxweu.westeurope.kusto.windows.net` |
| Southeast Asia | `purviewadxsea.southeastasia.kusto.windows.net` |
| Brazil South | `purviewadxbrs.brazilsouth.kusto.windows.net` |
| East US 2 | `purviewadxeus2.eastus2.kusto.windows.net` |
| Canada Central | `purviewadxcc.canadacentral.kusto.windows.net` |
| South Central US | `purviewadxscus.southcentralus.kusto.windows.net` |
| Central India | `purviewadxcid.centralindia.kusto.windows.net` |
| UK South | `purviewadxuks.uksouth.kusto.windows.net` |
| Australia East | `purviewadxae.australiaeast.kusto.windows.net` |
| North Europe | `purviewadxne.northeurope.kusto.windows.net` |
| West US 2 | `purviewadxwus2.westus2.kusto.windows.net` |
| France Central | `purviewadxfc.francecentral.kusto.windows.net` |
| Korea Central | `purviewadxkc.koreacentral.kusto.windows.net` |
| Central US | `purviewadxcus.centralus.kusto.windows.net` |
| UAE North | `purviewadxuaen.uaenorth.kusto.windows.net` |
| Japan East | `purviewadxjpe.japaneast.kusto.windows.net` |
| West US | `purviewadxwus.westus.kusto.windows.net` |
| Switzerland North | `purviewadxstzn.switzerlandnorth.kusto.windows.net` |
| South Africa North | `purviewadxsan.southafricanorth.kusto.windows.net` |
| Germany West Central | `purviewadxdewc.germanywestcentral.kusto.windows.net` |
| West US 3 | `purviewadxwus3.westus3.kusto.windows.net` |
| Australia Southeast | `purviewadxase.australiasoutheast.kusto.windows.net` |
| North Central US | `purviewadxncus.northcentralus.kusto.windows.net` |

Database: `DataScanLogs`

`[来源: ado-wiki-kusto-datascanagent-event-migration.md]`

---

## Scenario 127: Logs Required for Escalation - General
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
We have observed cases where there is missing logs for ICM/AVA. In order to mitigate issues involving back and forth, please make sure you have verified the logs before escalating the case.

- For Microsoft Data source: refer to [Queries for MS data source](https://eng.ms/docs/cloud-ai-platform/azure-data/azure-data-governance/governance/microsoft-purview/microsoft-purview-troubleshooting-guides/troubleshooting/connector/commonkustologsfor1stpartyconnector)
- For 3rd party data source: refer to [Queries for 3rd party data source](https://eng.ms/docs/cloud-ai-platform/azure-data/azure-data-governance/governance/microsoft-purview/microsoft-purview-troubleshooting-guides/troubleshooting/connector/3pdatasources-initialtroubleshootingguide)

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 128: Scenario-1: Customer is unable to register SHIR successfully
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
**RCA**: Typically caused by on-prem network issue or service account permission issue.

**Logs required:**
- Report ID
- Network Trace (Netmon)

**Target ICM Queue**: Data Scan

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 129: Scenario-2: Scan via SHIR failed with HTTP error code (4xx, 5xx)
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
**RCA**: Typically caused by permission or firewall/PE issue.

**Logs required:**
- Report ID
- Fiddler trace (issue is at HTTP layer)
- Check whether target endpoint disabled public network connection

**Target ICM Queue**:
- testconnectivity/credential/source registration → Data Sources
- connectorException or source-specific issue → Data Sources
- All other issues → Data Scan

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 130: Scenario-3: Scan via SHIR failed with common error messages (e.g. Internal server error)
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
**RCA**: Many different root causes. Case by case analysis required.

**Logs required:**
- Report ID
- Scan run ID
- Data source connection string

**Target ICM Queue**: Data Scan

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 131: Scenario-4: Scan 3P data source via SHIR failed with MIRException
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
**RCA**: Deep dive into logs required.

**Logs required:**
- Report ID
- Troubleshooting package
- Scan run ID
- Data source connection string
- Run 3P MIRException analysis script

**Target ICM Queue**: Data Sources

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 132: Scenario-5: Performance tuning of scan running via SHIR including scan timeout
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
**RCA**: Typically because queries to data source are slow or SHIR server running out of resource.

**Logs required:**
- Report ID
- Troubleshooting package
- Scan run ID
- DB server logs (e.g. profiler trace in SQL)
- Perfmon on SHIR server
- Usage of DB server (CPU, Memory)
- Data source connection string

**Target ICM Queue**: Data Scan

**Note**: Support multiple Azure DB sources in one ticket — help identify which exact DB source to fine-tune.

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 133: Scenario-6: Scan succeeded, but assets or schema missing
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
**RCA**: Typically because some queries to data source failed.

**Logs required:**
- Report ID (if scan via SHIR)
- Troubleshooting package (for 3P data sources)
- Scan run ID
- DB server logs (e.g. profiler trace in SQL)
- Target DB FQDN and auth type
- PBI result if data source is PowerBI

**Target ICM Queue**: Data Sources

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 134: Scenario-7: Asset was not classified
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
**RCA**: Typically because of data issue, data format issue or product issue.

**Logs required:**
- Sample data from customer
- What classification rule customer expects
- Scan run ID

**Target ICM Queue**: Classification

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 135: Scenario-8: Billing getting higher
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
**RCA**: Determine whether caused by user activities or product issue.

**Logs required:**
- Follow the TSG: Billing Charge lookup

**Target ICM Queue**: Subject to analysis result

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 136: Scenario-9: Purview API call from client failed
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
**RCA**: Typically user error — code issue or firewall issue.

**Logs required:**
- Error message and timestamp
- Sample code from customer
- Firewall settings on client machine
- Public network access setting in Purview
- Azure SDK version (if applicable)

**Target ICM Queue**: Data Map

**Note**: Try to reproduce the issue.

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 137: Scenario-10: SHIR crashed during registration or scan
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
**RCA**: Need to check data in memory.

**Logs required:**
- Scan run ID (if applicable)
- Report ID
- Troubleshooting package (if applicable)
- Memory dump (follow Dump collection TSG)

**Target ICM Queue**: Data Scan

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 138: Scenario-11: Data in insights report not showing as expected
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
**RCA**: Insights job triggers every 4-6 hours after catalog update, then report refreshes on schedule.

**Logs required:**
- Account ID, region, subscription
- Example asset showing in catalog but not in Insights App

**Target ICM Queue**: Insights

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 139: Scenario-12: Lineage pointing to wrong asset
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
**Logs required:**
- Account Name, ResourceUri, Region
- GUID or FQDN
- Type of related assets
- Screenshots of current and expected column mapping

**Target ICM Queue**: DataMap

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 140: Self-Hosted IR (SHIR) Event Viewer
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
- Navigate to Event Viewer → Applications and Services Logs → Connectors-Integration Runtime
- Set max log size to 4GB, ensure logging is enabled

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 141: Troubleshooting Package for 3P Data Sources
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
- Add feature flag: `&feature.ext.datasource={"scanTroubleShootingPackage":true}`
- Refresh page, choose SHIR runtime, enable troubleshooting flag
- Trigger scan and wait for completion
- Find package at: `C:\windows\ServiceProfiles\DIAHostService\AppData\Local\Microsoft\Purview\Troubleshooting`

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 142: Log Validation
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
1. Kusto log retention is ~3 weeks; collect scan run IDs from recent 1 week
2. Verify Report ID and Scan Result ID match:
   - Find PipelineRunId from ScanningLog
   - Cross-reference with SHIR TraceGatewayLocalEventLog using UserReportId + PipelineRunId
3. For 3P sources, also collect troubleshooting package
4. If scan failed without generating scan result ID, attach `x-ms-correlation-request-id` from F12 network tab

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 143: Network Related
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
- Follow TSG for TCP/TLS/HTTP issues
- Check whether public endpoint in Purview is disabled and if PE exists for Portal and Ingestion
- Collect: Fiddler Trace, Network Trace (Netmon), Certificate/TLS info

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 144: 3P Data Sources List (Troubleshooting Package Applicable)
> 来源: ado-wiki-logs-required-for-escalation.md | 适用: 未标注

### 排查步骤
BigQuery, Cassandra, PostgreSQL, MongoDB, SAPHANA, Erwin, SAPS4HANA, Hive, Databricks, SAP ECC, Oracle, Salesforce, SAP BW, Looker, MySQL, Snowflake, DB2, Teradata, Redshift, Tableau

`[来源: ado-wiki-logs-required-for-escalation.md]`

---

## Scenario 145: Overview
> 来源: ado-wiki-system-error-launch-datascan-process.md | 适用: 未标注

### 排查步骤
Error coming from the executor/agent during scan. Diagnostic steps differ by scan type (SHIR vs Cloud IR).

`[来源: ado-wiki-system-error-launch-datascan-process.md]`

---

## Scenario 146: Step 1: Determine Scan Type
> 来源: ado-wiki-system-error-launch-datascan-process.md | 适用: 未标注

### 排查步骤
**For Self-Host IR scans**: Follow [Get the log for a Self-Host IR Scan](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Azure%20Purview/614492/Get-the-logs-from-Self-Host-IR-scan)

**For Cloud IR scans**: Find the correct cluster:

```kql
cluster("https://catalogtelemetrykusto.eastus.kusto.windows.net")
.database("Scan")
.GetAgentCluster({ScanRunId})
```

Output provides: region, clusterConn (e.g., `https://purviewadxsan.southafricanorth.kusto.windows.net`), originConn

`[来源: ado-wiki-system-error-launch-datascan-process.md]`

---

## Scenario 147: Step 2: Query Executor/Agent Logs
> 来源: ado-wiki-system-error-launch-datascan-process.md | 适用: 未标注

### 排查步骤
Replace `{ClusterConnStr}` with the `clusterConn` from Step 1:

`[来源: ado-wiki-system-error-launch-datascan-process.md]`

---

## Scenario 148: Executor Logs
> 来源: ado-wiki-system-error-launch-datascan-process.md | 适用: 未标注

### 排查步骤
```kql
let activityid = cluster("https://catalogtelemetrykusto.eastus.kusto.windows.net")
    .database("Scan").GetScanActivities({ScanRunId});
cluster({ClusterConnStr}).database('DataScanLogs').CustomLogEvent
| where ActivityId in (activityid)
```

`[来源: ado-wiki-system-error-launch-datascan-process.md]`

---

## Scenario 149: Agent Logs
> 来源: ado-wiki-system-error-launch-datascan-process.md | 适用: 未标注

### 排查步骤
```kql
cluster({ClusterConnStr}).database('DataScanLogs').DataScanAgentEvent
| where ScanResultId == {ScanRunId}
```

`[来源: ado-wiki-system-error-launch-datascan-process.md]`

---
