# VM Azure Files Mac/Linux 客户端 — 排查速查

**来源数**: 1 (AW) | **条目**: 5 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Files klist get cifs/<sa>.file.core.windows.net fails with error 0xc000018b/-1073741429: The S | Client machine computer account trust with the domain controller is broken, or t | 1) Verify client is domain-joined: dsregcmd /status. 2) Check storage SPN: setsp | 🔵 7.5 | AW |
| 2 | Error 1396 after Windows Update (Nov 2022+) disabled RC4 encryption on DC, breaking previously worki | Windows patches (KB5021131, CVE-2022-37966) disabled RC4-HMAC and enabled AES-25 | 1) Verify SamAccountName matches: Get-ADUser vs Get-AzStorageAccount properties. | 🔵 7.5 | AW |
| 3 | Users unable to access Azure Files shares configured for AD DS authentication from machines where Mi | Client machine is configured to use Cloud Kerberos (Microsoft Entra Kerberos) an | Create Realm-To-Host mapping for each storage account joined to AD DS. Options:  | 🔵 7.5 | AW |
| 4 | Azure VM screenshot shows 'Windows could not finish configuring the system. To attempt to resume con | Machine is performing first boot of a generalized image and failed to complete t | Image is unrecoverable. Customer must recreate the generalized image. Change sup | 🔵 7.5 | AW |
| 5 | Cannot RDP to Azure VM with generic 'Remote Desktop cannot connect' three-reasons error; PSPING resp | Remote Desktop Services connection was disabled on the machine by the customer | Re-enable Remote Desktop Services connection: ONLINE via Serial Console using TS | 🔵 6.5 | AW |

## 快速排查路径

1. **Azure Files klist get cifs/<sa>.file.core.windows.net fails with error 0xc000018**
   - 根因: Client machine computer account trust with the domain controller is broken, or the storage account computer/service logo
   - 方案: 1) Verify client is domain-joined: dsregcmd /status. 2) Check storage SPN: setspn -q cifs/<sa>.file.core.windows.net. 3) If SPN missing, re-run Join-A
   - `[🔵 7.5 | AW]`

2. **Error 1396 after Windows Update (Nov 2022+) disabled RC4 encryption on DC, break**
   - 根因: Windows patches (KB5021131, CVE-2022-37966) disabled RC4-HMAC and enabled AES-256 on DCs. SamAccountName may not match b
   - 方案: 1) Verify SamAccountName matches: Get-ADUser vs Get-AzStorageAccount properties. 2) Re-run Join-AzStorageAccount with latest AzFilesHybrid module, or 
   - `[🔵 7.5 | AW]`

3. **Users unable to access Azure Files shares configured for AD DS authentication fr**
   - 根因: Client machine is configured to use Cloud Kerberos (Microsoft Entra Kerberos) and requests Kerberos TGS ticket from Micr
   - 方案: Create Realm-To-Host mapping for each storage account joined to AD DS. Options: (1) Intune Policy CSP: configure Kerberos/HostToRealm; (2) Group Polic
   - `[🔵 7.5 | AW]`

4. **Azure VM screenshot shows 'Windows could not finish configuring the system. To a**
   - 根因: Machine is performing first boot of a generalized image and failed to complete the sysprep process. The image is in UNDE
   - 方案: Image is unrecoverable. Customer must recreate the generalized image. Change support topic to 'Cannot create a VM > Unable to deploy a captured or gen
   - `[🔵 7.5 | AW]`

5. **Cannot RDP to Azure VM with generic 'Remote Desktop cannot connect' three-reason**
   - 根因: Remote Desktop Services connection was disabled on the machine by the customer
   - 方案: Re-enable Remote Desktop Services connection: ONLINE via Serial Console using TS-RDP-Enable EMS template, or OFFLINE by attaching OS disk to rescue VM
   - `[🔵 6.5 | AW]`

