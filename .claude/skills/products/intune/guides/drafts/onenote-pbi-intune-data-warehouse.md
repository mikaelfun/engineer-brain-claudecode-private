# Use Power BI to Connect Intune Reporting (Data Warehouse)

> Source: OneNote — MCVKB/Intune/Use PBI to connect Intune reporting.md

## Overview

Intune Data Warehouse provides OData feeds for dynamically generated reports covering:
- Devices
- Enrollment
- App protection policy
- Compliance policy
- Device configuration profiles
- Software updates
- Device inventory logs

## Setup Steps

1. **Get OData Feed URL**: Navigate to Intune portal > Reports > Data warehouse > OData feed URL
2. **Configure in Power BI Desktop**: Use OData feed connector with the URL from step 1
3. **Authentication**: Select "Organizational account" to sign in
   - PBI Desktop auto-detects UPN and handles national cloud authentication
   - If error occurs, ensure you select Organizational account (not anonymous/basic)

## Authentication & RBAC Requirements

- Based on Microsoft Entra ID credentials + Intune RBAC
- Global administrators and Intune service administrators have access by default
- Other users need explicit access to the **Intune data warehouse** resource via Intune roles
- User must have one of:
  - Intune service administrator role
  - Role-based access to **Intune data warehouse** resource
  - Application-only authentication (user-less)
- User must have an Intune license to be assigned an Intune role

## Common Issues

- Sign-in error when using wrong authentication type (use Organizational account)
- Missing RBAC assignment for non-admin users

## References

- [Connect to the Data Warehouse with Power BI](https://learn.microsoft.com/en-us/mem/intune/developer/reports-proc-get-a-link-powerbi)
