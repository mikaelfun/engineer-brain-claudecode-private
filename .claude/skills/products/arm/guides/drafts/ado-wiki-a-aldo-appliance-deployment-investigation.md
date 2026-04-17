---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Customer Scenarios/Deployment and Integration/Deployment Issues/Appliance Deployment Investigation"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Customer%20Scenarios/Deployment%20and%20Integration/Deployment%20Issues/Appliance%20Deployment%20Investigation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

### Appliance Deployment Investigation

#### Introduction

This guide outlines the main steps involved in importing and configuring the appliance, based on the provided log files. The steps are divided into two main sections: Importing the Appliance and Configuring the Appliance.

Logs will be located in SeedNode under path: C:\ProgramData\Microsoft\AzureLocalDisconnectedOperations\Logs

#### Roles of the Log Files

In the context of Winfield logs, there are three primary types of log files, each serving a specific role in the deployment and configuration process:
1.  **InstallAppliance Logs**
    *   **Purpose**: These logs capture the details of the appliance installation process. They include information about the start and end times of the installation, as well as any steps or actions taken during the installation, which includes the next two steps (Import Appliance and Configure Appliance).
    *   **Role**: The InstallAppliance logs are crucial for understanding the sequence of events and any issues that may arise during the installation phase. They provide a timeline of the installation process, which can be used to identify when and where problems occur.
    *   **File Types**: `InstallAppliance_*.txt`
2.  **ImportAppliance Logs**
    *   **Purpose**: These logs document the process of importing the appliance. This includes validation of the Host, configuring Appliance networking and configuring management endpoint.
    *   **Role**: The ImportAppliance logs are essential for verifying that the appliance configuration has been correctly imported. They help identify any errors or issues that occur during the import process, which can affect the overall functionality of the appliance.
    *   **File Types**: `Import_Appliance_*.json`, `Import_Appliance_*.txt`
3.  **ConfigureAppliance Logs**
    *   **Purpose**: These logs record the configuration steps taken after the appliance has been installed and imported. This includes setting up network configurations, import external certificates, configuring ingress endpoint, Observability and identity.
    *   **Role**: The ConfigureAppliance logs are important for ensuring that the appliance is correctly configured according to the desired specifications. They provide a detailed account of the configuration process, which can be used to troubleshoot any issues that arise during or after configuration.
    *   **File Types**: `Appliance_Configuration_*.json`, `ConfigureAppliance_*.txt`

#### Main Steps for Importing and Configuring the Appliance

The process of importing and configuring the appliance involves several validation and deployment steps to ensure that the appliance is correctly set up and ready for use. Here are the key steps:
1.  **Importing the Appliance**
    *   **Validation Steps**:
        *   **TestDownloadAppliance**: Validates the ability to download the appliance.
        *   **Host Validation**:
        *   **TestApplianceHostCleanness**: Ensures the host is clean.
        *   **TestHostOsVersion**: Checks the operating system version.
        *   **VerifyProcessor**: Verifies the processor.
        *   **VerifyPhysicalRAM**: Checks the physical RAM.
        *   **VerifyApplianceDiskSpace**: Ensures there is enough disk space.
        *   **Network Setup**:
        *   **TestApplianceRequiredVSwitches**: Validates the required virtual switches.
        *   **Configuration Validation**:
        *   **VerifyApplianceManifestJsonFile**: Verifies the appliance manifest JSON file.
        *   **VerifyManagementEndpointConfig**: Checks the management endpoint configuration.
        *   **VerifyObservabilityConfiguration**: Verifies the observability configuration.
    *   **Deployment Steps**:
        *   **ExpandIrvmZipFile**: Expands the IRVM zip file.
        *   **UpdateVmCapacity**: Updates the VM capacity.
        *   **ImportAndStartVM**: Imports and starts the VM.
        *   **NetworkSetupPostImport**: Configures the network post-import.
        *   **ConfigureManagementEndpoint**: Configures the management endpoint.
2.  **Configuring the Appliance**
    *   **Validation Steps**:
        *   **VerifyObservabilityConfiguration**: Verifies the observability configuration.
        *   **Ingress NIC Validation**: Validates the ingress network interface card.
        *   **VerifyDnsSetupForAppliance**: Verifies the DNS setup for the appliance.
    *   **Configuration Steps**:
        *   **ConfigureIngressEndpoint**: Configures the ingress endpoint.
        *   **ImportExternalCertificates**: Imports external certificates.
        *   **ConfigureObservability**: Configures observability settings.
        *   **ConfigureExternalIdentity**: Configures external identity.
        *   **PostConfiguration**:
            *   **WaitApplianceReady**: Waits for the appliance to be ready.

#### Script

The script provided below will parse the log files, extract relevant information, and group them based on overlapping time windows. Each time a deployment is attempted, the InstallAppliance log will contain all the information for both import and configure steps. The script will help you group these logs for better analysis.

```powershell
# Get all text files from the specified directory
$files = Get-ChildItem -Path "C:\InstallationLogs" -Filter "*.txt"

# Initialize an array to store the results
$results = @()

# Step 1: Parse each file to extract StartTime, EndTime, and Duration
foreach ($file in $files) {
    $content = Get-Content $file.FullName

    # Extract StartTime and EndTime using regex
    $startTime = ($content | Where-Object { $_ -match "Start time: (\d{14})" }) -replace "Start time: ", ""
    $endTime = ($content | Where-Object { $_ -match "End time: (\d{14})" }) -replace "End time: ", ""

    # If both StartTime and EndTime are found, calculate the duration
    if ($startTime -and $endTime) {
        $startTimeFormatted = [datetime]::ParseExact($startTime, "yyyyMMddHHmmss", $null)
        $endTimeFormatted = [datetime]::ParseExact($endTime, "yyyyMMddHHmmss", $null)
        $duration = $endTimeFormatted - $startTimeFormatted

        # Add the parsed information to the results array
        $results += [PSCustomObject]@{
            FileName   = $file.Name
            StartTime  = $startTimeFormatted
            EndTime    = $endTimeFormatted
            Duration   = $("{0} hours, {1} minutes, {2} seconds" -f $duration.Hours, $duration.Minutes, $duration.Seconds)
        }
    }
}

# Step 2: Sort the files by StartTime to ensure they're processed in order
$sortedResults = $results | Sort-Object StartTime

# Step 3: Initialize variables to handle the grouping
$currentGroup = @()

# Filter InstallAppliance files from the sorted results
$InstallApplianceFiles = $sortedResults | Where-Object { $_.FileName -like "InstallAppliance_*" }

# Loop through each InstallAppliance file
foreach ($InstallApplianceFile in $InstallApplianceFiles) {
    # Initialize a group with the InstallAppliance file
    $currentGroup = @($InstallApplianceFile)

    # Check for ImportAppliance files that overlap
    foreach ($file in $sortedResults) {
        if ($file.FileName -like "ImportAppliance_*") {
            if ($file.StartTime -ge $InstallApplianceFile.StartTime -and $file.StartTime -le $InstallApplianceFile.EndTime) {
                $currentGroup += $file
            }
        }
        if ($file.FileName -like "ConfigureAppliance_*") {
            if ($file.EndTime -ge $InstallApplianceFile.StartTime -and $file.EndTime -le $InstallApplianceFile.EndTime) {
                $currentGroup += $file
            }
        }
    }
}
```
