# Vxlan Payload & VFP/Vmswitch Trace Decoding in Netmon

> Source: MCVKB/VM+SCIM/7.11 [netmon] How to decode the Vxlan payload and VFP/Vmswitch trace in Netmon
> Quality: guide-draft | Needs review before promotion

## Problem

When capturing network traces on Azure host (via WASU team RDP), the resulting `.etl` files contain Vxlan-encapsulated traffic and VFP/Vmswitch traces. By default, Network Monitor (Netmon) and Wireshark cannot decode the inner Vxlan payload, making it impossible to filter traffic by Customer Address (CA) IP addresses.

## Method 1: Wireshark with Vxlan Port

1. **Capture on host**:
   ```cmd
   netsh trace start provider=Microsoft-Windows-Hyper-V-VfpExt provider=Microsoft-Windows-Hyper-V-VmSwitch capture=yes capturetype=both capturemultilayer=yes maxsize=1000 tracefile=vfptrace.etl
   # Start traffic and wait
   netsh trace stop
   netsh trace convert vfptrace.txt
   ```

2. **Convert ETL to CAP** for Wireshark:
   - Use etl2pcapng or Microsoft Message Analyzer to convert `.etl` → `.cap`

3. **Configure Wireshark** to decode Vxlan on port **65330** (Azure's Vxlan port):
   - Edit → Preferences → Protocols → VXLAN → set UDP port to 65330
   - Now inner CA-level traffic is visible and filterable

4. **Cross-reference VFP trace**: Use PA addresses from Wireshark to look up VFP rule matches in the `.txt` trace file

## Method 2: Custom NPL Files in Netmon

1. Download custom Netmon from: `\\ziz-backup01\CASE\netmon` (internal share)
2. Create a new parser profile based on Windows profile, set as active
3. Edit `udp.npl` (ensure Full Control permissions) to add Vxlan decoding
4. Copy `vxlan.npl` to the parser directory
5. Add `vxlan.npl` reference into `sparser.npl`
6. For VFP trace decoding: copy additional NPL files and update `my_sparser` file
7. Rebuild the profile

## VFP Trace Log Format

Key fields in VFP trace entries:
- **Rule ID**: e.g., `INCOMING_IPV6_ALLOW_ALL_RULE`
- **Layer**: e.g., `VFP_NEXT_HOP_MAC_LOOKUP_LAYER_STATELESS`, `SLB_DECAP_LAYER_STATEFUL`, `SLB_NAT_LAYER`
- **Group**: e.g., `DEFAULT_IPV6_NEXT_HOP_MAC_LOOKUP_ALLOW_ALL_IN`, `SLB_GROUP_DECAP_IPv6_IN`
- **Flow ID**: src/dst IP, ports, protocol
- **Status**: `STATUS_SUCCESS` or error codes like `0xC001001B`
- **Drop reason**: Look for "NBLs were dropped" with reason text

## When to Use

- Investigating packet drops at VFP layer
- Diagnosing SLB/NAT/encapsulation issues
- Verifying NSG rule enforcement at host level
- Troubleshooting cross-node connectivity with PA/CA address mapping
