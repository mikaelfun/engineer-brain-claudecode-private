# AVD AVD Session Host Update (SHU) - Quick Reference

**Entries**: 6 | **21V**: all applicable
**Keywords**: 403, authorizationfailed, capacity, deniedaccesstocustomerresource, drain, forbiddenbypolicy, gen1-gen2, hypervgeneration, image-mismatch, imagehypervgenerationdoesnotmatchexistingvms_1024, keyvault, migrationmayexceedcapacitylimit_1024, pause-resume, permissions, quota
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Session Host Update (SHU) fails with error ImageHyperVGenerationDoesNotMatchExis... | HyperV generation mismatch between the selected update image (Gen2/V2) and the e... | Select an image that matches the HyperV generation of the existing VMs in the ho... | 🟢 8.0 | ADO Wiki |
| 2 📋 | Session Host Update fails with DeniedAccessToCustomerResource / AuthorizationFai... | The AVD service principal used by Session Host Update is missing required RBAC p... | Restore the required RBAC permissions on the custom role: ensure 'Microsoft.Comp... | 🟢 8.0 | ADO Wiki |
| 3 📋 | Session Host Update fails with UnableToAccessKeyvaultSecret_1024: 'Unable to acc... | The AVD SHU service principal lacks the 'Get' permission on Key Vault secrets. O... | In the Key Vault access policy or RBAC assignment for the AVD SHU service princi... | 🟢 8.0 | ADO Wiki |
| 4 📋 | Session Host Update fails with MigrationMayExceedCapacityLimit_1024: 'Resources ... | The subscription's vCPU quota (Total Regional or SKU family) is insufficient to ... | Increase the vCPU quota for the affected subscription and region via Azure porta... | 🟢 8.0 | ADO Wiki |
| 5 📋 | During Session Host Update, the portal displays 'update is pausing' status for 4... | SHU waits for active user sessions to drain before fully transitioning to paused... | This is expected behavior. The update will eventually transition to fully paused... | 🔵 7.0 | ADO Wiki |
| 6 📋 | Session host update fails and rollback fails - host unavailable | Image/SKU mismatch, agent failure, resource locks, or resource modifications dur... | Check errors; retry or cancel; remove DSC extension from image; check activity l... | 🔵 6.0 | MS Learn |

## Quick Triage Path

1. Check: HyperV generation mismatch between the selected update image... `[Source: ADO Wiki]`
2. Check: The AVD service principal used by Session Host Update is mis... `[Source: ADO Wiki]`
3. Check: The AVD SHU service principal lacks the 'Get' permission on ... `[Source: ADO Wiki]`
4. Check: The subscription's vCPU quota (Total Regional or SKU family)... `[Source: ADO Wiki]`
5. Check: SHU waits for active user sessions to drain before fully tra... `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-session-host-update.md#troubleshooting-flow)