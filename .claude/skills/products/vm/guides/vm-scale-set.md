# VM VMSS 虚拟机规模集 — 排查速查

**来源数**: 1 (ON) | **条目**: 5 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VMSS Resource Health shows false 'Remote disk disconnected' / 'Unavailable' alerts on AKS node pool  | AKS cluster auto scaling uses 'Force Delete' feature which immediately releases  | These Resource Health alerts can be ignored when they coincide with AKS auto sca | 🔵 7 | ON |
| 2 | VMSS scale-out fails: SubnetIsFull | Subnet exhausted all available IPs | Expand subnet CIDR or migrate VMSS to larger subnet. Remove orphaned NICs. | 🔵 7 | ON |
| 3 | VMSS scale-out fails: ComputerNamePrefixTooLongForScaleOut | computerNamePrefix too long for OS naming limits | Shorten computerNamePrefix in VMSS model | 🔵 7 | ON |
| 4 | VMSS scale-out fails: InboundNatPoolFrontendPortRangeSmallerThanRequestedPorts | LB NAT pool port range too small for VMSS instance count | Increase frontend port range of inbound NAT pool on load balancer | 🔵 7 | ON |
| 5 | VMSS management operations (update/scale) on MR-enabled tenant hosting Service Fabric cluster stuck  | Three possible causes on MR-enabled SF cluster: (a) incorrect Service Fabric con | Investigate by checking: 1) SF cluster durability tier (Gold/Silver = MR enabled | 🔵 7 | ON |

## 快速排查路径

1. **VMSS Resource Health shows false 'Remote disk disconnected' / 'Unavailable' aler**
   - 根因: AKS cluster auto scaling uses 'Force Delete' feature which immediately releases attached resources, bypassing graceful s
   - 方案: These Resource Health alerts can be ignored when they coincide with AKS auto scaling events. Verify by checking EventDataFull in Geneva for Resource H
   - `[🔵 7 | ON]`

2. **VMSS scale-out fails: SubnetIsFull**
   - 根因: Subnet exhausted all available IPs
   - 方案: Expand subnet CIDR or migrate VMSS to larger subnet. Remove orphaned NICs.
   - `[🔵 7 | ON]`

3. **VMSS scale-out fails: ComputerNamePrefixTooLongForScaleOut**
   - 根因: computerNamePrefix too long for OS naming limits
   - 方案: Shorten computerNamePrefix in VMSS model
   - `[🔵 7 | ON]`

4. **VMSS scale-out fails: InboundNatPoolFrontendPortRangeSmallerThanRequestedPorts**
   - 根因: LB NAT pool port range too small for VMSS instance count
   - 方案: Increase frontend port range of inbound NAT pool on load balancer
   - `[🔵 7 | ON]`

5. **VMSS management operations (update/scale) on MR-enabled tenant hosting Service F**
   - 根因: Three possible causes on MR-enabled SF cluster: (a) incorrect Service Fabric configuration settings, (b) job stuck at Po
   - 方案: Investigate by checking: 1) SF cluster durability tier (Gold/Silver = MR enabled); 2) Policy Engine job status; 3) SF configuration correctness. Ref I
   - `[🔵 7 | ON]`

