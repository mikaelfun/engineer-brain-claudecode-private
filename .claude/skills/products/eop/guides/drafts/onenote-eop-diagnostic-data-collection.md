# EOP Diagnostic Data Collection Script

> Source: OneNote — Collect EOP diagnostic data
> Status: draft (pending SYNTHESIZE review)

## Overview

PowerShell script for collecting EOP configuration and diagnostic data from customer tenants.

**Script location**: [eopdiagnosticlogs.ps1 - Mooncake CodeRepo](https://dev.azure.com/CSS-Mooncake/SupportTools/_git/MooncakeCodeRepo?path=/VM/eopscripts/eopdiagnosticlogs.ps1)

## Usage Modes

### Mode 1: Basic EOP Config Collection

Collects: Exchange Online config, anti-spam, anti-malware, anti-phishing rules, tenant allow/block list, transport rules, quarantine rules.

```powershell
./eopdiagnosticlogs.ps1 -path c:\temp\eopdiagnosticlog
```

> Default output path: `C:\eop_diagnostic` if `-path` not specified.

### Mode 2: Config + Quarantine Messages

Adds quarantine message collection with time range filtering.

```powershell
# By date range
./eopdiagnosticlogs.ps1 -quarantine -senderaddress user@xyz.com -RecipientAddress user@xyz.com -startdate 2024-08-01 -enddate 2024-08-15

# By recent days
./eopdiagnosticlogs.ps1 -quarantine -senderaddress user@xyz.com -RecipientAddress user@xyz.com -days 7

# With email download (.eml)
./eopdiagnosticlogs.ps1 -quarantine -days 14 -RecipientAddress user@domain.com -dumpemail
```

**Notes**:
- `-senderaddress` and `-RecipientAddress` are optional but recommended
- `-dumpemail` downloads quarantine messages as .eml sample files
- Quarantine message trace supports only recent **10 days**

### Mode 3: Config + Advanced Report

```powershell
./eopdiagnosticlogs.ps1 -days 14 -advancedreport -RecipientAddress user@domain.com
```

**Notes**:
- Advanced report needs time to complete after script execution
- `-advancedreport` requires at least one of `-senderaddress` or `-RecipientAddress`

### Mode 4: Full Collection (All Features)

```powershell
./eopdiagnosticlogs.ps1 -quarantine -advancedreport -days 7 -RecipientAddress xyz@domain.com -dumpemail
```

## Collected Data

- Exchange Online configuration
- Anti-spam policy settings
- Anti-malware policy settings
- Anti-phishing rule settings
- Tenant Allow/Block List (TABL)
- Transport rules
- Quarantine rules and policies
- Quarantine messages (optional)
- Sample .eml files (optional)
- Advanced message trace report (optional)
