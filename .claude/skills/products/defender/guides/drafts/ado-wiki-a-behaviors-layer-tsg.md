---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Behaviors Layer/[TSG] - Behaviors Layer"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Behaviors%20Layer/%5BTSG%5D%20-%20Behaviors%20Layer"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting Guide for Sentinel Behaviors Layer

[[_TOC_]]


## Overview
---
The Microsoft Sentinel Behaviors Layer is a new UEBA capability in Public Preview that transforms raw security telemetry into contextualized, human-readable behavioral insights. This AI-based feature aggregates and sequences raw events from non-Microsoft data sources, creating meaningful behaviors and abstraction by enriching them with MITRE ATT&CK mappings, entity roles, and natural language explanations to answer the question "who did what to whom" in your environment.
Unlike alerts or anomalies, behaviors are neutral, descriptive observations that explain what happened without determining if something is malicious or unusual. They bridge the gap between raw logs and alerts by providing an intermediate, normalized view of activity that accelerates investigation, hunting, and detection authoring.

The first release includes behaviors from AWSCloudTrail and CommonSecurityLog (Palo Alto network, Palo Alto Threats, CyberArk Vault). We will add more data sources, and more behaviors within each data sources. When we add new behaviors to an enabled data source, there's no needed action on the part of the customer. When we add new sources, the customers will need to enable them.

### **Feature Description**
The Behaviors Layer provides the following capabilities:
Core Capabilities:
- Aggregates and sequences related security events into unified behavior objects.
- Enriches behaviors with MITRE ATT&CK tactics and techniques, entity roles, dynamic contextual description of what happened in natural language.
- Stores behaviors in two interrelated Log Analytics tables: BehaviorInfo and BehaviorEntities (to be joined using behaviorID, for all the details on the entities in the behavior).
- Provides near real-time availability once the time window closes or pattern is identified.
- Links back to originating raw events via EventIDs in AdditionalFields.
Behavior Types:
- Aggregation Behaviors: Detect volume-based patterns (e.g., user accessed 50+ AWS resources in time window).
- Sequencing Behaviors: Detect multi-step patterns that surface complex chains (e.g., access key created, used from new IP, privileged API calls).
Key Benefits:
- Clarity through human-readable summaries of activity.
- Context via MITRE ATT&CK mappings and entity roles.
- Efficiency by reducing investigation and hunting time.
- Unified schema across different products and data types.

## Prerequisites
To enable and use the Behaviors Layer, the following prerequisites must be met:
1.  Microsoft Sentinel workspace set up and ingesting supported data sources.
2.  Permissions to enable: Global admin or security admin (same as existing UEBA capabilities).
3.  Onboarding to the Microsoft 365 Defender portal (required for this feature to work).
4.  Supported data sources actively ingesting to the Analytics tier.
5.  No additional license required beyond existing Sentinel licensing.
6.  Existing UEBA capabilities are NOT a prerequisite for enabling Behaviors.
7.  Important Environment Constraints:
- The feature currently works on a single workspace in the tenant per customer's choosing.
- This single-workspace limitation will be removed in the near future.

## Onboarding
---

Under the Workspace settings->UEBA settings, customers will have a new tab called "New! Behaviors layer". There, they can toggle the feature on. This is not enough, as they will need to enable each data source. This is the same process as the UEBA onboarding and data sources connection.
As behaviors currently work on single workspace, then if it's enabled in workspace A in the tenant, the customer will not be able to enable it in workspace B. they can change workspaces using the toggle. Once this limitation is removed, it'll be available for multiple workspaces.

![==image_0==.png](/.attachments/==image_0==-d9ab0d05-74dc-4152-83fa-8dd3bd1ea885.png) 

## Costs
---
No Additional License Cost: The Behaviors feature itself is part of the Sentinel solution and does not require a separate license, SKU, or add-on.
Log Data Ingestion Charges: Behaviors are stored as records in the BehaviorInfo and BehaviorEntities tables within your Log Analytics workspace. Each behavior record contributes to the customer's data volume and will be billed according to their Sentinel/Log Analytics data ingestion rates. The output volume depends on your environment and the volume of ingested logs from supported sources.

**Important**! For ingestion monitoring in the billing usage table, the tables will appear with a Sentinel prefix - SentinelBehaviorInfo and SentinelBehaviorEntities.

## Limitations and Workarounds
___

### Limitation 1: Single Workspace per Tenant
**Details**: The feature currently works on a single workspace in the tenant, per the customer's choosing. 

**Workaround**: This limitation will be removed in the near future. Plan your deployment on the workspace with the highest priority data sources.

### Limitation 2: Data Source Coverage
**Details**: Behaviors are only generated for specific third-party data sources: AWS CloudTrail and certain CommonSecurityLog sources (Palo Alto Threats, CyberArk Vault). These sources are separate from other UEBA capabilities and need to be enabled specifically.

**Workaround**: Coverage will expand over time to include more data sources and more behavior types within existing sources. Monitor release notes and documentation for updates on newly supported sources.

**Important**! Behaviors will not replace the customer's original raw logs as we don't commit to full coverage of all activities (though we will expand this coverage over time) and we don't keep the raw telemetry details when aggregating and sequencing.

### Limitation 3: Partial Coverage Within Supported Sources
**Details**: Even for supported sources, not every possible action or attack technique produces a corresponding behavior. Absence of a behavior does not equal absence of activity. We will add more behaviors over time.

**Workaround**: Always use raw logs as a fallback if you suspect activity that is not captured by behaviors. Reference the documentation for lists of currently available behavior types to set expectations.

### Limitation 4: Behaviors Are Neutral Observations
**Details**: Behaviors do not have anomaly or alert status. They are neutral, informational logs that describe what happened without classification as malicious or benign.

**Workaround**: Use analyst judgment or combine behaviors with UEBA anomaly data to determine which behaviors are noteworthy. Build custom detection rules on top of the BehaviorInfo table to create alerts for suspicious patterns. Use them for understanding your top assets and TI activities.

### Limitation 5: Potential Noise and Relevance Issues
**Details**: While behaviors aim to reduce noise through aggregation and sequencing, scenarios may exist where too many behavior records are generated or some behaviors lack usefulness. We're working with very strict thresholds (percentage from raw logs), yet the actual number depends on the customer's logs.

**Workaround**: Provide feedback on specific behavior types through support. Leverage KQL filtering on Categories, MitreTechniques, and Title fields to focus on relevant behaviors for your use cases. If the customer finds the ROI too low, they can offboard by disabling a specific data source or behaviors altogether.

### Limitation 6: Dependence on Log Quality
**Details**: Incomplete, noisy, or incorrectly mapped logs can reduce accuracy. Logs with wrong column mappings might produce incorrect entity mapping and roles. 

**Workaround**: Ensure high-quality log ingestion and validate connector configurations. Review behavior logic by examining original logs using EventIDs in the AdditionalFields column. 

## Common Scenarios and Troubleshooting
---
### Troubleshooting Table

| Issue | Reason | Mitigation | Notes |
| --- | --- | --- | --- |
| No behaviors appearing after enabling the feature | 1. Supported data sources not actively ingesting to Analytics tier2. Data source toggle weren't enabled in settings3. Insufficient time has passed since enabling | 1. Verify supported data sources (AWS CloudTrail, CommonSecurityLog for Palo Alto/CyberArk) are ingesting to Analytics tier (not Basic or Archive)2. Navigate to Microsoft Sentinel > Configuration > Settings > User and Entity Behavior Analytics and verify the data source is connected3. Wait 15-30 minutes after enabling for behaviors to populate4. Run verification query: BehaviorInfo | summarize count() by Title | If the problem persists - raise a ticket |
| BehaviorInfo or BehaviorEntities tables do not exist in workspace | 1. Feature not enabled in settings2. Workspace not onboarded to Defender portal3. Single workspace limitation (another workspace already enabled) | 1. Enable Behaviors feature in Sentinel settings in Defender portal2. Confirm workspace is onboarded to Microsoft 365 Defender portal3. Verify no other workspace in the tenant already has Behaviors enabled (single workspace limitation) |  |
| Fewer behaviors than expected | 1. Partial coverage within supported sources2. Log volume does not meet minimum thresholds3. Specific behavior types not yet available | 1. Review the supported behavior types list in documentation to set expectations2. Verify log volume from supported sources is sufficient3. Remember: absence of a behavior does not equal absence of activity |  |
| Unable to trace behavior back to raw logs | Missing or unclear AdditionalFields content | Use the AdditionalFields column in BehaviorInfo which contains references to original event IDs |  |
| Behavior entity roles are incorrect or entities are missing | 1. Poor log quality or incorrect column mapping in source logs2. AI-generated rule has mapping errors | 1. Validate that source logs have correct schema and field mappings.2. Review the behavior's description and compare with raw events using EventIDs | If all is correct, raise CRI |
| Behavior description is unclear or lacks sufficient context | Description generated by AI may not provide enough explainability | 1. Review the BehaviorInfo Title and Description fields for high-level context2. Use EventIDs in AdditionalFields to examine raw events [[Behaviors�tion draft | If all is correct, raise CRI |
| Behavior volume is too high (noise) | Aggregation or sequencing rules are generating too many behaviors for benign activity | 1. Use KQL filtering on Categories, MitreTechniques, Title, or SourceTable to focus on relevant behaviors2. Build custom queries to filter out known benign patterns3. Provide feedback on specific noisy behavior types | If overall volume (=ROI) is too high, customers can offboard. We would like to know of any such case and be able to understand the customer's concerns and use cases. |
| Behavior MITRE mapping appears incorrect | AI-generated MITRE mapping may not align with expected tactics/techniques | 1. Review the MitreTechniques field in BehaviorInfo and compare with raw events2. Cross-reference with MITRE ATT\&CK framework documentation | Raise a ticket with specific BehaviorId, timestamp, and explanation of expected vs. actual MITRE mapping. |
| Cannot query BehaviorInfo or BehaviorEntities in Advanced Hunting | 1. Insufficient permissions2. Tables not yet populated3. Workspace not selected in Advanced Hunting | 1. Ensure you have necessary permissions for Advanced Hunting in Defender portal2. Verify tables exist by running: BehaviorInfo | take 103. Confirm correct workspace is selected in Advanced Hunting query interface | If permissions are confirmed and tables exist but queries fail, raise a ticket with error details.If the customer already has behaviors from MDA / MDC, they will see all the behaviors in the same query as we do a union behind the scenes between the XDR table and the Log Analytics table |
| Behaviors not appearing for a specific data source | 1. Data source not yet supported2. Data source toggle not enabled3. Specific log types within source not supported | 1. Verify the data source is in the supported list (AWS CloudTrail, CommonSecurityLog for Palo Alto/CyberArk) [2. Check that the data source toggle is ON in UEBA settings3. Review documentation for specific log types covered within each source | If ingestion is confirmed and no configuration changes were made, raise a ticket with timeframe when behaviors stopped. |
| Behaviors stopped appearing after working previously | 1. Data source ingestion stopped or paused2. Data moved to Basic or Archive tier3. Workspace reached data limits | 1. Verify data source is still actively ingesting to Analytics tier2. Check for any ingestion errors or connector issues3. Review workspace health and data limits | If ingestion is confirmed and no configuration changes were made, raise a ticket with timeframe when behaviors stopped. |
| Unable to join BehaviorInfo with BehaviorEntities | Incorrect join syntax or BehaviorId mismatch | Always use BehaviorId field to join |  |
| Detection rules based on BehaviorInfo not firing | 1. Query logic issues2. Insufficient behavior volume3. Detection rule configuration errors | 1. Test query manually in Advanced Hunting to verify behaviors match expected conditions2. Review detection rule configuration (frequency, threshold, suppression)3. Ensure BehaviorInfo table is included in detection rule scope | If query returns results manually but detection rule does not fire, raise a ticket with rule definition. |

### Scenario 1: No Behaviors Appearing After Enabling Feature
**Symptom**: Customer has enabled the Behaviors feature in Sentinel settings but the BehaviorInfo and BehaviorEntities tables remain empty or do not exist.

**Investigation Step 1**: Verify the feature is enabled in the correct location:
- Navigate to Microsoft Sentinel > Configuration > Settings > User and Entity Behavior Analytics in the Microsoft 365 Defender portal
- Confirm the Behaviors toggle is switched ON
- Confirm the appropriate data sources are selected and toggled ON

**Investigation Step 2:** Verify prerequisites are met:
- Confirm the workspace is onboarded to the Microsoft 365 Defender portal (feature only works in Defender portal)
- Verify supported data sources (AWS CloudTrail, CommonSecurityLog for Palo Alto Threats/CyberArk Vault) are actively ingesting logs
- Confirm logs are ingesting to the Analytics tier
- Check if another workspace in the tenant already has Behaviors enabled (single workspace limitation)

**Investigation Step 3:** Wait for initial population and verify:
- Allow 15-30 minutes after enabling for behaviors to start populating
- Run verification query in Advanced Hunting.
- If query fails with "table not found," tables have not been created yet.

**Cause**: 
Most common causes are: workspace not onboarded to Defender portal, supported data sources not ingesting to Analytics tier, insufficient time since enabling, or another workspace already has Behaviors enabled.
Resolution:
1.  If workspace is not onboarded to Defender portal, complete onboarding first
2.  If data sources are not supported or not ingesting to Analytics tier, configure appropriate connectors
3.  If sufficient time has passed (30+ minutes) and prerequisites are met, escalate to Product Group with tenant ID, workspace ID, and confirmation of prerequisites.

### Scenario 2: Behaviors Appear But Entity Roles / MITRE mapping Are Incorrect
**Symptom**: Behaviors are being generated but the entity roles (Actor, Target, Other) or the MITRE mapping in the BehaviorEntities table do not match the actual activity described, or key entities are missing entirely.

**Investigation Step 1:** Review the specific behavior causing issues:
- Identify the BehaviorId of the problematic behavior
- Query both tables to review details:
BehaviorInfo  
| where BehaviorId == "<behavior_id>"  
| join kind=inner BehaviorEntities on BehaviorId  
| project TimeGenerated, Title, Description, EntityType, EntityRole, EntityId

**Investigation Step 2:** Examine the raw events that contributed to the behavior:
- Extract EventIDs from AdditionalFields in BehaviorInfo
- Query the original source table (e.g., AWSCloudTrail, CommonSecurityLog) using the EventIDs and timeframe
- Compare the raw event details with the behavior's entity mapping

**Investigation Step 3:** Assess log quality and schema correctness:
- Verify the source logs have correct schema and field mappings
- Check if the connector is using custom parsing or if standard schema is followed
- Look for missing or malformed fields in the raw logs that may affect entity extraction

**Cause**: Incorrect entity roles typically result from poor log quality, incorrect column mapping in source logs, or errors in the AI-generated behavior rule logic.
Resolution:
1.  If raw logs have incorrect schema or missing fields, correct the connector configuration or custom parsing logic
2.  If raw logs are correct but entity mapping or MITRE is wrong, document the specific BehaviorId, timestamp, description of expected vs. actual entity roles, and escalate to Product Group
3.  As a temporary workaround, analysts can rely on the behavior Description field and raw events for investigation rather than trusting entity roles.

## Required Kusto Access
---
Minimum Required Permissions:
- Read access to BehaviorInfo and BehaviorEntities tables in the Log Analytics workspace
- Advanced Hunting query permissions in Microsoft 365 Defender portal
- Read access to source tables (e.g., AWSCloudTrail, CommonSecurityLog) for tracing back to raw events

## Escalating to Product Group (PG)
---
Before creating the IcM, make sure you have exhausted all the steps in this document.
Make sure to collect:
- Azure Tenant ID
- Azure Workspace ID
- Workspace region
- Timestamp when the issue occurred (in UTC)
- Specific BehaviorId(s) if applicable
- Screenshots of the issue or unexpected behavior
- Query used (if query-related issue)
- Data source(s) involved (e.g., AWSCloudTrail, CommonSecurityLog)
- Confirmation that workspace is onboarded to Microsoft 365 Defender portal
- Confirmation that Behaviors feature toggle is enabled in settings
- Confirmation that data sources are toggled ON in Behaviors settings
- Confirmation that logs are ingesting to Analytics tier
- Error messages and stack traces if available
- Expected behavior vs. actual behavior
- Steps to reproduce the issue (detailed)
Additional Context to Include:
- Whether the issue is consistent or intermittent
- Whether the issue affects all behaviors or specific behavior types
- Any recent configuration changes to the workspace or data sources
- Log volume from affected data sources

## Frequently Asked Questions (FAQs)
---
**Q1**: What is the difference between behaviors and UEBA anomalies?

Behaviors are neutral, descriptive observations that explain what happened in your environment without determining if something is malicious or unusual. Anomalies, on the other hand, are generated by UEBA's machine learning models to flag deviations from normal baselines that may indicate threats. Behaviors do not have anomaly or alert status. Eventually, anomalies may be calculated on top of behaviors, but in Public Preview, behaviors and anomalies remain separate capabilities.

**Q2**: Can behaviors be used to create detection rules?

Yes. The BehaviorInfo table is fully accessible via KQL and can be used in analytic rule queries just like any other log. Detection engineers can write rules that trigger on specific behavior patterns, MITRE techniques, or sequences of behaviors. For example: "Alert if a user has a 'Creation of new AWS access key' behavior followed by an 'Elevation of privileges in AWS' behavior within 1 hour."

**Q3**: How do I trace a behavior back to the original raw events?

Use the AdditionalFields column in BehaviorInfo, which contains references to original event IDs. You can then query the source table (e.g., AWSCloudTrail, CommonSecurityLog) using those event IDs and the behavior's timestamp to review the raw logs that contributed to the behavior.

**Q4**: Why are behaviors not classified as malicious or benign?

Behaviors are designed to be neutral observations that describe activity in a normalized, context-rich format. The goal is to provide a foundation for investigation, hunting, and detection, not to make judgments about risk. Analysts use behaviors alongside other signals (alerts, anomalies, threat intelligence) to determine if activity is suspicious. However, they are mapped to MITRE framework for security context.

**Q5**: Do I need to enable other UEBA capabilities to use Behaviors?

No. Enabling the Behaviors feature is separate from other UEBA capabilities (anomalies, insights) and does not require existing UEBA onboarding. However, data sources must be enabled specifically for Behaviors even if they are already enabled for other UEBA capabilities.

**Q6**: What happens if I disable the Behaviors feature?

If you disable the Behaviors feature toggle, new behaviors will stop being generated. Existing behavior records in the BehaviorInfo and BehaviorEntities tables will remain in your workspace according to your data retention policies.

**Q7**: Can I customize or create my own behavior rules?

In Public Preview, behavior rules are generated and maintained by Microsoft's engineering team using AI-powered logic. The rules are not customer-specific and run in production for all customers. Custom behavior creation is not supported in Public Preview. You can provide feedback on desired behavior types via feature requests.

**Q8**: How are behaviors different from BehaviorAnalytics table (existing UEBA)?

Existing UEBA capabilities work on top of specific raw events, one at a time, enriching them and providing insights in the behaviorAnalytics table. Behaviors are aggregations and sequencing of multiple events, mapped to MITRE and provided with a detailed description of who did what to whom, and what it might mean.

**Q9**: What is the expected behavior volume?

Behavior volume depends on your environment and the volume of raw logs from supported sources. A single behavior might represent 10s or 100s of raw events, which is by design for noise reduction. Monitor the BehaviorInfo table volume during the first few days after enabling to understand your baseline.

**Q10**: Can I query behaviors across multiple workspaces?

The feature currently works on a single workspace in the tenant. This limitation will be removed in the near future.

**Q11**: Are behaviors available in real-time?

Behaviors are available in near real-time. They are aggregated and sequenced based on a time window tailored to each logic. Once the time window closes or pattern is identified, the behavior log is created immediately.

**Q12**: How does AI power the Behaviors feature?

Generative AI is used to create and scale the behavior rules, including logic creation, entity mapping, MITRE mapping, and natural language explainability. The AI is used offline by Microsoft's engineering team to develop and validate behavioral rules. At runtime, behaviors are generated by fixed, tested correlation logic (KQL queries), not by an AI model making unpredictable decisions. This ensures each behavior output is repeatable and explainable. Refer to RAI clause in the documentation.

## Additional Information
---
- Public Documentation: 
  - UEBA behaviors layer: [Documentation](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Faka.ms%2Fsentinel-behaviors&data=05%7C02%7Cmshechter%40microsoft.com%7C0b94482808024c8d5b1108de4c3b3b11%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C639032014437663578%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=mhwMUyixC%2FI5sSVmb%2Bvz8QJ4k%2BmFZuqoWPZ8Q8Y3Uqg%3D&reserved=0)
  - [RAI article](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Faka.ms%2Fmiscrosoftsentinelbehaviors&data=05%7C02%7Cmshechter%40microsoft.com%7C0b94482808024c8d5b1108de4c3b3b11%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C639032014437680938%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=9TVRqvmYOH1JikzwC3n%2BggfOKFsibWpagdZ%2BEdAl%2Ftw%3D&reserved=0)
  - BehaviorInfo Table Schema: [https://learn.microsoft.com/azure/azure-monitor/reference/tables/behaviorinfo](https://learn.microsoft.com/azure/azure-monitor/reference/tables/behaviorinfo)
  - BehaviorEntities Table Schema: [https://learn.microsoft.com/azure/azure-monitor/reference/tables/behaviorentities](https://learn.microsoft.com/azure/azure-monitor/reference/tables/behaviorentities)

## Related Features
---
- Microsoft Sentinel UEBA Overview
- User and Entity Behavior Analytics
- MITRE ATT&CK Coverage in Sentinel

## Acronyms
___

| Acronym | Definition |
| --- | --- |
| UEBA | User and Entity Behavior Analytics |
| MITRE | MITRE ATT&CK Framework (tactics, techniques, and procedures) |
| AWS | Amazon Web Services |
| EC2 | Amazon Elastic Compute Cloud |
| EKS | Amazon Elastic Kubernetes Service |
| S3 | Amazon Simple Storage Service |

---
| Contributor Name | Details | Date(DD/MM/YYYY) |
|--|--|--|
| Michal Shechter | Creator | 26/11/2025 |

---
:::template /.templates/Wiki-Feedback.md

:::  

---
:::template /.templates/Ava-GetHelp.md
:::
