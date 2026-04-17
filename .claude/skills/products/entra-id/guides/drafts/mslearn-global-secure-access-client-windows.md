# Global Secure Access Client for Windows — Troubleshooting Guide

source: mslearn | url: https://learn.microsoft.com/en-us/troubleshoot/entra/global-secure-access/troubleshoot-global-secure-access-client-windows-issues

## Installation Failures

- Check prerequisites: managed Windows device (Entra hybrid join or Entra joined)
- Check logs: `C:\Users\<username>\AppData\Local\Temp\Global_Secure_Access_Client_<number>.log`
- Check Application and System event logs
- Upgrade failures: uninstall earlier version → restart → reinstall

## Post-Installation Issues

### Self-Service Diagnostic Tools
1. **Advanced diagnostics**: Troubleshoot the Global Secure Access client advanced diagnostics
2. **Health check tab**: Troubleshoot the Global Secure Access client diagnostics health check

### Log Collection
- Use advanced log collection tab in diagnostics
- Submit support ticket with collected logs

## Architecture
- GSA client routes traffic from managed devices through Microsoft Entra
- Enables enforcement of CAE, device compliance, MFA for resource access
- Supports deployment via: local admin install, AD DS Group Policy, Intune/MDM
