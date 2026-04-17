# Purview Double Key Encryption (DKE) -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Drafts fused**: 0 | **Kusto queries fused**: 0
**Generated**: 2026-04-07

---

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | User cannot open DKE (Double Key Encryption) protected file; authentication fails when consuming DKE... | Misconfiguration in DKE appsettings.json (incorrect user email or LDAP server co... | 1) Verify user email and LDAP server configuration in DKE `appsettings.json`. 2) In AAD App Registra... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Unable%20to%20consume%20DKE%20protected%20content) |
| 2 | Cannot save DKE (Double Key Encryption) protected Office file; error: 'Word cannot save or create th... | DKE flighting is not enabled in the Office/MSIPC registry on the client machine | Add the following registry keys on the client: [HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\MS... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Unable%20to%20save%20DKE%20protected%20file) |
| 3 | Cannot save DKE protected file; save operation fails; client cannot browse the DKE service URL | DKE hosting service is down or client firewall/network is blocking access to the... | 1) Check the DKE hosting service (IIS or Azure App Service) is running. 2) Verify the client can suc... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Unable%20to%20save%20DKE%20protected%20file) |
| 4 | Cannot save DKE protected file; DKE URL configuration appears correct but save still fails | DKE URL, KeyName, and JwtAudience are case-sensitive. A case mismatch between ap... | Ensure that the KeyName and JwtAudience in appsettings.json match EXACTLY (case-sensitive) with the ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Unable%20to%20save%20DKE%20protected%20file) |
| 5 | Cannot save DKE protected file; DKE service URL is configured in the sensitivity label but save fail... | The sensitivity label configuration is missing the key name at the end of the DK... | In the sensitivity label DKE configuration, enter the full endpoint URL including the key name appen... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Unable%20to%20save%20DKE%20protected%20file) |