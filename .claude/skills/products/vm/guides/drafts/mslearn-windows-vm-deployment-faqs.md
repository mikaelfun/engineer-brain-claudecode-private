---
title: Windows VM Deployment FAQs
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-vm-deployment-faqs
product: vm
21vApplicable: true
---

# Windows VM Deployment FAQs

## Windows Client Images in Azure
- Use Windows 7/8/10 in Azure for dev/test with Visual Studio (MSDN) subscription
- Windows 10 images available from Azure Gallery within eligible dev/test offers
- Custom Windows client images can be uploaded to Azure

## Azure Hybrid Use Benefit (HUB)
- Enterprise Agreement: Deploy from pre-configured Marketplace images
- Upload custom VM and deploy using ARM template or Azure PowerShell

## Visual Studio Enterprise (BizSpark) Monthly Credit
- Activate via Azure offers page

## Enterprise Dev/Test Subscription
- Requires Account Owner permission from Enterprise Administrator
- Add active Visual Studio subscribers as co-administrators

## N-Series VM GPU Drivers
- Must install graphics drivers on each VM after deployment
- Driver setup: https://learn.microsoft.com/en-us/azure/virtual-machines/sizes-gpu#supported-operating-systems-and-drivers

## VM Resize - Size Family Not Visible
- Classic VMs: Must remove and redeploy cloud service deployment
- Resource Manager VMs: Must stop all VMs in availability set before resizing any VM

## Availability Set Size Support
- Choose largest VM size needed as first deployment
- Subsequent VMs must use sizes supported by the availability set cluster
