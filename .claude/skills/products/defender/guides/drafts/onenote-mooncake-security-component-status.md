# Mooncake Security Component Status Matrix

## Overview
Azure security features in Mooncake are categorized into 5 areas: Identity & Access Management, Data Protection, Network Security, Threat Protection, and Security Management. Not all features available in Global Azure are available in Mooncake.

## Key Highlights

### Identity & Access Management
| Feature | Status |
|---------|--------|
| AAD MFA | GA |
| RBAC | GA |
| PIM | GA (AAD P2) |
| Access Reviews | GA (AAD P2) |
| Conditional Access | GA (AAD P2) |
| Intune MAM/MDM | Preview |
| Identity Protection | No |

### Data Protection
| Feature | Status |
|---------|--------|
| SQL TDE | GA |
| SQL Column Encryption | GA |
| Azure Key Vault | GA |
| Disk Encryption BYOK | GA |
| SQL Advanced Threat Protection | No |
| MySQL BYOK | No |

### Network Security
| Feature | Status |
|---------|--------|
| NSG / ASG | GA |
| Azure Firewall | GA |
| WAF | GA |
| ExpressRoute | GA |
| Service Endpoint | GA (some missing) |
| Private Endpoint | Preview |
| DDoS Protection | No |

### Security Management (MDC)
| Feature | Status |
|---------|--------|
| JIT VM Access | GA |
| Adaptive Application Control | GA |
| FIM | GA |
| Security Policies | GA |
| VA Scanning | Limited (baseline only, no Qualys) |
| Update Management | GA |
| Sentinel | Planned |

### Threat Protection
| Feature | Status |
|---------|--------|
| Microsoft Antimalware | GA |
| Windows Defender ATP | GA |
| AATD | GA |
| Azure ATP (EMS) | No |

## Source
OneNote: Mooncake POD Support Notebook / Security Component Status in Mooncake
