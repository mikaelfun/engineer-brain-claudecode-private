# Disk Storage Spaces & S2D — 详细速查

**条目数**: 5 | **类型**: 📊 速查（无融合素材）
**生成日期**: 2026-04-07

---

### 1. A standalone storage pool was created by using 10 Physical Disk and out of which the virtual disk wa

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: All the Physical disk which were presented in the storage pool had it's Free space was zero.Log Name:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SystemSource:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; diskDate:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 02.03.2020 17:54:19Event ID:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 150Task Category: NoneLevel:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ErrorKeywords:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ClassicUser:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; N/AComputer:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Machine Name (Changed)Description:Disk 56 has reached a logical block provisioning permanent resource exhaustion condition

**方案**: Add number of physical disk equal to number of column count to Storage pool.

**标签**: contentidea-kb

---

### 2. On storage spaces, while running the command get-physicaldisk it was not returning any value even th

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: &nbsp;Microsoft Storage Spaces SMP Service was disabled.

**方案**: Resolution: Set the SMP Service to Manual and restarted the service, post which we were able to get the output of all the commands.

**标签**: contentidea-kb

---

### 3. Consider the following Scenario:Single WS19/WS16 Server with Standalone Storage Spaces (no S2D)Custo

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: When the Parity VDisks was created Spaces automatically created a write cache region for these Parity VDisks on the SSD's. If you have enough SSD capacity and number of SSDs, it should actually create a 1GB write cache size by default.&nbsp; It will create a mirror write cache child space with number of copies that matches the parent space.&nbsp; So, for single parity, it will create a 2 copy mirror for the write cache child space. &nbsp;If only HDD's exist in a Storage Pool and a Parity VDisk is created Spaces will create the write cache region from inside the HDD's. Size of this region is 32MB by default.For parity Vdisks, the write cache is required to front any writes that do not make up a full parity row size.&nbsp; This is why it is created even for the all HDD pool.So for a parity Vdisk the Write-Cache Region it is required to be non-zero.&nbsp; For simple or mirror, it can be 0.Get-VirtualDisk | fl *&nbsp;&nbsp;Usage&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : DataNameFormat&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :OperationalStatus&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : OKHealthStatus&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: HealthyProvisioningType&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : FixedAllocationUnitSize&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : 1073741824MediaType&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : UnspecifiedParityLayout&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : Rotated ParityAccess&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : Read/WriteUniqueIdFormat&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : Vendor SpecificDetachedReason&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : NoneWriteCacheSize&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : 33554432There isn't a way to move the write cache disks from SSD to HDD after it has been created.&nbsp;

**方案**: Add new SSD's as Journal Disks and remove the old SSD's from the Pool Delete the Virtual Disk(s), remove all unwanted SSD's and re-create the Parity Virtual Disk (this will have Spaces create the Write Cache from HDD pool)

**标签**: contentidea-kb

---

### 4. Issue:Storage pool is down.Three node S2D cluster.Recent change:Physical location of the data-center

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: 1.Get-physical disk shows that capacity drive for two of the three nodes as lost communication.2&gt; Running&nbsp;get-storagenode -name XX | get-physicaldisk -physicallyconnected on problematic node does not give any output for the capacity drives.3&gt; The SBL section shows that capacity drives for the problematic node has binding issue with the cache device: Keyword:CacheDiskStateOrphanedWaiting.4&gt; Whereas working node SBL section for the capacity drive has the entry below:CacheDiskStateInitializedAndBound5&gt; Binding of the capacity drives to the cache drive was unbound in the problematic nodes.&nbsp;

**方案**: Binding is an&nbsp;SBL-level operation which associates a capacity device with a cache device. Rebinding usually implies breaking an existing binding because of a failed cache device, and binding to a functional cache device. Because this can be done with data still only staged in the cache device, breaking the binding can result in&nbsp;losing that copy of data. So before running any rebind operations, you should: Ensure the cache device has actually failed. If it is recoverable through a reboot or some other operation, that should be the first course of action. Ensure repairs have made as much progress as possible. Spaces should be able to get healthy unless failures have happened across multiple nodes. If you are unsure of why the system is in the state it is in, it is best to engage the PG before running any rebind operations. Ensure you only run commands against&nbsp;one node at a time&nbsp;if multiple devices are impacted and&nbsp;wait for repair after each command is run. Rebind can be accomplished against a node using the below command. Do not run without the -Node parameter, as that will run across all nodes in the cluster and potentially result in&nbsp;data loss. The functionality of running across all nodes in the cluster will be removed in a future update. Repair-ClusterS2D -RecoverUnboundDrives -Node &quot;Nodename&quot; &nbsp; Note: The above command should only be executed after the proper log analysis and only when the storage pool is down: S2D on XX Read-only Unknown False True In case, if the storage pool is up we can run optimize-storagepool. &nbsp; For the latest information, read here:&nbsp;S2D Troubleshooting/Physical Disks - OSGWiki

**标签**: contentidea-kb

---

### 5. SOFS (Scale-Out File Server) share creation fails and share properties report error: 'Error Retrievi

**分数**: 🔵 7.5 | **来源**: [KB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: NullSessionShares registry value under LanManServer\Parameters was configured as REG_SZ (String) instead of REG_MULTI_SZ (Multi-String), causing WMI query Get-SmbServerConfiguration to fail.

**方案**: Delete the incorrectly typed registry value (NullSessionShares REG_SZ) under HKLM\System\CurrentControlSet\Services\LanManServer\Parameters, then run GPUPDATE /FORCE. If the value does not reappear, it was a one-time script/reg add change.

**标签**: SOFS, SMB, registry-type-mismatch, NullSessionShares, contentidea-kb

---

