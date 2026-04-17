---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Place Cloud PC under review/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FCloud%20PC%20Actions%2FPlace%20Cloud%20PC%20under%20review%2FSetup%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Place Cloud PC Under Review - Setup Guide

## Prerequisites

Set up a Blob Storage account with the correct permissions before using the Place Cloud PC under review feature.

## Steps

1. **Create Blob Storage Account**
   - Storage Accounts > Blob Storage > Create

2. **Basics Tab**
   - Configure standard settings (subscription, resource group, name, region)

3. **Advanced Tab**
   - Disable "Enable storage account key access"
   - Minimum TLS version: **Version 1.2**

4. **Networking Tab**
   - Network access: **Enable public access from all networks**

5. **Data Protection & Encryption**
   - Accept defaults

6. **Complete wizard and Create**

7. **Configure IAM Role Assignments**
   - Go to the storage account > Access Control (IAM) > Role Assignments > Add
   - Add **two** role assignments:
     - **Storage Account Contributor** → Assign to "Windows 365" service principal
     - **Storage Blob Data Contributor** → Assign to "Windows 365" service principal

8. **Place Cloud PC Under Review**
   - Go to Cloud PC in Intune > Select "Place Cloud PC under review"
   - Select the newly created Storage Account and Container
   - Select "Allow Access" > "Place Under Review"

9. **Verify**
   - Status will initially show "Pending"
   - Check Containers in the storage account to see the newly created container
   - Once complete, status will show "Active"
