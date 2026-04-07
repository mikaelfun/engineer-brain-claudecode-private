---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Administrator Protection - Adminless/Scoping, Troubleshooting and Log Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAdministrator%20Protection%20-%20Adminless%2FScoping%2C%20Troubleshooting%20and%20Log%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Administrator Protection - Scoping, Troubleshooting and Log Collection

## Troubleshooting Scenarios

1. Customer has enabled the Administrator Protection using any one of the supported methods but the end user does not experience the elevation.

2. I am running a Microsoft application or MMC or applet which needs elevation but I am getting an error instead of elevation.

3. I am running a 3rd Party application or MMC or applet which needs elevation but I am getting an error instead of elevation.

4. An application developer reports that their custom extensions and settings are missing when they launch the IDE, and they are unable to access certain project directories.

**What's happening underneath the hood:** When an IDE like Visual Studio is launched with elevated (administrator) permissions, it operates in a different Windows security context than when run as a standard user. This elevated context isolates the process from the standard user environment, meaning it accesses a different user profile, registry hive, and file system paths (e.g., `%APPDATA%`, `%LOCALAPPDATA%`, and user-specific folders).

As a result, extensions and settings installed or configured under the standard user profile are not visible or accessible in the elevated session.

Additionally, when Windows' administrator protection (such as UAC virtualization or Admin Approval Mode) is enabled, it further restricts how elevated processes interact with user-level components, leading to potential incompatibilities.

**(Ex: Visual Studio)**

**Answer:** It appears that the development environment is being run with elevated (administrator) permissions. This can lead to several issues:
- **Extensions**: Extensions installed under your standard user account may not be visible or accessible when running elevated.
- **Settings**: Some settings are stored in user-specific locations and may not carry over between elevated and non-elevated sessions.
- **File Access**: Default paths may point to directories associated with the admin account, which could be inaccessible when not elevated.

**Recommended Action**:
- Try launching the IDE without elevated permissions (i.e., as a standard user).
- If elevated permissions are required for specific tasks, consider switching back to standard mode afterward to maintain consistency.
- Ensure that any required extensions are installed for both elevated and non-elevated contexts if needed.

## Enabling & Viewing Logs

There are two methods to enable logging:

### Method 1: Enable LUA - Analytical and Debug Logs

1. Open Event Viewer
2. Enable **Show Analytic and Debug Logs**
3. Expand **Applications and Services Logs > Microsoft > Windows**
4. Search for **LUA** - Scroll 3/4th to find LUA
5. Right click on **CredUI/Elevation** and select **Enable log**

### Method 2: Enabling tracing using Logman command

1. Start an elevated command prompt
2. Run the below command to enable tracing using logman:
   ```
   logman start MyTraceSession -p {93c05d69-51a3-485e-877f-1806a8731346} -ets
   ```
3. **Reproduce the behavior:**
   - Scenario 1: Elevate a command prompt and provide correct password
   - Scenario 2: Elevate a command prompt and provide a wrong password
4. Stop the tracing using the below command:
   ```
   logman stop MyTraceSession -ets
   ```

### How to view the ETL logs

1. Open Event Viewer
2. Select section **Saved Logs**
3. Right click on **Open Saved log**
4. (By default the log files are saved under `C:\Windows\System32` folder)
5. Filter for **EventID: 15031 - 15032**
   - **Success EventID: 15031**
   - **Failure EventID: 15032**
