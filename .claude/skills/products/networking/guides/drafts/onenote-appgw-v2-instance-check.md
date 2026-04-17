# How to Check Application Gateway V2 Instances Information

**Source**: MCVKB/Net/=====1. AppGateway=======/1.6 [NETVKB]How to check the Application Gateway V2 instances information

## Steps

1. **Find Gateway Subscription ID**
   - Open ASC (Azure Support Center) for the Application Gateway V2 resource
   - Locate the "Gateway Subscription Id" field

2. **Check VMSS Details via Jarvis**
   - Go to Jarvis Actions
   - Navigate to: NRP > NRP Subscription Operations > Get NRP Subscription Details
   - Input the Gateway Subscription Id
   - Look for `virtualMachineScaleSets` in the response to find instance details

3. **Check Instance Health via ASC**
   - In ASC, search using the Gateway Subscription Id
   - View the Application Gateway V2 instances and their status

## Notes
- AppGW V2 runs on a VMSS backend managed by Microsoft
- The Gateway Subscription is a Microsoft-internal subscription, not the customer's subscription
- Use this to verify instance count, health status, and underlying VMSS information
