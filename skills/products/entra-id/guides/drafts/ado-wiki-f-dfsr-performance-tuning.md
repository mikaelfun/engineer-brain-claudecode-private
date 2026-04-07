---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/Workflow: DFSR: FAQ || Customer education (in-depth)/Performance expectations, tuning and optimizations"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FWorkflow%3A%20DFSR%3A%20FAQ%20%7C%7C%20Customer%20education%20(in-depth)%2FPerformance%20expectations%2C%20tuning%20and%20optimizations"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## DFSR Performance Expectations, Tuning and Optimizations

### Setting Expectations

DFSR has limited resources for replicating files as soon as they are created/modified. Performance depends on:
- Number of partners and files
- Network bandwidth and latency
- Server CPU, memory, and disk resources

### Scalability Guidelines (Windows Server 2012 R2)

| Metric | Win Server 2012 R2 | Win Server 2012/2008 R2 |
|--------|-------------------|------------------------|
| Total replicated files on server | 100 TB | 10 TB |
| Replicated files per volume | 70 million | 11 million |
| Maximum file size | 250 GB | 64 GB |

No limits on replication groups, replicated folders, connections, or members.

### Multiple Hubs Design

Avoid overloading centralized hub servers. Distribute replication topology across multiple hubs to reduce bottlenecking.

### Read-Only DFSR

- Read-only replicated folders cannot be modified locally; updates come only from read-write members
- Used by RODCs to keep SYSVOL updated
- WARNING: Converting to read-only overwrites content not yet replicated to a read-write member
- Converting between read-only and writable triggers initial sync

### One-Way Replication (UNSUPPORTED)

- One-way connections cause topology errors, staging issues, and database problems
- Use read-only replicated folders instead
- Disabled connections >60 days is also unsupported

### Sharing Violations

- Files opened without shared access prevent DFSR replication
- Logs Event ID 4302 repeatedly
- Wastes upstream resources (staging/compression for failed transfers)

### Backlogs

- Backlog = updates a member has not processed
- Normal occurrence when update rate exceeds replication capacity
- Report generation (DFSRDiag/WMI/PowerShell) is expensive; run at most once per hour

### Database

JET database maintains version chain vector and resource records including tombstones. Invalid/missing database triggers recovery operations.

### FSRM Interaction

WARNING: FSRM quotas can prevent DFSR internal operations. FSRM file screens may also interfere. Reference KB959210.

### Performance Tuning

#### Registry Settings
- Windows Server 2012/2012 R2: little/no tuning needed
- Windows Server 2008 R2: apply settings from "Tuning replication performance in DFSR" blog (these are defaults in 2012+)

#### Staging Area
- Size staging to match commonly modified data
- Exceeding staging quota with >=15 inbound tasks halts ALL replication on the server
- Exceeding with >=16 outbound RPC requests blocks all RPC serving
- Larger staging = better performance, less CPU/disk overhead

#### Antivirus Exclusions

Exclude DFSR database and working folders per volume:
- Path: `\System Volume Information\DFSR`
- Files to exclude: `$db_normal$`, `FileIDTable_*`, `SimilarityTable_*`, `*.xml`, `$db_dirty$`, `$db_clean$`, `$db_lost$`, `Dfsr.db`, `Fsr.chk`, `*.frx`, `*.log`, `Fsr*.jrs`, `Tmp.edb`
- Reference: KB822158
