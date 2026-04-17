---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AD RMS/How To: AD RMS/How To: Restore AD RMS Databases"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FHow%20To%3A%20AD%20RMS%2FHow%20To%3A%20Restore%20AD%20RMS%20Databases"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Introduction

It is possible to restoring an AD RMS cluster from preexisting AD RMS databases. This means if you have a SQL backups if the RMS databases we may rebuild a completely failed RMS cluster.

Generally this works well as long as: 
 - the previous AD RMS server's cluster key password is known, and 
 - the AD RMS trusted publishing domains were centrally managed*.

*AD RMS default software managed keys are stored in the configuration database. A custom software key or an HSM key are not stored in the DB. 

# Recovery
To recover AD RMS by using the original AD RMS databases we'll do the following process.

## Steps
1. On the new AD RMS server to be, add the AD RMS role. Do not configure the role, just add it.
2. Handle the SCP part (discussed below).
3. Run the AD RMS configuiration process.
4. If we did step 2 correctly, our configuration process will be as follows.
 - SQL (this assumes that the SQL DBs are in the same location as before - see below)
   - Choose the Join an existing cluster option
   - Provide the SQL server / instance
   - Select the existing Configuration database
 - Service account
    - Provide the existing AD RMS service account that was configured in the previous cluster
 - Cluster key password
    - Provide the cluster key password that protected the previous AD RMS installation
 - The rest of the wizard

Once completed there is a new AD RMS server, effectively a new member of the existing AD RMS cluster. It will have all the same AD RMS centrally managed trusted publishing domains (TPDs) as before.

## Service Connection Point (SCP)
A crucial part of this process is to have the `join an existing cluster` option in the AD RMS configuration. This option is available if the SCP is registered in AD. 

**Is the RMS SCP (service connection point) still registered in AD?**

Check: [AD RMS How-to: The SCP](https://learn.microsoft.com/en-us/archive/technet-wiki/52869.ad-rms-how-to-the-scp)

### SCP is registered
If the SCP is still registered with the URL from the original AD RMS configuration, we're good. If not, we need to work around it. 

### No SCP
If SCP is not registered, we'll use a registry key on the AD RMS server that is to be configured.

Add the AD RMS role to the server. Once the AD RMS role is added the registry key is present. We need to add the `GICURL` value. In the example below I am using the SCP URL from the SCP wiki article. This URL should be the previous AD RMS cluster's SCP URL.
```
HKLM\Software\Microsoft\DRMS
Name:  GICURL
Type:  REG_SZ
Value: "https://ipc.relecloud.com/_wmcs/certification"
```

Once the `GICURL` is correctly configured, the "join an existing cluster" option will be available in the RMS role configuration wizard. 


## SQL
If the AD RMS databases reside in the same SQL server and instance as before, no extra steps are needed. 

If the AD RMS databases are in a different location we need follow the steps `Modify newly restore database settings` in [Relocating the AD RMS database - The simple but complete guide](https://learn.microsoft.com/en-us/archive/technet-wiki/14887.relocating-the-ad-rms-database-the-simple-but-complete-guide)
