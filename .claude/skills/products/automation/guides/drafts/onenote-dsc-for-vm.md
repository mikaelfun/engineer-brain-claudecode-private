# DSC (Desired State Configuration) for VM

## Source
- OneNote: Mooncake POD Support Notebook > AUTOMATION > Troubleshooting > Hybrid worker > DSC for VM
- Doc: https://docs.azure.cn/zh-cn/automation/quickstarts/dsc-configuration

## Steps

### 1. Enable VM
Enable the VM in Automation Account > State Configuration (DSC) > Nodes.

### 2. Import Module `nx` (for Linux)
- `nx` contains DSC resources for Linux
- Import from PowerShell Gallery in Automation Account > Modules

### 3. Import Configuration File
- **Windows**: Import from Gallery → `xUser_CreateUserConfig`
- **Linux**: Check nx PowerShell doc for resources
  - Ref: https://learn.microsoft.com/en-us/powershell/dsc/reference/resources/linux/lnxuserresource?view=dsc-1.1

### 4. Compile the Configuration
- Compile the imported configuration in Automation Account > State Configuration (DSC) > Configurations

### 5. Assign Configuration to DSC Node
- Assign the compiled configuration to the target VM node

## Applicability
- 21v (Mooncake): Yes
