---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Azure Active Directory Topics/How to setup your Azure tenant/How to sync your on-premise lab with Entra ID"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAzure%20Active%20Directory%20Topics%2FHow%20to%20setup%20your%20Azure%20tenant%2FHow%20to%20sync%20your%20on-premise%20lab%20with%20Entra%20ID"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:**
Step-by-step guide to syncing your on-premise domain with Microsoft Entra ID, covering prerequisites, domain health checks, UPN suffix addition, custom domain name verification, Microsoft Entra Connect installation and configuration, synchronization options, SCP creation, and sync status verification.

## Prerequisites
- An active Microsoft Entra ID subscription
- An on-premise domain controller running Windows Server 2016 or later
- A server that can run the Microsoft Entra Connect tool
- A verified domain name in Microsoft Entra ID

## Step 1: Check your domain health
- Check the replication status of your domain controllers
- Use the DNS Manager console to verify that your domain name is registered and resolvable

## Step 2: Add UPN suffix in your on-premise domain
Add a UPN suffix that matches your Microsoft Entra ID domain name.
- Open Active Directory Domains and Trusts > Right-click > Properties > UPN Suffixes > Add

## Step 3: Add custom domain names in your Microsoft Entra ID domain
Add your on-premise domain name as a custom domain name in your Microsoft Entra ID domain.
- Verify domain ownership by adding a TXT or MX record in your DNS provider.
- **NOTE:** Status "Unverified" is expected for non-existent or non-navigable domain names.

## Step 4: Install and configure Microsoft Entra Connect
Prerequisites: https://aka.ms/entra-connect-prerequisites

### Common Errors during installation:
1. **Authentication error**: Add https://login.microsoftonline.com and https://aadcdn.msauth.net to trusted sites.
2. **"JavaScript is required to sign in"**: Enable JavaScript in Windows following MS support article.

### Configuration steps:
1. Download and run the Entra Connect installer
2. Choose installation type (Express for lab)
3. Enter credentials for on-premise domain and Entra ID
4. Configure Azure AD sign-in (UPN suffix selection)
5. Click Install

## Step 5: Configure synchronization options
1. Open Entra Connect > Configure > Customize synchronization options
2. Connect to Microsoft Entra ID with global admin credentials
3. Connect to Active Directory Forests with enterprise admin
4. Domain and OU filtering (select which OUs to sync)
5. Optional features: password writeback, group writeback, PHS, device writeback, etc.

## Step 6: Create a service connection point (SCP)
1. Open Entra Connect > Configure > Configure device options
2. Select Configure Hybrid Azure AD Join
3. Select Windows 10 or later domain-joined devices
4. Configure SCP for each forest

## Step 7: Verify the sync status
- Synchronization Service Manager console for sync operations and logs
- Microsoft Entra Connect Health portal for sync health and alerts
- Microsoft Entra ID admin center
