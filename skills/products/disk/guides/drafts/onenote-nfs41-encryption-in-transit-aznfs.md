# NFS 4.1 Encryption in Transit (aznfs) Setup & Troubleshooting

> Source: OneNote — [NFS]NFS4.1 Encryption in Transit(aznfs) + Temp workaround
> Quality: guide-draft (pending SYNTHESIZE review)

## Overview

Azure Files NFS 4.1 supports Encryption in Transit (EiT) via the `aznfs` mount helper, which uses **stunnel** for TLS tunneling. Two watchdog daemons run: `aznfswatchdog` (NFSv3) and `aznfswatchdogv4` (NFSv4.1).

Wiki: [Encryption in Transit for Azure Files NFSv4.1 Overview](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/2162995/Encryption-in-Transit-for-Azure-Files-NFSv4.1-Overview_Storage)

## Setup — Linux VM

1. Enable "Enforce Encryption in Transit" on the Azure Files share (Portal)
2. Install aznfs mount helper (Ubuntu):
   ```bash
   curl -sSL -O https://packages.microsoft.com/config/$(source /etc/os-release && echo "$ID/$VERSION_ID")/packages-microsoft-prod.deb
   sudo dpkg -i packages-microsoft-prod.deb
   sudo apt-get update
   sudo apt-get install aznfs
   ```
3. Mount using `aznfs` type:
   ```bash
   sudo mkdir -p /mount/nfsshare
   sudo mount -t aznfs <account>.file.core.windows.net:/<account>/<share> /mount/nfsshare \
     -o vers=4,minorversion=1,sec=sys,nconnect=4
   ```

## Setup — AKS

- Requires CSI driver **v1.33.0+** with `encryptInTransit: "true"` in StorageClass
- AKS Identity needs **Contributor** on VNET resource group and Storage Account
- StorageClass example:
  ```yaml
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    name: azurefile-nfs-encrypt-41
  provisioner: file.csi.azure.com
  parameters:
    protocol: nfs
    skuName: Premium_LRS
    storageAccount: <account>
    resourceGroup: <rg>
    encryptInTransit: "true"
  mountOptions:
    - nconnect=4
    - noresvport
    - actimeo=30
  ```
- Private DNS + VNET integration required

## Troubleshooting Logs

| Log/Tool | Location/Command |
|----------|-----------------|
| AZNFS log | `/opt/microsoft/aznfs/data/aznfs.log` |
| Stunnel log | `/etc/stunnel/microsoft/aznfs/nfsv4_fileShare/logs/stunnel_<IP>.log` |
| PCAP | `tcpdump -i eth0 -p -s 0 port 2049 -n -w /tmp/repro.pcap` |
| NFS mount info | `nfsstat -m` |
| Stunnel status | `sudo netstat -anp \| grep stunnel` |
| Watchdog status | `sudo systemctl status aznfswatchdog*` |

TSG wiki: [Encryption in Transit Troubleshooting](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/2162994/Encryption-in-Transit-Azure-Files-NFSv4.1-Troubleshooting_Storage)

## Mooncake (21v) — DigiCert G1/G2 Cert Issue

**Problem**: MC storage endpoints use DigiCert Global Root CA (G1), but aznfs stunnel config pins G2. Mount fails with "unable to get local issuer certificate".

**Temp Mitigation** (trust both G1 and G2):

### Debian/Ubuntu/SUSE
```bash
mv /etc/ssl/certs/DigiCert_Global_Root_G2.pem /etc/ssl/certs/DigiCert_Global_Root_G2_Backup.pem
cat /etc/ssl/certs/DigiCert_Global_Root_CA.pem /etc/ssl/certs/DigiCert_Global_Root_G2_Backup.pem > /etc/ssl/certs/DigiCert_Global_Root_G2.pem
```

### RHEL/CentOS/Fedora
```bash
# Extract certs if not in /etc/ssl/certs/
awk '/DigiCert Global Root CA/ {found=1} found && /BEGIN CERTIFICATE/,/END CERTIFICATE/ {print > "/etc/ssl/certs/DigiCert_Global_Root_CA.pem"} found && /END CERTIFICATE/ {exit}' /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
awk '/DigiCert Global Root G2/ {found=1} found && /BEGIN CERTIFICATE/,/END CERTIFICATE/ {print > "/etc/ssl/certs/DigiCert_Global_Root_G2.pem"} found && /END CERTIFICATE/ {exit}' /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
mv /etc/ssl/certs/DigiCert_Global_Root_G2.pem /etc/ssl/certs/DigiCert_Global_Root_G2_Backup.pem
cat /etc/ssl/certs/DigiCert_Global_Root_G2_Backup.pem /etc/ssl/certs/DigiCert_Global_Root_CA.pem > /etc/ssl/certs/DigiCert_Global_Root_G2.pem
```

### After G2 migration completes
```bash
mv /etc/ssl/certs/DigiCert_Global_Root_G2_Backup.pem /etc/ssl/certs/DigiCert_Global_Root_G2.pem
```

### If CAs missing on VM
Download and install:
- G1: https://www.digicert.com/CACerts/DigiCertGlobalRootCA.crt
- G2: https://www.digicert.com/CACerts/DigiCertGlobalRootG2.crt

Then `update-ca-certificates` (Debian/SUSE) or `update-ca-trust extract` (RHEL).

## Non-AKS K8s Manual Stunnel Setup

For non-AKS K8s clusters, deploy a privileged pod with stunnel installed, configure stunnel.conf with `accept = 127.0.0.1:20049` and `connect = <storage_IP>:2049`, then mount NFS via localhost:20049.
