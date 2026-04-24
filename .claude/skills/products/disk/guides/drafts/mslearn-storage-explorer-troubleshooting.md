---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/blobs/alerts/storage-explorer-troubleshooting
importDate: "2026-04-23"
type: guide-draft
---

# Azure Storage Explorer Troubleshooting Guide

## Azure RBAC Permissions

### List/Get Storage Accounts
- Must have **Reader** role to list storage accounts
- Without this, Storage Explorer cannot discover accounts

### Account Keys Access
- **Contributor** role grants access to account keys
- Account keys provide unrestricted access; do not share broadly
- Regenerate keys from Azure portal to revoke access

### Data Roles
- Need at least **Storage Blob Data Reader** to list/download blobs
- For full operations, use Storage Blob Data Contributor

## Connectivity Issues
- Check proxy settings in Edit > Configure Proxy
- For self-signed certificates: Edit > SSL Certificates > Import Certificates
- "Unable to Retrieve Subscriptions" error: ensure correct Azure environment/tenant selected

## Common Errors
- Cannot connect to storage account: verify network, firewall rules, and SAS token validity
- CORS errors when accessing from browser: configure CORS rules on storage account
- Timeout connecting: check if port 443 (HTTPS) is open, verify DNS resolution
