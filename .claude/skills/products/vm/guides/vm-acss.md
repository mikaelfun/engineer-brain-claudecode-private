# VM ACSS / SAP on Azure — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 12 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACSS registration fails with GivenVmIsNotAscsVm error. The VM provided is not running the ASCS insta | Either the provided VM is not running the SAP ASCS instance, or the SAP system h | Provide the correct VM running the ASCS instance. If multiple MESSAGESERVER inst | 🔵 7.5 | AW |
| 2 | ACSS Register operation fails with AuthorizationFailed. The user-assigned identity for the VIS does  | The user assigned identity for the Virtual Instance for SAP (VIS) does not have  | Assign the built-in role Azure Center for SAP Solutions Service role to the user | 🔵 7.5 | AW |
| 3 | ACSS registration fails with MisconfiguredSapSystem error: more than one ASCS instance found for the | Multiple ASCS instances are present in the SAP system configuration, which is no | Reconfigure SAP system to have only one ASCS instance: 1) Stop sapstartsrv (sapc | 🔵 7.5 | AW |
| 4 | Azure VM screenshot shows OS shutdown with Stopping services message; VM stuck and unresponsive to R | Windows shutdown process performing system maintenance (binary updates, role/fea | Check STOP_PENDING services: Get-Service / Where-Object {$_.Status -eq 'STOP_PEN | 🔵 7.5 | AW |
| 5 | Azure VM shows This is not a bootable disk error due to BCD corruption with missing reference to Win | BCD (Boot Configuration Data) corruption - missing reference in the BCD store to | OFFLINE approach: attach OS disk to rescue VM. Rebuild BCD store using standard  | 🔵 7.5 | AW |
| 6 | Azure VM in reboot loop; screenshots show boot process interrupted and restarting; Event ID 7007 Lev | A third-party service flagged as critical is failing to start, causing OS to res | Disable autoreboot first to see the actual bug check code/error. OFFLINE: attach | 🔵 7.5 | AW |
| 7 | Azure VPN gateway S2S connections to strongSwan VPNs (AWS) both disconnected for extended period | Misconfiguration of pre-shared key on customer side VPN gateway | Customer re-checked VPN configuration and re-configured the pre-shared key; conn | 🔵 7 | ON |
| 8 | ACSS Install deployment fails with InstallScsInstallationFailed. Ansible task has failed during SCS  | Storage account from where the deployer VM picks up the ansible Zip file had iss | Have customer upload ansible logs container (from error message) plus sapinst_de | 🔵 6.5 | AW |
| 9 | ACSS Install deployment fails with zypper return code 7: System management is locked by the applicat | System management (zypper) is locked by another running zypper process on the SL | Restart the VM and retry the install. If issue persists, collect Ansible install | 🔵 6.5 | AW |
| 10 | ACSS registration fails with SAPDBHOSTNotFound error. Failed to discover the database VM; SAPDBHOST  | The SAP system is using the Java stack, which is not supported by Azure Center f | Inform the customer that Java stack is not supported by ACSS. Refer to ACSS Supp | 🔵 6.5 | AW |
| 11 | NFS mount fails with mount.nfs: Remote I/O error | The file share is SMB type, not NFS. Customer is attempting to mount an SMB shar | Verify the share protocol in Azure Portal or ASC Resource Explorer (Files tab >  | 🔵 6.5 | AW |
| 12 | rsync to NFS Azure File Share fails with rsync: chown filename failed: Invalid argument (22). Occurs | NFS v4.1 on Azure Files only accepts numeric UID/GID. NFS v4 passes identities a | Disable ID mapping: echo 'options nfs nfs4_disable_idmapping=1' > /etc/modprobe. | 🔵 6.5 | AW |

## 快速排查路径

1. **ACSS registration fails with GivenVmIsNotAscsVm error. The VM provided is not ru**
   - 根因: Either the provided VM is not running the SAP ASCS instance, or the SAP system has an unsupported configuration with MES
   - 方案: Provide the correct VM running the ASCS instance. If multiple MESSAGESERVER instances found, customer must correct the SAP system configuration to ens
   - `[🔵 7.5 | AW]`

2. **ACSS Register operation fails with AuthorizationFailed. The user-assigned identi**
   - 根因: The user assigned identity for the Virtual Instance for SAP (VIS) does not have the correct permissions assigned for ACS
   - 方案: Assign the built-in role Azure Center for SAP Solutions Service role to the user assigned identity. Alternatively, create a custom role with all requi
   - `[🔵 7.5 | AW]`

3. **ACSS registration fails with MisconfiguredSapSystem error: more than one ASCS in**
   - 根因: Multiple ASCS instances are present in the SAP system configuration, which is not valid. Duplicate sapstartsrv entries i
   - 方案: Reconfigure SAP system to have only one ASCS instance: 1) Stop sapstartsrv (sapcontrol -nr <nr> -function StopService). 2) Go to /usr/sap/<SID>/SYS/gl
   - `[🔵 7.5 | AW]`

4. **Azure VM screenshot shows OS shutdown with Stopping services message; VM stuck a**
   - 根因: Windows shutdown process performing system maintenance (binary updates, role/feature changes). If interrupted, OS corrup
   - 方案: Check STOP_PENDING services: Get-Service | Where-Object {$_.Status -eq 'STOP_PENDING'}. Get PID via tasklist /svc. Take memory dump with procdump -s 5
   - `[🔵 7.5 | AW]`

5. **Azure VM shows This is not a bootable disk error due to BCD corruption with miss**
   - 根因: BCD (Boot Configuration Data) corruption - missing reference in the BCD store to locate the Windows partition. Can occur
   - 方案: OFFLINE approach: attach OS disk to rescue VM. Rebuild BCD store using standard BCD repair commands (bootrec /rebuildbcd, bcdedit). For new VMs migrat
   - `[🔵 7.5 | AW]`

