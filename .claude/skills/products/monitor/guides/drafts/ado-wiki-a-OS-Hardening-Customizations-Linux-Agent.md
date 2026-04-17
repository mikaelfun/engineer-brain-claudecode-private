---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/Troubleshooting Guides/Required permissions for OS Hardening Customizations - Linux Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FOMS%20Agent%20for%20Linux%20%28omsagent%29%2FTroubleshooting%20Guides%2FRequired%20permissions%20for%20OS%20Hardening%20Customizations%20-%20Linux%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# OMS Linux Agent - OS Hardening & Customization Guide

## Policy

Supported industry-standard hardening: FIPS (since OMS 1.13), Cylance (since OMS 1.12).
NOT fully supported yet: SELinux, CIS.

Custom hardening scripts, restrictive resource limits, changed folder permissions, or overriding distro packages (OpenSSL, Curl, Ruby) are **not supported**.

## Supported Hardening

### FIPS

FIPS support added in OMS 1.13. Detection:
```bash
cat /proc/sys/crypto/fips_enabled    # 1 = enabled
sysctl crypto.fips_enabled
```

### Cylance Anti-Virus

**Problem:** OMS Ruby segfaults with Cylance installed due to Cylance + Jemalloc incompatibility.
```
gdb: SIGSEGV in stacklookup_check() from /opt/cylance/desktop/cymemdeflinux_x64.so
```
**Fix:** OMS 1.12+ disables Jemalloc at install time when Cylance is detected.

## Unsupported Hardening Scenarios (with Workarounds)

### Directory Permissions

Required permissions:
| Path | Permission |
|------|-----------|
| /var | 755 |
| /var/log | 775 |
| /etc | 775 |
| /tmp | 775 |

### Thread Resource Limitation

**Symptom:** `ThreadError: can't create Thread: Resource temporarily unavailable`
**Root cause:** `/etc/security/limits.conf` has `omsagent hard nproc 75` (too low; agent needs ~50 threads + DSC/OMI/NPM)
**Fix:** Set `omsagent hard nproc 200`

### User Access / PAM Limitation

**Symptom:** Only Heartbeat collected; Perf/Syslog missing. Cron log: `FAILED to authorize user with PAM (Permission denied)`
**Root cause:** `/etc/security/access.conf` has `- : ALL : ALL` blocking omsagent crond
**Fix:** Add `+ : omsagent : ALL` before the deny-all rule:
```
+ : root : ALL
+ : @admin : ALL
+ : omsagent : ALL
- : ALL : ALL
```

### RVM Ruby Conflict

**Symptom:** OMS Ruby crashes or gem load failures
**Root cause:** RVM sets `GEM_HOME`/`GEM_PATH` env vars overriding OMS bundled Ruby
**Detection:**
```bash
echo $GEM_HOME   # Should NOT point to /usr/local/rvm/
/opt/microsoft/omsagent/ruby/bin/gem environment  # Check GEM PATHS
```
**Fix:**
```bash
mv /etc/profile.d/rvm.sh /etc/profile.d/rvm.sh.bak  # Immediate
# Or remove RVM entirely for permanent fix
# Verify:
/opt/microsoft/omsagent/ruby/bin/ruby -e "require 'gyoku'; puts 'Test done'"
```

### Custom OpenSSL Installation

**Symptom:** `libssl.so.1.1: cannot open shared object file - openssl.so (LoadError)`
**Root cause:** Custom OpenSSL in non-standard path (e.g., `/opt/app/softwares/openssl/`) set in system PATH
**Detection:**
```bash
which openssl
ldd /usr/bin/openssl  # Check if libssl points to custom path
```
**Fix:** Remove custom OpenSSL from PATH for omsagent context, or ensure libssl.so.1.1 symlinks are in standard library paths.
