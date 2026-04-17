---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/AUTOMATION/## Troubleshooting/Hybrid worker/DSC for VM.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# DSC (Desired State Configuration) for VM Setup

Reference: https://docs.azure.cn/zh-cn/automation/quickstarts/dsc-configuration

## Steps

1. **Enable VM** for DSC in Automation Account

2. **Import module `nx`** (for Linux DSC resources)
   - nx module contains DSC resources for Linux nodes

3. **Import configuration file**
   - From Gallery: `xUser_CreateUserConfig` (mostly for Windows)
   - For Linux: check nx PowerShell docs at https://learn.microsoft.com/en-us/powershell/dsc/reference/resources/linux/lnxuserresource?view=dsc-1.1

4. **Compile the configuration** in Automation Account

5. **Assign configuration to DSC node**
