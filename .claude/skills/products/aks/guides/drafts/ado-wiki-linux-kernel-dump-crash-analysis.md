---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Linux/Linux Kernel Dump and Crash Analysis Setup"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FLinux%2FLinux%20Kernel%20Dump%20and%20Crash%20Analysis%20Setup"
importDate: "2026-04-24"
type: guide-draft
---

# Linux Kernel Dump and Crash Analysis on AKS Nodes

## Scenario
AKS node OS crashes recurrently and customer needs root cause analysis.

## Step 1: SSH into AKS node
## Step 2: Install kdump
apt-get update && apt install linux-crashdump -y

## Step 3: Configure kdump
- Set KDUMP_COREDIR to /mnt/crash
- Increase reserved memory to 256M
- Reboot node

## Step 4: Verify kdump is ready
kdump-config show

## Step 5: Analyze crash dump
Use crash utility with debug symbols.
Contact Linux Escalation Team for deeper analysis.
