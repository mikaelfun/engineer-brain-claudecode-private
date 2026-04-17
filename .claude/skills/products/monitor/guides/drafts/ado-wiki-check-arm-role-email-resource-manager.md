---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Action Groups and Notifications/How to check which users have an ARM role to investigate the notification type Email Resource Manager Role or smart detections emails"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FAction%20Groups%20and%20Notifications%2FHow%20to%20check%20which%20users%20have%20an%20ARM%20role%20to%20investigate%20the%20notification%20type%20Email%20Resource%20Manager%20Role%20or%20smart%20detections%20emails"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Check ARM Role Assignments for Email Resource Manager Role / Smart Detection Emails

## Background

Action Groups have a notification type called **Email Resource Manager Role**. Users with the specified RBAC role receive emails from the action group.

**IMPORTANT behavior change (May 17-18, 2024):** Previously, users who inherited an RBAC role through group membership did NOT receive these emails. After this date, they DO receive emails. This may cause unexpected email delivery.

**Smart Detection:** Failure Anomalies alert rules are auto-created with Application Insights and use Email Resource Manager Role (Monitoring Reader + Monitoring Contributor).

## When to Use

- Customer reports receiving unexpected action group / smart detection emails
- Customer reports NOT receiving expected emails
- Need to verify RBAC role assignments for notification investigation

## Procedure: If You Have the Email Address / Display Name

1. Open **Azure Support Center** → **Tenant Explorer**
2. Select **Users**, paste email/display name to get Object ID
   - If email is "N/A" → user will not receive emails
3. If "No data found" → check **Groups** tab (may be a group address)
4. Navigate to **Resource Explorer**
5. Select the subscription → **Access Control**
6. Paste user's Object ID under **Check Access** to see:
   - Direct role assignments
   - Inherited role assignments (through group membership)

## Procedure: If You Do NOT Have the Email / Display Name

1. Navigate to **Resource Explorer** → select subscription → **Access Control**
2. Scroll to **Role Assignments**, search by role name or definition ID
3. Click **+** icon for details (creation date, object ID, etc.)
4. For group members: take group Object ID → **Tenant Explorer** → **Groups** → **Members**

## Key Points

- Direct assignment vs group inheritance determines email behavior pre/post May 2024
- If a user with group-inherited role started getting unexpected emails after May 2024, this is by-design
- If unexpected user does NOT have the role through group membership, **escalate to FTE TA/PTA/FTE SME/STA immediately**
