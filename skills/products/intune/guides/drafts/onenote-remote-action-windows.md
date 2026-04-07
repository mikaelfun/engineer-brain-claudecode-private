# Remote Action for Windows - Comparison Guide

> Source: OneNote — Mooncake POD Support Notebook / Intune / ## Windows TSG / Remote Action for Windows

## Action Comparison Table

| Attribute | Autopilot Reset | Wipe | Fresh Start | Retire |
|-----------|----------------|------|-------------|--------|
| Require Win RE | Yes | Yes | Yes | No |
| Remove personal files and settings | Yes | Yes | Yes | No |
| Applications | Remove all | Remove Win32 and Store apps; Retains OEM apps | Remove Win32 and OEM apps; Retains Win Store apps | Removes Company applications only |
| Retain AAD join | Yes | Yes (if selected) | Yes | No |
| Retain MDM enrollment | Yes | Yes (if selected) | Yes (if selected) | No |
| Reapply Device original settings | Yes | Yes | Yes | No |
| Update OS | No | No | Yes | No |

## Key Differences

- **Autopilot Reset**: Full device reset while preserving AAD join and MDM enrollment. Ideal for re-provisioning devices without re-enrollment.
- **Wipe**: Most destructive - removes everything but gives options to retain AAD join and MDM enrollment. Retains OEM apps.
- **Fresh Start**: Similar to Wipe but also updates the OS and retains Windows Store apps instead of OEM apps.
- **Retire**: Lightest touch - only removes company data/apps. Does NOT retain AAD join or MDM enrollment. Used when a device leaves management.
