# Disk Azure Import/Export Service — 详细速查

**条目数**: 3 | **类型**: 📊 速查（无融合素材）
**生成日期**: 2026-04-07

---

### 1. Customer receives incorrect files in Azure Import-Export export job; unwanted snapshots fill the dri

**分数**: 🟢 8.5 | **来源**: [ADO Wiki] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Customer selected Export all option instead of specific files/containers; all snapshots in storage account (including Azure Site Recovery snapshots) exported until drives full

**方案**: Use Selected containers and blobs or Export from blob list file (XML) option instead of Export all; if using Azure Site Recovery, temporarily stop or modify snapshot retention settings before export

**标签**: import-export, export-job, incorrect-files, snapshots

---

### 2. Unable to create Azure Import-Export import job in portal; error related to journal file (.jrn) from

**分数**: 🟢 8.5 | **来源**: [ADO Wiki] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Journal file is either incomplete (missing XML output at end) or exceeds the 2MB limit (waimport.exe v1 only)

**方案**: Check journal file for complete XML at end; if incomplete: v1 - regenerate with /skipwrite parameter; v2 - recopy data to drives; if exceeds 2MB limit: use the _DriveInfo_<SerialID>.xml file instead to create the import job

**标签**: import-export, import-job, journal-file, waimportexport

---

### 3. Case misrouted to Azure Storage Devices queue; common misroutes include PST migration, on-premises d

**分数**: 🟢 8.5 | **来源**: [ADO Wiki] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Keywords like gateway, edge, Azure Stack, import-export cause routing confusion with other Azure products

**方案**: PST migration via network upload: reroute to Security > Purview > Import Service. On-premises data gateway: reroute to Logic App/Power Apps/Power Automate. Azure VMs: reroute to VM Running on Windows/Linux. AKS: reroute to Kubernetes Service. Azure Stack Hub: reroute to Azure Stack Hub. Azure Local (HCI): reroute to Azure Local. AP5GC/AKS on ASE: reroute to Azure Private 5G Core

**标签**: azure-storage-devices, misroute, routing, sap

---

