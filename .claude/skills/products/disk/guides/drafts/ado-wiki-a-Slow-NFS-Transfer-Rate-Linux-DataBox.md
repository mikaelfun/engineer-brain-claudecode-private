---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Connect & Copy/Slow NFS Transfer Rate between Linux Servers and Data Box"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FConnect%20%26%20Copy%2FSlow%20NFS%20Transfer%20Rate%20between%20Linux%20Servers%20and%20Data%20Box"
importDate: "2026-04-05"
type: troubleshooting-guide
---

Description / Overview
----------------------

Use this guide to troubleshoot a slow NFS transfer rate between Linux host(s) and an Azure Data Box Pod device.

Known Issues
------------

There are several possible causes for slowness in the NFS transfer rate. These include:
*   Network I/O — Depending on the setting, the bandwidth provided to the shares for the data transfer may not be sufficient for the amount of data the customer is transferring. Low bandwidth can lead to delays and slowness in the transfer of data.
    
*   Disk I/O — If there are numerous operations occurring on the nodes in addition to data transfer, read/write operations on the disk of the NFS share (mount) itself can experience slowness due to being overburdened.
    
*   Data — If there is a large amount of data, it will take a longer amount of time to transfer from one location to another. If the files are being converted to another format during transfer (e.g., converted to the .tar format where metadata is preserved), this may take more time to complete depending on the location of the conversion (source machine vs. the Data Box device), and the size of the file after the conversion has completed.
    

Resolution
----------

Eliminate each possible cause by discussing the following with the customer:

> 1.  What is the environment like?

1.  **Shares:** Where are the NFS shares (mounts) located? Are the shares (mounts) in a cluster? If so, how many nodes are in said cluster? Is there a load balancer affecting these shares (mounts)?

2.  **Data:** What kind of data is being transferred to the Data Box device? Is it being converted in any way? What is the Data Box destination (e.g., Block blob, Page blob, Azure Files, Managed Disks)? What is the size of the files/folders being copied to the device?
3.  **Data Transfer:** Is there a benchmark speed available to compare the current speeds with? Is the data transfer happening on each node at the same time to the Data Box device?
4.  **Which network ports have been set up for use on the Data Box device?**
    *  The DATA1 and DATA2 ports are 10Gbps. DATA3 has 10Gbps capability, but is set to 1Gbps by default.
5.  **Is there any other network activity occurring on the host(s)?**
    *  Verify with the customer if there is any other network activity occurring on the host apart from the data transfer to the Data Box device.
6.  **Is the issue isolated to the Data Box device?**
    *  Compare the transfer speeds to the Data Box device to that of the local disk by copying data from the NFS share to a local disk on the host itself.
7.  **Is the cluster causing the issue?**
    *  Try copying data to the Data Box device from just one node at a time — Note: This troubleshooting step can only be performed if the NFS shares are in a cluster.
8.  **Is the data transfer better when copying small files?**
    *  Compare the transfer speed of a large file or an average-sized file to that of a small file.

After discussing the above points with the customer, you should be able to narrow down the exact cause of the slow NFS transfer rate issue. Some general recommendations for a customer transferring data to a Data Box device via NFS are as follows:
*   If possible, make sure to use the 10Gbps connections in lieu of the 1Gbps connections.
*   Make sure enough bandwidth has been allocated to the shares for the data transfer.
*   Use only one node at a time to transfer data to a Data Box device.
*   Limit outside operations as much as possible on the node to prevent disk I/O slowness.
*   If the data must be converted, convert the data **before** transferring the data to the Data Box device.
