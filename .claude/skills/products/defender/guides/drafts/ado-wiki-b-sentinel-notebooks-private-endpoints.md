---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Known Issues Tracker/The best to use the notebooks"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Known%20Issues%20Tracker/The%20best%20to%20use%20the%20notebooks"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Sentinel Notebooks with Private Endpoints - Troubleshooting Guide

## Limitations

- Cannot launch Notebook studio from public internet when Private Endpoints are enabled on Storage account while creating the Azure Machine Learning Workspace
- AML WS Private endpoint uses VNET, but Sentinel's Log Analytics workspace is not part of any VNET
- Results in 403 error: "Request authorization to storage account failed. Storage account might be behind a VNET"
- Sentinel Workspace uses public IP to save/create notebooks; if AML workspace is limited to private endpoints on Storage, public IP access is blocked

## Best Practice

- **Don't use Private Endpoints** when creating the AML workspace - use Public Endpoints (default)
- Public Endpoints allow all network connections for launching/saving Notebooks
- Required permissions: **Contributor** role on both the workspace and the Storage account

## Errors

### 403 Error - Storage Authorization Failed
- Caused by Private Endpoints enabled on Storage accounts used by AML workspace
- Manifests when launching Notebook from AML workspace or saving Notebook on Sentinel page
- Also blocks saving workbooks

## Workaround: Using Notebooks with Private Endpoints

### Option A: VM Jumpbox Approach
1. Create a VM jumpbox within the same VNET as the AML private endpoint
2. Use Bastion to access the VM
3. Open browser on jumpbox, go to Azure portal, log into Sentinel workspace
4. Create AML workspace from Sentinel notebook blade - in Networking tab, select Private Endpoint with the same VNET as VM jumpbox
5. In AML studio > Compute tab, create new compute with the same VNET
6. If only 1 private link: start uploading notebooks manually or run `git clone` on the terminal
7. If multiple private links with different VNETs:
   - Go to AML workspace Resource Group > Private DNS zone
   - Add Virtual Network Link to both private links (notebook & api aml)

### Option B: Git Clone via AML Terminal
1. Azure portal > Machine Learning > Select ML workspace > Launch studio > Notebooks > Terminal
2. Run: `git clone https://github.com/Azure/Azure-Sentinel-Notebooks.git`
3. Refresh files page to see all cloned notebooks

### Option C: Manual Upload
1. Download required files from https://github.com/Azure/Azure-Sentinel-Notebooks.git (save as .ipynb)
2. Azure portal > Machine Learning > Select ML workspace > Launch studio > Notebooks > Add files (+)
3. Upload the .ipynb files

## Contacts
- Chi Nguyen (chi.nguyen@microsoft.com) - Notebooks service issues
- Zhipeng Zhao (zhzhao@microsoft.com) - Notebooks service issues
