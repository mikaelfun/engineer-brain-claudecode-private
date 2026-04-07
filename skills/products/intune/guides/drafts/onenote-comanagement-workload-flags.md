# Co-management Workload Flag Values Reference

> Source: OneNote — Mooncake POD Support Notebook / Co-management / Comanagement Workloads New values
> Quality: guide-draft (pending SYNTHESIZE review)

## Workload Flags

| Workload | Hex | Decimal |
|----------|-----|---------|
| Inventory | 0x1 | 1 |
| Compliance Assessment (CA) | 0x2 | 2 |
| Resource Access (RA) | 0x4 | 4 |
| Configuration Settings | 0x8 | 8 |
| Windows Update for Business (WUfB) | 0x10 | 16 |
| Security / Endpoint Protection | 0x20 | 32 |
| Modern Apps | 0x40 | 64 |
| Office 365 | 0x80 | 128 |
| Software Distribution | 0x100 | 256 |
| Third Party Updates | 0x200 | 512 |
| Configuration Settings Exceptions | 0x400 | 1024 |
| Software Center | 0x800 | 2048 |
| Disk Encryption (BitLocker) | 0x1000 | 4096 |
| EP Split | 0x2000 | 8192 |

**All workloads combined**: 16383 (0x3FFF)

**Default**: Inventory + EpSplit = 8193 (0x2001)

## Notes

- Co-management flags were updated to support disk encryption (BitLocker) features
- Default value changed to 8193 to include EpSplit awareness
- Client workload flags can be checked via registry or WMI
- The `Capabilities` value in CoManagementHandler.log shows the combined workload flags

## 21v Applicability

Fully applicable — same flag values in Mooncake.
