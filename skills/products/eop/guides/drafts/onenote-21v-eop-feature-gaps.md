# 21V (Gallatin) EOP Feature Gaps vs Global

> Source: OneNote - Feature Gaps page
> Last updated: 2026-01-15

## Completely Unavailable in 21V

| Feature | Description | Reference |
|---------|-------------|-----------|
| Built-in Protection | Default Safe Attachments/Links policies | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/defender-endpoint/built-in-protection) |
| Safe Attachments | Attachment sandboxing | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/safe-attachments-about) |
| Safe Links | URL rewriting and click-time protection | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/safe-links-about) |
| Tenant Allow/Block Lists (TABL) | Centralized allow/block management | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/tenant-allow-block-list-about) |
| Advanced Delivery | Third-party phishing simulation & SecOps mailbox config | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/advanced-delivery-policy-configure) |
| Evaluation Mode | Trial Defender for Office 365 | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/try-microsoft-defender-for-office-365) |
| Automated Investigation & Response (AIR) | Automated threat investigation | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/air-about-office) |
| Threat Explorer | Real-time detections and exploration | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/threat-explorer-about) |
| Campaigns | Campaign detection and tracking | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/campaigns) |
| Threat Trackers | New and noteworthy threat tracking | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/threat-trackers) |
| Attack Simulation Training | Phishing simulation training | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/attack-simulation-training-get-started) |
| Advanced Phishing Thresholds | Custom phishing detection thresholds | N/A |
| Client-side Report Phishing/Junk | End-user phishing/junk reporting buttons | N/A |

## Partially Available / Limited

| Feature | Limitation | Reference |
|---------|-----------|-----------|
| Anti-spam/Anti-phishing | No ZAP, no Spoof Intelligence, no Impersonation detection | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/anti-phishing-policies-about) |
| Trusted ARC Sealers | Cannot add trusted ARC sealers | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-arc-configure) |
| Quarantine Policies | Custom notification capabilities limited | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/quarantine-policies) |
| Preset Security Policies | Available but missing Built-in Protection | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/preset-security-policies) |
| Configuration Analyzer | Limited availability | [Docs](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/configuration-analyzer-for-security-policies) |
| User Reported Settings | UI visible but backend unavailable (Bug 5529973) | N/A |

## Available in 21V

- Anti-malware policies
- Anti-spam policies (basic)
- Anti-phishing policies (basic, no impersonation)
- Enhanced Filtering for Connectors
- DKIM configuration
- Connection filter policies
- Mail flow rules (ETR)
- Message trace (EAC portal)
- Quarantine management

## License Comparison Reference
- [Microsoft 365 Compliance Licensing Comparison](https://learn.microsoft.com/en-us/office365/servicedescriptions/downloads/microsoft-365-compliance-licensing-comparison.pdf)
