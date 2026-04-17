# Manually Add a VM to AVD Host Pool (AADDS Environment)

> Source: OneNote case study - Week 3, 8th Nov 2021
> Status: draft (pending SYNTHESIZE review)

## Steps

1. **Join VM to AADDS** - Ensure the VM is domain-joined to Azure AD Domain Services.

2. **Download HostpoolRegistrationKey** - From Azure Portal, navigate to the host pool and generate/download the registration key.

3. **Install Windows Virtual Desktop Agent** - Run the WVD Agent installer on the VM, providing the registration key when prompted.

4. **Install RDAgentBootLoader** - Run the RDAgentBootLoader installer after the WVD Agent is installed.

5. **Verify on the session host** - Check that the following services are running:
   - Remote Desktop Agent Boot Loader (RDAgentBootLoader)
   - Remote Desktop Agent (RDAgent)

6. **Verify on Azure Portal** - Confirm the session host appears in the host pool with status "Available".

7. **Test connection** - Verify end-to-end connectivity by connecting via Remote Desktop client.

## Reference

- [Create AVD Host Pool (PowerShell)](https://docs.azure.cn/zh-cn/virtual-desktop/create-host-pools-powershell?tabs=azure-powershell)
