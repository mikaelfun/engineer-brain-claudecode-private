---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Conditional Access Optimization Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FConditional%20Access%20Optimization%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Summary

The Conditional Access Optimization Agent, powered by Microsoft Security Copilot's large language model, is available in the Agents blade of the Entra portal.

The agent automatically detects new users and applications, checks Conditional Access policies to ensure users/applications are protected, and provides one-click solutions to address any gaps. It evaluates policies that require MFA, enforce device-based controls (Device Compliance, App Protection, Domain Joined Devices), and block legacy authentication and device-code flow.

## Requirements

### Licenses
- Microsoft Entra P1 or higher license
- Security Copilot subscription and purchased Compute Units
- Each run consumes approximately 3 Security Copilot Compute Units (SCUs)

### Roles
- Global administrator or Security administrator

## Known Issues

### Issue 0: Agent tile not visible in Entra
Customers with Security Copilot see "Security Copilot agents are coming" under What's new but cannot enable the agent.
**Solution**: Phased rollout completed June 2, 2025. Tile should now be visible.

### Issue 1: Agent error "could not complete its run"
Admin clicking Run Agent encounters "The agent encountered an error and could not complete its run". Browser trace may show 500 on POST to api.securitycopilot.microsoft.com.
**Root Cause**: Tenant has run into SCU overage.
**Solution**: Check Usage monitoring at securitycopilot.microsoft.com/usage-monitoring for remaining SCUs. If 500 error present, submit ICM. If no 500 error, verify SCU availability.

## Enable the Agent

1. Sign in to Entra Admin Center as Global administrator or Security administrator
2. Go to **Agents** blade
3. Click **View details** on the Conditional Access Optimization Agent card
4. Click **Start agent** in the setup panel

> **IMPORTANT**: Prior to Ignite 2025 the agent ran in the context of the installing user. Post-Ignite, it runs via Agent Identity. The portal no longer allows setup without Agent ID.

## Switch from User Token to Agent ID

For customers who deployed before Agent Identities:
1. Go to Agents blade in Entra portal
2. Find Conditional Access Optimization Agent card
3. Click **Create agent identity** in the banner (or from Settings tab)

## Dashboard Features

- **Run agent**: Manual run (agent only analyzes past 24 hours regardless of schedule)
- **Remove agent**: Uninstall for reinstallation under different context
- **Agent Summary**: Rolling 30-day activity and impact overview
- **Settings**: Customize run frequency, scope, policy behavior, safe deployment, exclusion rules
- Default: runs every 24 hours, analyzes new users/apps, can autonomously create report-only policies

## Safe Deployment (Phased Rollout)

The agent can deploy policies through phases:
1. **Report-only phase**: Policy in report-only mode for observation
2. **Gradual enforcement**: Incrementally applied to user groups
3. **Full enforcement**: Applied to all targeted users

Admin can monitor progress, pause, or roll back at any phase.
