---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Storage/CIFS Credits Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FCIFS%20Credits%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---


# CIFS low credits troubleshooting for intermittent SMB/CIFS connectivity issues

Author: @Author

[[_TOC_]]

## Summary

For intermittent SMB/CIFS connectivity issues this TSG should assist in identifying if nodes in a cluster are running out of credits when attempting to connect to a storage account

### Symptoms

- The most common symptom we have experienced are 'host is down' errors intermittently showing up requiring a restart of a pod before being resolved
- Some light storage account throttling (this was only reported in a single case at this point)

## Cause

Per our SMB dev team:

    The SMB protocol uses credits as a mechanism to limit the number of outstanding requests on a connection at any time.
    
    Due to a regression on the Linux SMB client introduced in the 5.10 kernel,  the number of outstanding requests accounted by the client can go wrong. Following this event, the client accounted SMB credits on this connection can slowly decrease until it reaches a point where the client starts failing requests due to what the client thinks is insufficient number of credits. We have submitted an upstream fix for this issue to the mainline kernel version 6.5, and we are following up with requests for various distributions like Ubuntu/SLES/RHEL to backport this fix into their stable kernels. We expect the kernel update to be available during the next update cycle.
    
    Ref:
    
    https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=69cba9d3c1284e0838ae408830a02c4a063104bc
    
    https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=e8eeca0bf4466ee1b196346d3a247535990cf44d

## Identification Steps, Temporary Mitigation, & Email Template

 1. Have your customer implement one of the following daemonsets within
    their cluster(both should be identical). By default it will log all CIFS debug data to "/tmp/cc_logs", these debug logs do rotate, however if a low CIFS credit alert is triggered, it will log to /var/log/syslog (which also rotates just not as frequently as the CIFS debug logs):

    ![Logging-to-syslog-for-cifs-credits-issues.jpg](./.attachments/cifs-credits-attachments/CIFS-credits-code-snip.jpg)
     - <https://github.com/jamesonhearn/daemonset-repro/blob/main/cifs-debug.ds.yaml>

     - <https://github.com/Jtaylorthegreat/Kubernetes-References/blob/master/CIFS-Node_troubleshooting-Daemonset/cifs-debug.ds.yaml>

 2. Once a reproduction of the behavior has occurred, have your customer upload all the logs from /tmp/cc_logs as well as all /var/log/syslog files (this includes all the syslog files in rotation syslog.2.gz, syslog.3.gz, etc.)
 3. When examining the logs there are a few key indicators that indicate they have ran into a low cifs credits alert on that node, the best indicator would be when checking /var/log/syslog for "CIFS_CREDIT_ALERT", an example from an earlier case that ran into this issue would look like so:

![reading-var-log-syslog-for-low-credit-alerts.jpg](./.attachments/cifs-credits-attachments/CIFS-credits-screenshot.jpg)

An easier way to look for this line through all syslog files including the .gz files from WSL or a Linux jump box would be to run the following command in BASH:

```zgrep 'CIFS_CREDIT_ALERT' syslog.*```

You can also get a count of how many instances this happened overall by running the following :

```zgrep 'CIFS_CREDIT_ALERT' syslog.* | wc -l```

![zgrep-for-low-credits-alerts-in-syslog.jpg](./.attachments/cifs-credits-attachments/CIFS-credits-screenshot2.jpg)

![get-count-of-low-credit-alerts-in-syslog.jpg](./.attachments/cifs-credits-attachments/CIFS-credits-screenshot3.jpg)

4. Another indicator you can check when looking through the cc_logs received from the customer is the "cifs_credit_history" file, you may be able to see which storage account hostnames they were running into low credit alerts with:

![reading-through-cifs_credit_history-log.jpg](./.attachments/cifs-credits-attachments/CIFS-credits-screenshot4.jpg)

5. Once Properly Identified by finding either "CIFS_CREDIT_ALERT" entries in /var/log/syslog  or "LOWCRED" alerts in the cifs_credit_history file of the host node, you can reference the following icm and use the template below to send out to the customer:
<https://portal.microsofticm.com/imp/v3/incidents/details/405877736/home>

Template you can use to send to customer:

    Per our SMB dev team:
    
    The SMB protocol uses credits as a mechanism to limit the number of outstanding requests on a connection at any time.
    
    Due to a regression on the Linux SMB client introduced in the 5.10 kernel, the number of outstanding requests accounted by the client can go wrong. Following this event, the client accounted SMB credits on this connection can slowly decrease until it reaches a point where the client starts failing requests due to what the client thinks is insufficient number of credits. We have submitted an upstream fix for this issue to the mainline kernel version 6.5, and we are following up with requests for various distributions like Ubuntu/SLES/RHEL to backport this fix into their stable kernels. We expect the kernel update to be available during the next update cycle.
    
    Ref:
    
    https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=69cba9d3c1284e0838ae408830a02c4a063104bc
    
    https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=e8eeca0bf4466ee1b196346d3a247535990cf44d
    
    In the meantime if the Linux client bug is seen again then the recommended mitigation is to reboot the client VM, (or in this case reboot the pod).

## Disclaimer

***Please note if you do not see either a CIFS_CREDIT_ALERT in the syslog files or a LOWCRED alert when looking at cifs_credit_history there is a chance that they may not be running into this particular issue, in which case you can take all the acquired logs and escalate via ICM to the EEE AKS team with an ask to request assistance from the storage team for triage of CIFS data**_

Further SMB/CIFS troubleshooting tools can be found here:

<https://github.com/Azure-Samples/azure-files-samples/tree/master/SMBDiagnostics>

## Owner and Contributors

**Owner:** Justin Taylor <jutayl@microsoft.com>
**Contributors:**

- Justin Taylor <jutayl@microsoft.com>
