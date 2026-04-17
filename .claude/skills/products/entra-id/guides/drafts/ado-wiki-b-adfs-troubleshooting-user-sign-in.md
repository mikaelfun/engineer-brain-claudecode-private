---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Troubleshooting/ADFS - Troubleshooting User Sign-in"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20Troubleshooting%2FADFS%20-%20Troubleshooting%20User%20Sign-in"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS User Sign-in Troubleshooting Flowchart

Step by step guided walkthrough: https://aka.ms/troubleshoot-adfs-sign-in

## AAD Scenario Checks
- Check if user is synced to AAD
- Check immutableID and UPN issuance claim rules

## Basic Sanity / External Access Checks
- Check sign-in using IdpInitiatedSignOn page
- Check DNS resolution
- Check Load Balancer configuration
- Check Firewall rules
- Check SSL certificate, bindings, and cert revocation
- Check if endpoint is disabled / enabled via proxy
- Check proxy trust certificate settings between AD FS and WAP

## Relying Party Checks
- Common RP check steps
- Check if RP ID matches requested RP / verify RP endpoints
- Check RP encryption certificate validity
- Check auth policy for impacted user
- Setup Claims X-Ray (AD FS Help) for debugging
- Check if claim rule is denying access
- Check if device state condition is required

## Error at Application Side
- Did Token Signing certificate rollover happen?
- Update application/RP to use new TS certificate
- Is there a signing algorithm mismatch?
- Update signing algorithm as required
- Check NameID format and claims for mismatch values

## Unexpected Prompt for Login
- Check claim rules for MFA configuration
- Check WIA (Windows Integrated Authentication) settings
