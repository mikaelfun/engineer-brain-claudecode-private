---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Mdsd - core dump or gcore"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Mdsd%20-%20core%20dump%20or%20gcore"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This article covers how to acquire a memory dump for mdsd.

# Applies to
- This has only been tested on RHEL 8 so far. That is not to say that it doesn't work on others, just that it hasn't yet been tested/validated on others.

# Scenario: Mdsd is crashing
In this scenario, we need mdsd to write a memory dump when it crashes (SIGABRT, SIGSEGV, etc.), so we can see what was in the memory right before it crashed.

```
# Reference (Enabling Core Dumps on RHEL)
## https://access.redhat.com/solutions/4896

# Take note of each abrt-* service status
systemctl status abrt-*

# If so, stop those services
# systemctl stop {abrtServiceName}

# Take note of ulimit value
ulimit

# If not unlimited, set ulimit to unlimited
# ulimit -S -c unlimited > /dev/null 2>&1

# Allow users of the system to dump core files
# vi /etc/security/limits.conf

# Add the following line before line '# End of file':
## mdsd runs as the syslog user
syslog soft core 0

# Take note of current core dump locations
cat /proc/sys/kernel/core_pattern

# RHEL default
## echo "|/usr/lib/systemd/systemd-coredump %P %u %g %s %t %c %h %e" > /proc/sys/kernel/core_pattern

# Set the location for core dumps
# Example of file will be /tmp/core.589483
echo "/tmp/core" > /proc/sys/kernel/core_pattern

# Take note of current mdsd options
cat /etc/default/azuremonitoragent

# Set the mdsd tracing options to include -C (captial)
# export MDSD_OPTIONS="-A -c /etc/opt/microsoft/azuremonitoragent/mdsd.xml -d -r $MDSD_ROLE_PREFIX -S $MDSD_SPOOL_DIRECTORY/eh -L $MDSD_SPOOL_DIRECTORY/events -C"

# Restart azure monitor agent service
systemctl restart azuremonitoragent

# Reproduce issue and collect dump
tail -f /var/opt/microsoft/azuremonitoragent/log/mdsd.err

# If applicable, set location for core dumps back to original location
# If applicable, set ulimit values back to original
# If applicable, set abrt-* services back to original state

# If you need to simulate a crash, you can use this command
# The below command will list all possible kill signals
# kill -L

# kill -6 {pidOfMDSD}
```

# Scenario: Mdsd is running and we need memory dump
In some cases, AMA is running, but it's not doing what we expect it to do and we need to analyze its memory. In this scenario, we can do this unobtrusively (process is paused, memory is captured to a dump file, and then process is resumed). 

```
# is gdb installed?
rpm -qa | grep gdb
# if gdb is NOT installed
# yum install gdb
cd /tmp
# wait for issue to repro
gcore -a $(pidof mdsd)
```

Output will look like this:
![image.png](/.attachments/image-43fd7242-da1b-4779-aae5-4f050bb16a2b.png)
![image.png](/.attachments/image-f18baa99-c512-4cab-852c-9c0c94072dc1.png)
# Scenario: Amacoreagent is running and we need memory dump
In some cases, AMA is running, but it's not doing what we expect it to do and we need to analyze its memory. In this scenario, we can do this unobtrusively (process is paused, memory is captured to a dump file, and then process is resumed). 

```
# is gdb installed?
rpm -qa | grep gdb
# if gdb is NOT installed
# yum install gdb
cd /tmp
# wait for issue to repro
gcore -a $(pidof amacoreagent)
```