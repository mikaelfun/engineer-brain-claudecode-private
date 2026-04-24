# VM Sysprep 与镜像泛化 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 9 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VM deployed from custom Windows image fails with OSPTO (OS Provisioning Timeout) error; VM never com | Windows custom image not properly generalized: sysprep generalize not run, or VM | Troubleshooting: 1) Check C:\Windows\Panther\setupact.log for OS setup start (In | 🟢 8 | ON |
| 2 | After sysprep and capture of AVD/WVD session host VM, the new VM created from the captured image is  | Sysprep removes WVD agent registration. The RD Infrastructure Agent needs to be  | 1) Check RD services are running (RD Agent Loader, RD Configuration, RD Services | 🟢 8 | ON |
| 3 | Azure Windows VM screenshot shows an administrative CMD window with title 'Administrator: ERROR HAND | ErrorHandler.CMD is part of the IaaS provisioning agent that should only run dur | The image is likely broken. Change support topic to: Product: Azure Virtual Mach | 🔵 7.5 | AW |
| 4 | Azure VM screenshot shows 'Windows could not complete the installation. To install Windows in this c | Machine is performing first boot of a generalized image and failed to complete t | Image is unrecoverable. Customer must recreate the generalized image. Change sup | 🔵 7.5 | AW |
| 5 | Azure VM screenshot shows 'Windows could not finish configuring the system. To attempt to resume con | Machine is performing first boot of a generalized image and failed to complete t | Image is unrecoverable. Customer must recreate the generalized image. Change sup | 🔵 7.5 | AW |
| 6 | Cannot create Gallery Image Version - Conflict error: source image OS type, Hypervisor generation, o | Source image properties (OS type Windows/Linux, VM generation V1/V2, OS state Ge | Select a source image matching the Image Definition properties, or create a new  | 🔵 6.5 | AW |
| 7 | Azure Windows VM shows 'Windows could not finish configuring the system. To attempt to resume config | The OS is unable to complete the Sysprep process. Occurs on initial boot of a ge | The image cannot be recovered. Recreate the generalized image following Azure gu | 🔵 6.5 | ML |
| 8 | Windows installation error during VM boot: The computer restarted unexpectedly or encountered an une | Custom Unattend.xml answer file used with sysprep generalize. Custom answer file | Re-run sysprep without /unattend flag: sysprep /oobe /generalize /shutdown. Do n | 🔵 5.5 | ML |
| 9 | VM error: OSProvisioningTimedOut - OS provisioning did not finish in allotted time. VM guest agent d | Image not properly generalized (sysprep for Windows / waagent -deprovision for L | Ensure image is properly prepared/generalized. If guest agent detected but times | 🔵 5.5 | ML |

## 快速排查路径

1. **VM deployed from custom Windows image fails with OSPTO (OS Provisioning Timeout)**
   - 根因: Windows custom image not properly generalized: sysprep generalize not run, or VM powered on after sysprep completed, or 
   - 方案: Troubleshooting: 1) Check C:\Windows\Panther\setupact.log for OS setup start (InstallWindows:Setup Phase = 4); 2) Check C:\Windows\System32\Sysprep\Pa
   - `[🟢 8 | ON]`

2. **After sysprep and capture of AVD/WVD session host VM, the new VM created from th**
   - 根因: Sysprep removes WVD agent registration. The RD Infrastructure Agent needs to be reinstalled with a fresh registration to
   - 方案: 1) Check RD services are running (RD Agent Loader, RD Configuration, RD Services, RD UserMode Port Redirector). 2) Check registry HKLM\Software\Micros
   - `[🟢 8 | ON]`

3. **Azure Windows VM screenshot shows an administrative CMD window with title 'Admin**
   - 根因: ErrorHandler.CMD is part of the IaaS provisioning agent that should only run during initial provisioning from a generali
   - 方案: The image is likely broken. Change support topic to: Product: Azure Virtual Machine - Windows, Support Topic: Cannot create a VM > I am unable to depl
   - `[🔵 7.5 | AW]`

4. **Azure VM screenshot shows 'Windows could not complete the installation. To insta**
   - 根因: Machine is performing first boot of a generalized image and failed to complete the sysprep process. The image is in UNDE
   - 方案: Image is unrecoverable. Customer must recreate the generalized image. Change support topic to 'Cannot create a VM > Unable to deploy a captured or gen
   - `[🔵 7.5 | AW]`

5. **Azure VM screenshot shows 'Windows could not finish configuring the system. To a**
   - 根因: Machine is performing first boot of a generalized image and failed to complete the sysprep process. The image is in UNDE
   - 方案: Image is unrecoverable. Customer must recreate the generalized image. Change support topic to 'Cannot create a VM > Unable to deploy a captured or gen
   - `[🔵 7.5 | AW]`

