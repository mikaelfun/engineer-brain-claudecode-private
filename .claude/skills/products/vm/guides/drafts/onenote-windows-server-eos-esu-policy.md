# Windows Server 2008/2012 End of Support & ESU Policy

> Source: OneNote - [PODVM]Server 2008 End of Support, [PODVM]Sever 2012 End of Support (ESU)

## Key Dates

| Product | End of Support | ESU End |
|---------|---------------|---------|
| Windows Server 2008/R2 | January 14, 2020 | January 2023 |
| Windows Server 2012/R2 | October 10, 2023 | October 2026 |

## Azure VM Automatic ESU

- VMs running Windows Server 2008/R2 or 2012/R2 **in Azure** automatically receive ESU at **no additional charge**
- No ESU purchase needed for Azure-hosted workloads
- Customer still needs an **active Azure Support Plan** to receive support

## Support Availability Matrix

| Workload | Support Plan | ESU | Support Available |
|----------|-------------|-----|-------------------|
| **Azure** | No | n/a (free in Azure) | No |
| **Azure** | Yes | n/a (free in Azure) | Yes, under any Azure Support Plan |
| **On-Prem** | Yes | No | No |
| **On-Prem** | Yes | Yes | Yes |
| **On-Prem** | No | Yes/No | No |

## Support Scope (In-scope)

- Commercially reasonable effort for ALL Windows Server 2008/R2/2012/R2 issues
- Issues installing security updates offered through ESUs
- ESU update installation and OS upgrade issues → Windows team can assist

## Support Scope (Out of scope)

- Bug submissions not related to ESU
- Design change requests / feature requests
- Collaboration with Windows Engineering / Product Groups
- Root Cause Analysis (RCA)
- Non-inbox components (e.g., .NET Framework not shipped with OS)

## Mooncake Guidance

- **Focus on Azure platform side troubleshooting** for EOS VM cases
- For Windows Server 2012/R2: ESU support is "Limited support" = break/fix only, issue resolution NOT guaranteed
- For ESU installation failures (certificate issues), see known-issue vm-onenote-037

## Escalation Contacts

- Windows ESU escalation: winesuescalation@microsoft.com
- Windows Server 2008 inquiries: eos2008@microsoft.com
- Windows Client inquiries: eosquestions@microsoft.com

## References

- ESU FAQ: https://learn.microsoft.com/en-us/lifecycle/faq/extended-security-updates
- ESU Call Handling: https://internal.support.services.microsoft.com/en-us/help/4512950
