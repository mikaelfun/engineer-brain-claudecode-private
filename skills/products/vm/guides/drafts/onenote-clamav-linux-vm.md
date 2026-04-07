# ClamAV Antivirus Installation on Linux VM

> Source: OneNote MCVKB 3.1 | Draft - pending SYNTHESIZE review

## Overview
Open-source antivirus for Linux VMs. Note: ClamAV is community-supported, no official tech support.

> Tested on CentOS 7.4. Adjust for other distros.

## Installation

1. Download RPM packages:
```bash
wget --no-check-certificate http://www6.atomicorp.com/channels/atomic/centos/7/x86_64/RPMS/clamd-0.99.3-3470.el7.art.x86_64.rpm
wget --no-check-certificate http://www6.atomicorp.com/channels/atomic/centos/7/x86_64/RPMS/clamav-db-0.99.3-3470.el7.art.x86_64.rpm
wget --no-check-certificate http://www6.atomicorp.com/channels/atomic/centos/7/x86_64/RPMS/clamav-0.99.3-3470.el7.art.x86_64.rpm
```

2. Install:
```bash
rpm -ivh clamav-db-*.rpm
rpm -ivh clamav-*.rpm
rpm -ivh clamd-*.rpm
```

## Configuration (/etc/freshclam.conf)
- Comment out `Example` line
- Set `DatabaseOwner root`
- Uncomment `UpdateLogFile /var/log/freshclam.log`
- Set `LogFileMaxSize 20M`
- Uncomment `LogRotate yes`, `LogTime yes`
- Uncomment `DatabaseDirectory /var/lib/clamav`

## Update Virus Database
```bash
mkdir /var/lib/clamav
chmod 755 /var/lib/clamav/
freshclam --datadir=/var/lib/clamav/   # First update: 30+ minutes
```

## Scan
```bash
clamscan -ri /path/to/scan
```
Options: `-r` recursive, `-I` infected only, `--remove` delete infected (not recommended, review manually)

## Scheduled Scanning (cron)
```
30 2 * * * /bin/freshclam --datadir=/var/lib/clamav/
30 3 * * * /bin/clamscan -ri /path/to/scan | mail -s "clamscan daily report" your@email.com
```
Schedule during off-peak hours.
