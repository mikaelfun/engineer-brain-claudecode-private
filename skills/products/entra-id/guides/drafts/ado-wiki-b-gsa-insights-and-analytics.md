---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Global Secure Access Insights and Analytics"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGlobal%20Secure%20Access%20Insights%20and%20Analytics"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Global Secure Access Insights and Analytics

GSA is integrated with UAG API and UX to provide enhanced cloud app insights and analytics and integrated risk assessment capabilities. This allows customers to understand Shadow AI and SaaS usage within their organization. Using 90+ application and risk attributes, customers can get richer details about the cloud apps including Gen AI apps discovered in GSA and conduct further risk assessment.

**Key Capabilities**

- Discover applications accessed within your enterprise from GSA, leveraging the unified set of ~37K applications and risk intelligence served from Entra.
- Click on any application discovered in GSA application insights and analytics blade and dig further into details from Entra Gallery.
- Understand application details such as description, domains, hosting provider, company headquarters and whether parent company is public or private.
- Evaluate why each app is risky and what factors are contributing to the high-risk scores using risk attributes on security, compliance and legal categories.
- Browse, search, and filter on these applications using different criteria from Entra Gallery.
- Run consistent, data-driven risk assessments to proactively improve your security posture.

## Insights and Analytics Dashboard

To access the **Insights and Analytics** dashboard:

1. Sign in to the [Microsoft Entra admin center](https://entra.microsoft.com/) as a [Global Secure Access Log Reader](https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#global-secure-access-log-reader).
2. Browse to **Global Secure Access** > **Applications** > **Insights and Analytics**.

The dashboard has three widgets:

### Application Count
Shows **Total cloud applications**, **Total private applications**, and the number of **New discovered segments** used within the selected time.

### Application Usage Distribution
Shows application usage by type (cloud vs private). Aggregate by **Transactions**, **Bytes sent**, or **Bytes received**.

### Application Usage Trend
Shows application usage over time. Aggregate by **Transactions**, **Users**, **Devices**, **Bytes sent**, or **Bytes received**.

## Private Application Analytics

Gives IT admins visibility into private enterprise applications onboarded to Microsoft Entra by Global Secure Access. Includes: application name, application ID, users, devices, access type, transactions, traffic (bytes sent/received), first and last access times. Also tracks quick access for configured customers.

Key details per row: **Application name**, **Application ID**, **Traffic type**, **Access type**, **Users**, **Devices**, **Transactions**, **Sent bytes**, **Received bytes**, **Last access**, **First access**.

Select a row to see per-app insight with **Usage** tab (transactions, traffic, users graph) and **Users** tab (per-user statistics).

## Cloud Application Analytics

Gives admins visibility into cloud applications including generative AI apps. Details: **Name**, **Categories**, **Risk score**, **Users**, **Sent bytes**, **Received bytes**, **Last access**, **First access**.

- Use **Generative AI apps only** toggle to filter generative AI apps.
- Select **Name** link to open **Microsoft Entra App Gallery** with risk scores (General, Security, Compliance, Legal tabs).
- Select **Users** link for per-user statistics.
- Select **Transactions** link for usage graph.

## ICM Escalations

| Area          | IcM Path                                 |
| :------------ | :--------------------------------------- |
| Data Path     | Global Secure Access / GSA Datapath      |
| Control Plane | Global Secure Access / GSA Control Plane |

## Public Documentation

- [Application Usage Analytics Overview (Preview)](https://learn.microsoft.com/en-us/entra/global-secure-access/overview-application-usage-analytics)
