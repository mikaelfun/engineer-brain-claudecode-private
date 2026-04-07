# Microsoft Purview CRI Subclassification Rules

> Source: ADO Wiki — `CRI Subclassification`
> Purpose: Rules for classifying CRI (Customer Reported Incidents) in Purview ICM

## Classification Matrix

| CRIClassification | IssueClass | CRIEscalationQuality |
|---|---|---|
| CSS Delivery Issue - CSS Training | Customer Error or Request | Missing information for investigation / Public document or TSG exists |
| CSS Delivery Issue - CSS Didn't follow process | Customer Error or Request | Improper escalation as sev 2 / Unqualified CRI / Advisory question with no Ava / Ava thread already provided solution |
| Product Bug - Environment Issue | External or Partner | (any) |
| Product Bug - Service Bug | Product Issue | (any) |
| Product Operation - Account/Quota Limit | Customer Error or Request | Quota Increase |
| Product Operation - Refund Request | Customer Error or Request | Refund Request |
| Product Improvement/Limitation - Outside Current Design | Customer Error or Request | Qualified CRI / Not applicable (for LSI) |
| Product Improvement/Limitation - Enable Feature Functionality | Customer Error or Request | New Feature Request |
| Product Improvement/Limitation - Engineering Deployment Process | Product Issue | Not applicable (for LSI) |
| Supportability Gap - ASC Insight | Customer Error or Request | ASC Insight missing/need improvement |
| Supportability Gap - TSG/Public Doc | Customer Error or Request | TSG/Public Documentation opportunity |

## Kusto Validation Query

```kql
// Purview TenantId = 25188
let StartTime = datetime(2021-01-01);
let indidents = (Incidents
| where CreateDate >= StartTime
| where OwningTenantId == 25188
| where IncidentType == "CustomerReported"
| where isnotempty(SupportTicketId)
| summarize argmax(Lens_IngestionTime, Status) by IncidentId
| where max_Lens_IngestionTime_Status == "RESOLVED"
| distinct IncidentId);
// Join with custom fields: IssueClass, CRIEscalationQuality, CRIClassification
// Validate classification consistency
```
