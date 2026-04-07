---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Encryption in Transit NFSv4.1 How to collect NFS client and network traces_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FHow%20Tos%2FEncryption%20in%20Transit%20NFSv4.1%20How%20to%20collect%20NFS%20client%20and%20network%20traces_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# NFSv4.1 - How to Collect NFS Client and Network Traces

## Method 1: Linux NFS Log Collection Script (nfsclientlogs.sh)

**Dependencies:** Install `trace-cmd`, `tcpdump`, `zip`

### If issue is easily reproducible

```bash
chmod +x ./nfsclientlogs.sh
sudo ./nfsclientlogs.sh v4 start
# For NFSv4 with network capture:
sudo ./nfsclientlogs.sh v4 start CaptureNetwork
# For NFSv3: sudo ./nfsclientlogs.sh v3 start
# For NFSv3 Blob: sudo ./nfsclientlogs.sh v3b start CaptureNetwork

# Reproduce the issue

sudo ./nfsclientlogs.sh v4 stop
# Generates nfs_debug.zip (contains: nfs_dmesg, nfs_trace, nfs_traffic.pcap)
```

### If issue is sporadic (OnAnomaly mode)

```bash
sudo ./nfsclientlogs.sh v4 start OnAnomaly
# eBPF script auto-detects error trace points and generates nfs_debug.zip
```

### BPF Installation from Source

```bash
sudo apt-get -y install bison build-essential cmake flex git libedit-dev \
  llvm clang libclang-12-dev python zlib1g-dev libelf-dev python3-distutils
git clone https://github.com/iovisor/bcc.git
mkdir bcc/build; cd bcc/build
cmake ..
make
sudo make install
cmake -DPYTHON_CMD=python3 ..
pushd src/python/
make
sudo make install
popd
```

## Method 2: Gather Both NFS and WireShark Diagnostics

```bash
sudo bash
dmesg -Tc > /tmp/dmesg-old.txt   # clear dmesg log
rm /tmp/repro.pcap
rpcdebug -m rpc -s all
rpcdebug -m nfs -s all
tcpdump -i eth0 -p -s 0 port 2049 -n -w /tmp/repro.pcap &
[1] <tcpdump-processID>
# Note: eth0 is typical; run 'ifconfig' to confirm network interface

# *** Reproduce the issue ***

rpcdebug -m rpc -c all
rpcdebug -m nfs -c all
dmesg -T > /tmp/nfs-repro.txt
kill <tcpdump-processID>
# Route /tmp/nfs-repro.txt and /tmp/repro.pcap to Azure Files team
```

## Method 3: NFS-Only Diagnostics

```bash
sudo bash
dmesg -Tc > /tmp/dmesg-old.txt
rpcdebug -m rpc -s all
rpcdebug -m nfs -s all

# *** Reproduce the issue ***

rpcdebug -m rpc -c all
rpcdebug -m nfs -c all
dmesg -T > /tmp/nfs-repro.txt
# Route /tmp/nfs-repro.txt to Azure Files team
```

## Visualizing WireShark PCAP

1. Download Wireshark: https://www.wireshark.org/download.html
2. Double-click the PCAP file (or File > Open).
3. Optional: filter to NFS by typing `nfs` in the display filter.

## RPCDebug Module Flags Reference

```
Module     Valid flags
rpc        xprt call debug nfs auth bind sched trans svcsock svcdsp misc cache all
nfs        vfs dircache lookupcache pagecache proc xdr file root callback client mount fscache pnfs pnfs_ld state all
nfsd       sock fh export svc proc fileop auth repcache xdr lockd all
nlm        svc client clntlock svclock monitor clntsubs svcsubs hostcache xdr all
```
