# AVD AVD Windows Activation (KMS) - Comprehensive Troubleshooting Guide

**Entries**: 1 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| AVD session host cannot be activated (Windows activation failure). Win... | The outbound IP from the AVD session host is not recognized as an Azur... | 1. Check outbound IP from session host - must be an Azure IP for KMS a... |

### Phase 2: Detailed Investigation

#### Entry 1: AVD session host cannot be activated (Windows activation fai...
> Source: OneNote | ID: avd-onenote-083 | Score: 7.0

**Symptom**: AVD session host cannot be activated (Windows activation failure). Windows Application Event 12288 shows activation request failed. Network outbound IP is not an Azure IP address, so it is blocked by KMS proxy server.

**Root Cause**: The outbound IP from the AVD session host is not recognized as an Azure IP by the KMS proxy server. This can happen when traffic is routed through a non-Azure egress point (e.g., on-premises firewall/proxy). KMS proxy requires the source IP to be an Azure IP to forward activation requests.

**Solution**: 1. Check outbound IP from session host - must be an Azure IP for KMS activation to work. 2. Verify KMS proxy connectivity: check Jarvis logs for pseudo-VIP connection records. 3. A successful activation shows socket exception 10054 (expected - KMS completed activation and closed connection). 4. Find the pseudo-VIP for KMS proxy verification. 5. If traffic routes through non-Azure egress, configure routing to ensure KMS traffic (port 1688) goes through Azure gateway. Reference: https://docs.microsoft.com/en-us/troubleshoot/azure/virtual-machines/troubleshoot-activation-problems

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
