# TSG - Forced Domain Removal

## Overview

Process for forced domain removal in Azure AD / Entra ID when customer cannot remove domain through normal means.

## CSS Escalation Path

1. **CSS submits to Data Protection TAs** (m365dataprotection@service.microsoft.com)
2. DP TAs verify customer's request using their tools (legal validation of customer legitimacy and domain ownership)
3. DP TAs run authorized tools to remove the domain
4. If DP TAs encounter technical issues, they submit ICM using template "**Forced Domain Removal**"

## ICM Template

- Template: "Forced Domain Removal"
- Reference: [M365 Identity ICM Templates - Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1787825/M365-Identity-ICM-Templates)

## Important Notes

- EEE (Engineering Escalation) will verify the ICM was submitted by DP TA; non-DP-TA submissions will be rejected
- DP TAs have their own legal verification process for customer legitimacy and domain ownership
- TSG Reference: [TSG Domain Removal - Overview](https://supportability.visualstudio.com/ModernStack/_wiki/wikis/ModernKB/333033/TSG-Domain-Removal)

## Contact

- DP Team: M365 Data Protection <m365dataprotection@service.microsoft.com>
- Source: Clifford Zhang
