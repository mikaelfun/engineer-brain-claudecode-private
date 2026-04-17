---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Connect & Copy/Data Copy very slow when copying to Data Box"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FConnect%20%26%20Copy%2FData%20Copy%20very%20slow%20when%20copying%20to%20Data%20Box"
importDate: "2026-04-05"
type: troubleshooting-guide
---

This TSG on how to troubleshoot some performance (slow transfers) issues from the Host/Client machine to the Azure Data Box 

_**Cause 1**_

There are millions of very small sized files

Troubleshooting Steps
---------------------

*   While troubleshooting the issue of slow data copy to the Data Box start with asking customers the below questions.
*   How much time it takes to copy a file which is of size 10 GB vs multiple files of size 10 GB.
*   Is it taking the same time to copy the files to a different machine over the network and to the Data Box device.
*   Ask whether the customer is copying millions of small sized files over to the Data Box.
*   If the customer says that they are copying millions of small sized files then inform them it will take longer time. It is not possible to estimate the time that will be needed for the copy job to complete as it will depend on several factors.
*   Typically, small sized files take longer (as there are more components involved on the transfer that needs to be verified multiple times, such as files metadata) - You can refer the customer to attempt to use robocopy (for mostly small files < 512 KB, we recommend having 2 Robocopy sessions, 16 threads per session):

https://social.technet.microsoft.com/wiki/contents/articles/1073.robocopy-and-a-few-examples.aspx

_**Cause 2**_

The actual host machine from where the copy is happening is working slow

Troubleshooting Steps
---------------------

*   The other reason for slow data copy could be that the host machine itself is have a performance problem.
*   To isolate if the host machine is slow ask the customer to try the copy from a different machine altogether.
*   If that's not possible, try and see the overall performance of the machine by copying the same files to a local volume or any other location.
*   Try to open some applications and check how the machine behaves, is it still working slow.
*   Copy files from one volume to other volume on the same machine and see if the copy job is slow.
*   If the issue is still the same collect a PerfMon trace and engage the windows performance team to check the performance of the host machine

https://techcommunity.microsoft.com/t5/ask-the-performance-team/windows-performance-monitor-overview/ba-p/375481

_**Cause 3**_

*   In some cases, the 3rd party filter drivers can also interrupt the data copy job and make the copy job slow.
*   To check the 3rd party filter drivers run the fltmc command: How to check filter drivers.
*   Once you have checked the filter drivers and found any 3rd party filter drivers, ask the customer to remove/unload the filter drivers.
*   Remove the filter drivers one by one to eliminate the filter driver causing the issue.
*   Once you have isolated the filter driver causing the issue, ask the customer to get in touch with the 3rd party application team and resolve the issue.

Public Documentation
--------------------

https://docs.microsoft.com/en-us/azure/databox/data-box-deploy-copy-data
