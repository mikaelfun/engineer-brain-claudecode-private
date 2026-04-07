---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender CSPM/[Product Knowledge] - API Security Posture Management"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Defender%20CSPM/%5BProduct%20Knowledge%5D%20-%20API%20Security%20Posture%20Management"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# API Security Posture Management

## Required Kusto Access
- [Microsoft Defender for Cloud - Kusto Permissions](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/2915/MDC-CSS-Access-Permissions-for-Kusto-and-other-services)

## Overview

API Security Posture Management is a capability in **Microsoft Defender for Cloud** that enables organizations to improve the security posture of their APIs. As APIs become a growing attack surface in modern cloud environments, this feature integrates API-specific posture assessment and governance into Defender for Cloud's broader Cloud Security Posture Management (CSPM) capabilities.

The capability provides visibility into exposed APIs, evaluates them against built-in security policies, and highlights misconfigurations or risky exposures that could lead to security incidents.

### Core Capabilities

- **API Discovery** - Automatically identifies APIs in your cloud environment, including those hosted in Azure Function Apps and Logic Apps (Preview).
- **Posture Assessment** - Evaluates discovered APIs against posture policies to detect issues such as insecure configurations, missing protections, or excessive exposure.
- **Recommendations and Remediation** - Surfaces actionable security recommendations directly in Defender for Cloud.
- **Integration with CSPM** - Aligns API posture insights with the overall Defender for Cloud security posture.

### Benefits

- Enhanced visibility into the API attack surface.
- Continuous compliance and risk monitoring for API endpoints.
- Streamlined remediation through Defender for Cloud's recommendation engine.
- Integration with Azure native services and policy frameworks.

### IcM Escalation Path
- [Microsoft Defender for Cloud - Escalation Path Lookup](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/7132/Microsoft-Defender-for-Cloud-(MDC)-vTeams-templates-and-categories-mapping)

## Frequently Asked Questions (FAQs)

**Q1**: What are the capabilities launched for API security launched in Public Preview at Ignite 2025?
- The new public preview features offer API security posture related features natively (out of the box) as part of Defender CSPM plan, available within the settings & extension page of Defender CSPM plan settings.

**Q2**: What do customers need to do to get API Security posture capability?
- Existing Defender CSPM customers: navigate to Environment Settings page > Subscription > turn API Security posture Management ON.
- New Defender CSPM customers: API security posture is ON by default when enabling Defender CSPM for the first time.

**Q3**: How to enable API security posture within Defender CSPM plan?
- Environment settings > select subscription > enable API security posture Management extension under Settings page.

**Q4**: Do I need to manually onboard APIs?
- No, all APIs published within Azure API Management are automatically onboarded once the extension is enabled.

**Q5**: Key capabilities available?
- Risk based Security recommendations for APIs (unauthenticated, inactive/dormant, internet-exposed)
- API Attack Path analysis (unauthenticated APIs exposed to Internet with sensitive data)
- Classify sensitive data exposure in API URL paths, query parameters, request/response bodies (integrated with Microsoft Purview)
- Map API-led attack paths to backend compute hosts (VM/VMSS, GenAI applications)

**Q6**: What regions are supported?
- Same regions as Defender for APIs CWP supported regions: [Defender for APIs Benefits and Features](https://aka.ms/apiSecurityOverview)

**Q7**: Already have Defender for APIs plan enabled - do I need to enable API posture extension again?
- No. If Defender for APIs plan is already enabled in Workload protections Plan, you get both API security posture (recommendations, security insights) AND threat detection (OWASP API top 10).
- For Cloud Security Explorer queries, risk-based recommendations, and API Attack path analysis: need Defender CSPM plan enabled.

**Q8**: Where to see onboarded API collections/operations?
- MDC Inventory page, and API Security blade within Workload protections plan.
- Guide: https://learn.microsoft.com/en-us/azure/defender-for-cloud/enable-api-security-posture#view-api-inventory

**Q9**: What type of APIs supported?
- Currently REST APIs only.

**Q10**: How to query backend mapping of API endpoints?
- Cloud Security Explorer within Defender CSPM: use built-in templates or custom queries.
- https://learn.microsoft.com/en-us/azure/defender-for-cloud/enable-api-security-posture#explore-api-risks-and-remediate-with-attack-path-analysis

**Q11**: No results for backend compute mapping query?
- Only APIs with webserviceURL or Gateway URL configured in Azure API Management are supported.
- Resolved IP maps to Load Balancer, Application Gateway, Network Interface card. Extend to VMs using "routes traffic to" edge.

**Q12**: What types of sensitive data exposure assessed?
- API URLs, query/path parameters, request bodies, response payloads.
- Use Cloud Security Explorer > expand Sensitivity Info Types in Additional Details.

**Q13**: How to offboard APIs from Defender CSPM?
- Individual API offboarding not supported. Must disable entire plan.
- https://learn.microsoft.com/en-us/azure/defender-for-cloud/enable-api-security-posture#offboarding-api-security-posture-protection

## Additional References

- [API security posture overview](https://learn.microsoft.com/en-us/azure/defender-for-cloud/api-security-posture-overview)
- [Enable API security posture management](https://review.learn.microsoft.com/en-us/azure/defender-for-cloud/enable-api-security-posture?branch=pr-en-us-302)
- [What's new - API discovery for Function Apps and Logic Apps (Preview)](https://learn.microsoft.com/en-us/azure/defender-for-cloud/release-notes#api-discovery-and-security-posture-for-apis-hosted-in-function-apps-and-logic-apps-preview)
