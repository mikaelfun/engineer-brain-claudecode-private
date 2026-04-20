# AVD Windows Activation (KMS) — Troubleshooting Workflow

**Scenario Count**: 1
**Generated**: 2026-04-18

---

## Scenario 1: AVD session host cannot be activated (Windows activation fai...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- 1
- Check outbound IP from session host - must be an Azure IP for KMS activation to work
- 2
- Verify KMS proxy connectivity: check Jarvis logs for pseudo-VIP connection records
- 3
- A successful activation shows socket exception 10054 (expected - KMS completed activation and closed connection)
- 4
- Find the pseudo-VIP for KMS proxy verification
- 5
- If traffic routes through non-Azure egress, configure routing to ensure KMS traffic (port 1688) goes through Azure gateway
- Reference: https://docs.microsoft.com/en-us/troubleshoot/azure/virtual-machines/troubleshoot-activation-problems

**Root Cause**: The outbound IP from the AVD session host is not recognized as an Azure IP by the KMS proxy server. This can happen when traffic is routed through a non-Azure egress point (e.g., on-premises firewall/proxy). KMS proxy requires the source IP to be an Azure IP to forward activation requests.
