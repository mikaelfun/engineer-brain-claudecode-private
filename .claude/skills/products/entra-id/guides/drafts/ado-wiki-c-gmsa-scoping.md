---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/GMSA/Workflow: gMSA: Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FGMSA%2FWorkflow%3A%20gMSA%3A%20Scoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# gMSA Scoping & Diagnostic Checklist

## Initial Scoping Questions

1. **Impacted OS versions** - List the impacted operating system versions
2. **Problem description** - Describe the gMSA issue (e.g., unable to start service, logon failure)
3. **Impacted applications** - List applications affected by the gMSA issue
4. **Error messages/events** - Capture screenshots, events from Application/Security/System logs
5. **Timeline** - When did the problem start? Was the same configuration working before?
6. **Pattern** - Does it occur post-reboot, intermittently, or after patching?
7. **Reproducibility** - Is the issue reproducible at will?
8. **Recent changes** - Was there a latest update/patch installed?

## Key Diagnostic Checks

### Test-ADServiceAccount

```powershell
Test-ADServiceAccount -Identity <gmsa name>
```

- **True** = machine has sufficient privileges to fetch the gMSA password
- **False** = machine account does not have permission to fetch the password, or encryption type mismatch

### Check PrincipalsAllowedToRetrieveManagedPassword

```powershell
Get-ADServiceAccount -Identity <gmsa name> -Properties PrincipalsAllowedToRetrieveManagedPassword
```

Verify the affected server is listed in the allowed principals.

### Check Encryption Type Consistency

```powershell
Get-ADServiceAccount -Identity <gmsa name> -Properties KerberosEncryptionType
```

Compare gMSA encryption types with the client OS encryption settings in `secpol.msc` (Security Settings > Local Policies > Security Options > Network security: Configure encryption types allowed for Kerberos).

### Check Logon as a Service Rights

For service logon failures, verify the gMSA has "Log on as a service" rights in Local Security Policy (or via GPO).

### Cross-validation Tests

- Does the same configuration work with any other gMSA?
- What happens if you run a service on another server using the same gMSA account?
