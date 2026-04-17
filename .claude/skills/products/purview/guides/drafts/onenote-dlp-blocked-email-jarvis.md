# DLP Blocked Outbound Email — Jarvis Investigation

> Source: OneNote — Sample Query: DLP blocked outbound email
> Status: draft

## Scenario

Customer reports outbound email is blocked by DLP. NDR message indicates DLP policy match with label-based or content-based rule.

## Investigation Steps

### 1. Identify DLP Block Record in Jarvis

- Namespace: `O365PassiveGal`
- Table: `DLPPolicyAgentLogs`
- Filter by **Tenant ID**

Key fields to look for:
- `IsMatch: True` — confirms DLP rule matched
- `Actions` — shows what actions were taken:
  - `BlockAccess: True` — message was blocked
  - `ExNotifyUser: True` — user notification sent
  - `GenerateAlertAction: True` — alert generated
  - `GenerateIncidentReport: True` — incident report created

### 2. Get Correlation ID

- Filter query for blocked action records
- Extract the **correlationID** from the DLP block event

### 3. Full DLP Log Trace

- Run query filtered by the **correlationID** to get the complete DLP evaluation chain
- This shows all rules evaluated, match conditions, and final actions

## Key Indicators

| Field | Value | Meaning |
|---|---|---|
| IsMatch | True | DLP rule matched |
| BlockAccess | True | Email was blocked |
| ExNotifyUser | True | User was notified |

## 21V Applicability

Available in 21Vianet via Mooncake Jarvis portal.
