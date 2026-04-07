# Purview Compliance 21V vs Global Feature Availability

> Source: OneNote - Purview Compliance - Feature Gap
> Status: draft

## Feature Availability Table

| Feature | E3 | E5 | 21V (Gallatin) | Global |
|---------|----|----|----------------|--------|
| Compliance Manager (compliance score) | | | **No** | Yes |
| Alerts | | | **No** | Yes |
| eDiscovery (Standard) | | | Yes | Yes |
| eDiscovery (Premium) | | E5 | **No** | Yes |
| DLP (basic) | | | Yes | Yes |
| **DLP Alert** | | | **No** (infra not ready, ICM 673053756) | Yes |
| Communication DLP for Teams | | E5 | **No** | Yes |
| Retention Policy | | | Yes | Yes |
| Retention Label / Label Policy | | | **No** | Yes |
| SPO doc lib default label | | | **No** (PM confirmed no plan - legacy tech) | Yes |
| Audit log retention policy | | E5 | **No** (PM confirmed no plan) | Yes |
| Microsoft Purview Customer Key | | E5 | **No** | Yes |
| Information Barrier | | E5 | **No** | Yes |

## PM Contact

- Feature gap inquiries: **Shawn Wang**

## Reference Links

- [M365 operated by 21Vianet - Service Descriptions](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/microsoft-365-operated-by-21vianet)
- [Microsoft 365 Compliance Licensing Comparison (PDF)](https://learn.microsoft.com/en-us/office365/servicedescriptions/downloads/microsoft-365-compliance-licensing-comparison.pdf)

## Key Takeaways

1. **Permanent gaps** (PM confirmed no plan): SPO doc lib default label, Audit log retention policy
2. **Infrastructure gaps** (may be deployed later): DLP Alert, Compliance Manager, Alerts
3. **License-gated in Global but absent in 21V**: eDiscovery Premium, Customer Key, Information Barrier, Communication DLP for Teams
4. Retention **Policies** work in 21V; Retention **Labels** do not
