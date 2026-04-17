# Windows VM Deployment FAQs

Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-vm-deployment-faqs)

## Windows Client Images in Azure
- Windows 7/8/10 available for dev/test with Visual Studio (MSDN) subscription
- Eligibility and Gallery images: see [client images doc](/en-us/azure/virtual-machines/windows/client-images)

## Hybrid Use Benefit (HUB)
- EA subscription: Deploy from pre-configured Marketplace images
- Custom VM: Upload + deploy via ARM template or PowerShell
- Overview: https://azure.microsoft.com/pricing/hybrid-use-benefit/

## Visual Studio Enterprise (BizSpark) Monthly Credit
- Activation: https://azure.microsoft.com/offers/ms-azr-0064p/

## Enterprise Dev/Test Subscription
- Account Owner creates subscriptions (needs EA admin permission)
- Add Visual Studio subscribers as co-administrators

## N-Series GPU VMs
- **Missing drivers**: Install GPU drivers post-deployment (see [sizes-gpu doc](/en-us/azure/virtual-machines/sizes-gpu))
- **Can't find GPU instance**: Install drivers first, check [supported OS and drivers](/en-us/azure/virtual-machines/sizes-gpu#supported-operating-systems-and-drivers)
- **Region availability**: Check [Products by region](https://azure.microsoft.com/regions/services)

## VM Size Family Not Visible During Resize
- Running VMs are pinned to physical clusters
- Classic deployment: Remove cloud service deployment, redeploy
- ARM deployment: Stop all VMs in availability set, then resize

## Availability Set Sizing
- Choose largest expected VM size for first deployment
- Size must be supported on the availability set's cluster
