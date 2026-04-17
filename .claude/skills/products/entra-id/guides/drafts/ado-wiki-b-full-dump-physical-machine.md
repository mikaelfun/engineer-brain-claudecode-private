---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Tools/ADPerf: Diagnostic Collection Tools/Memory Dumps/Full Dump: Physical Machine"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20Tools%2FADPerf%3A%20Diagnostic%20Collection%20Tools%2FMemory%20Dumps%2FFull%20Dump%3A%20Physical%20Machine"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Configuring Full Memory Dump on Physical Machine

## Set up Page File

1. Click **Start** > right-click **Computer** > **Properties**
2. Click **Advanced system settings** > **Advanced** tab
3. Click **Settings** under **Performance**
4. Click **Advanced** tab > **Change** under **Virtual memory**
5. Select the system partition
6. Clear **Automatically manage paging file size for all drives**
7. Set **Initial size** and **Maximum size** = physical RAM + 100 MB (Custom Size)
8. Click **Set** > **OK** three times

## Set up Complete Memory Dump

Open `sysdm.cpl` > Advanced tab > Startup and Recovery > Settings > System Failure > Complete memory dump

1. Open System Properties: `Start` > `Run` > `sysdm.cpl`
2. Select **Advanced** tab
3. Under **Startup and Recovery**, click **Settings...**
4. Under **System failure** > **Write debugging information**, select **Complete memory dump**
5. Click **OK**

## Registry Method

### Set CrashDumpEnabled=1

```
Registry Path: HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\CrashControl
Setting: CrashDumpEnabled
Type: REG_DWORD
Value: 1
```

### Set CrashOnCtrlScroll=1 (USB keyboards)

```
Path: HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\kbdhid\Parameters
Setting: CrashOnCtrlScroll
Type: REG_DWORD
Value: 1
```

**Reboot** for these keys to take effect.

## Triggering the Dump

Next time the issue occurs, with a keyboard ready, hold down the **right CTRL** key and press **Scroll Lock** twice to trigger the dump.
