# AKS 通用排查 — general — 排查工作流

**来源草稿**: ado-wiki-b-Logrotate-Conflicts.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Logrotate Failures Cause Insufficient Disk Space
> 来源: ado-wiki-b-Logrotate-Conflicts.md | 适用: 适用范围未明确

### 排查步骤

#### Logrotate Failures Cause Insufficient Disk Space


#### Summary

Logrotate is responsible for managing OS log files (the contents under `/var/log` such as `message`, `syslog`, `kern.log`, and `auth.log` to name a few). This includes rotating log files older than a certain age or larger than a certain size and cleaning up outdated log files from the system as they age.

#### Reported and Observed Symptoms

- Kubernetes nodes are running out of disk space
- `kubectl describe node` shows `DiskPressure` condition
- `kubectl get events` shows `FreeDiskSpaceFailed` events (example: `Warning  FreeDiskSpaceFailed  3m5s (x167 over 13h)  kubelet, aks-linuxpool-<nodepoolnumber>-<intancenumber>  (combined from similar events): failed to garbage collect required amount of images. Wanted to free 1527503257 bytes, but freed 0 bytes`)

#### Cause

In scenarios where multiple systems are performing log management (such as OMSAgent) in addition to logrotate, there's the potential for log rotation to be reversed by the other system. This can result in log files not being rotated and cleaned up as expected, which can lead to disk space issues.

Additional logrotate configuration files or settings could also cause logrotate to error or behave unexpectedly, resulting in large, unrotated, or large quantities of log files on the nodes in the cluster.

Even though Kubelet is running clean up processes to remove stale or unused images from the nodes, the majority of disk space is taken up by log files and the clean up processes are not able to free up enough space to resolve the issue.

#### Mitigation Steps

Mitigation steps for logrotate issues will vary depending on the root cause of the issue. The following steps can be used to identify the root cause and determine the appropriate mitigation steps.

1. Using the following commands, verify that the log files are consuming the majority of disk space on the node:

   ```bash
   df -kh # show disk usage by mount point
   du -ah / | sort -hr | head -n 20 # For the root mount point, show the top 20 directories or files by size

   # if /var/log/* shows up in the output of the command above, then we can re-run the du command
   # with a more specific path to see which log files are consuming the most space
   du -ah /var/log | sort -hr | head -n 20

   # we now know if the log files are really growing in size to the point
   # where we need to take action to rotate or clean them up
   #
   # lets check if logrotate is running into any issues
   # by running the following command
   logrotate -d /etc/logrotate.conf
   systemctl status logrotate # this will show the systemd status for the logrotate service
   systemctl status rsyslog # this will show the systemd status for the rsyslogd service
   ```

After running the above steps, we know a lot more about the state of `logrotate` and `rsyslogd` and can make a better decision on how to proceed.

##### If log files are consuming the majority of disk space and logrotate is not running into any issues

If the log files are consuming the majority of disk space and logrotate is not running into any issues, then we can proceed with the following steps to clean up the log files and free up disk space:

1. Work with the customer team to determine how many days of historical logs they'd like to keep on their node(s). Once we know this information then we can proceed with cleanup steps. It's important to note that the timestamps displayed by `ls -lah` may not actually represent the full date range inside a log file. For example, a log file may have a timestamp of 2020-01-01 but the contents of the log file may contain entries from 2019-12-01. This is why it's important to work with the customer team to determine how many days of historical logs they'd like to keep on their node(s).

   You can use `head -n 1` and `tail -n 1` to get the first and last lines of a file, respectively. This can be used to determine the date range of a log file.
2. Once we know the number of days the customer would like to keep logs for, we can remove any unnecessary log files from the nodes.

##### Configuration files are causing logrotate to error or behave unexpectedly

If the output of `logrotate -d /etc/logrotate.conf` shows that logrotate is running into issues or `systemctl status rsyslog` shows errors or a dead service, then we'll need to work with the customer team to determine the root cause of the issue and determine the appropriate mitigation steps.

The config files of interest are:

- `/etc/logrotate.conf`
- `/etc/logrotate.d/*`
- `/etc/rsyslog.conf`
- `/etc/rsyslog.d/*`

The debug output from `logrotate` should indicate which configuration file conflicts are causing it to fail. If we inspect `/var/log/syslog` and see errors similar to the following, then we know that there's a conflict between the logrotate configuration and the configuration of the Azure Linux Agent (waagent):

```bash
logrotate[<pid>]: error: waagent-extn.logrotate:1 duplicate log entry for /var/log/azure/ (exntension/extension.log)
logrotate[<pid>]: error: found error in file waagent-extn.logrotate, skipping
logrotate[<pid>]: logrotate.service: Failed with result 'exit-code'.
logrotate[<pid>]: Failed to start Rotate log files.
```

If the `waagent` extension is installed on the node, there are two potential solutions to mitigate the logrotate issues:

#### Solution 1 - Update OMSAgent config files to let logrotate manage all log files

1. Edit the `/etc/logrotate.d/waagent-extn.logrotate` file and comment out the lines that begin with `/var/log/azure` by putting a `#` in front of the settings.
2. Restart the logrotate service - `systemctl restart logrotate`

#### Solution 2 - Remove wildcards from the logrotate configuration to allow more granular control

1. Edit the `/etc/logrotate.d/waagent-extn.logrotate` file and remove the wildcard from the log file path. For example, change `/var/log/azure/*/*.log` to `/var/log/azure/extension.log`. You can add additional logrotate configuration files under `/etc/logrotate.d/` to manage the other log files.
2. Restart the logrotate service - `systemctl restart logrotate`.

#### References

- <https://supportability.visualstudio.com/AzureLinuxNinjas/_wiki/wikis/AzureLinuxNinjas/587752/Azure-extensions-logrotate-conflict>
- <https://portal.microsofticm.com/imp/v3/incidents/details/231114349/home>

---
