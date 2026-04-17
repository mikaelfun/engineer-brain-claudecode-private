# ADMX-Backed Policy Deployment via Intune

## Overview
Guide for creating and deploying ADMX-backed policies through Intune OMA-URI custom profiles, covering GPO-to-Intune migration scenarios.

## Tools
- **GPSearch**: https://gpsearch.azurewebsites.net/ - Check ADMX & registry key values
- **MMAT (MDM Migration Analysis Tool)**: https://github.com/WindowsDeviceManagement/MMAT - Analyze GPO policies for MDM migration feasibility

## Step-by-Step: Deploy an ADMX-Backed Policy

### 1. Find the GPO Configuration
- Identify the GPO location (e.g., Computer Configuration/Administrative Template/...)
- Note the OMA-URI path (e.g., `./Device/Vendor/MSFT/Policy/Config/System/BootStartDriverInitialization`)

### 2. Confirm ADMX Source File Exists
- Check `%SystemRoot%\policydefinitions` for the .admx file
- Find the ADMX name from Policy CSP documentation
- Determine scope: `./user` vs `./device`

### 3. Install ADMX File via Intune (if not inbox)
If the ADMX is not present on target devices:
- Copy all content from .admx file
- Create custom OMA-URI profile:
  - **OMA-URI**: `./Vendor/MSFT/Policy/ConfigOperations/ADMXInstall/{admxname}/Policy/admxfile01`
  - **Data type**: String
  - **Value**: Full XML content of the .admx file

### 4. Configure Specific Settings
- Check element types in .admx content (Text, MultiText, Boolean, Enum, Decimal, List)
- Create another OMA-URI for the setting:
  - **OMA-URI**: `./Device/Vendor/MSFT/Policy/Config/{Area}/{PolicyName}`
  - **Value**: `<enabled/><data id="{elementId}" value="{value}"/>`

### 5. Verify Deployment
1. **Device side** - Access work or school > Info > check policy list
2. **Registry** - Check:
   - `HKLM\Software\Microsoft\PolicyManager\Providers\{providerId}\default\Device\{area}`
   - `HKLM\Software\Microsoft\Provisioning\NodeCache\CSP\Device\MS DM Server\Nodes\{id}`
3. **Kusto** - Query DeviceManagementProvider table for policy sync events
4. **MDM Diagnostic log** - Settings > Accounts > Access work or school > Export management log

## Known Issues
- **Windows Professional edition**: Certain ADMX-backed CSP policies are only supported on Enterprise/Education editions. Deployment will fail on Professional SKU.

## References
- [Understanding ADMX-backed policies](https://docs.microsoft.com/en-us/windows/client-management/mdm/understanding-admx-backed-policies)
- [Enable ADMX-backed policies in MDM](https://docs.microsoft.com/en-us/windows/client-management/mdm/enable-admx-backed-policies-in-mdm)
