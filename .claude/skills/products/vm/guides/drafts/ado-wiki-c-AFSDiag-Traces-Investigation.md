---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/How Tos/How to Investigate AFSDiag Traces_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FHow%20Tos%2FHow%20to%20Investigate%20AFSDiag%20Traces_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.Azure-Files-Sync

- cw.How-To

- cw.Reviewed-12-2023

---

 

:::template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md

:::

 

[[_TOC_]]

 

# Overview of this document

AFSDiag provides ETL files which are process trace files. 

This document is a How-To guide for reading the ETL files.



# How to read ETL files on AFSDiag Traces folder

1. Download the InsightClient tools

    1. Connect Azure VPN and access to [Project Insight - Home](https://insightweb/)

    2. Click **[Try the Insight Client!]** and Install InsightClient tool. 



        Once click the link, application is automatically downloaded and installed.



        ![Project Inshight](/.attachments/SME-Topics/Azure-Files-Sync/How-to-Investigate-AFSDiag-Traces_inshigt-page.png)



        If you cannot download application with some errors, you can install from

        

        ```

        Path\\emeacat\InsightClient

		Application file ETWBench.application

        ```

	

2. Convert ETL file to Text format

	1. Preparation

    

        Ask Cx to get AFSDiag and  download your own device.

		Troubleshoot Azure File Sync - Azure | Microsoft Learn	

	2. Confirm the directory path which contains ETL files

		Usually, ETL files are placed under AFSDiag_<date&time>\Temp<date&time>\Traces folder.



	3. Convert ETL file to Text file using Insight Client 

        1. Past directory path for ETL files and Click [Scan Folder]

        2. Select ETL file which you want to convert

		3. Click [Convert/View]



        ![Insight Client](/.attachments/SME-Topics/Azure-Files-Sync/How-to-Investigate-AFSDiag-Traces_convert.png)



        **Information**



		On initial conversion, VPN connection is needed because InsightClient tool downloads symbol information from corp. net.

		Due the download  the first time this process runs it  will require several minutes (15m+) , but after that next attempts  to decode the ETL  are expected to be fast and less than 1m.  You can check progress from [Work Ques] tab.



        ![Insight Client Queue](/.attachments/SME-Topics/Azure-Files-Sync/How-to-Investigate-AFSDiag-Traces_insightclient-queue.png)



        **Information**:



        If the below message is appeared, select "Yes" to get information.



        ![Confirmation about TML](/.attachments/SME-Topics/Azure-Files-Sync/How-to-Investigate-AFSDiag-Traces_get-tmfinfo.png)



        **Information**:



        If you get below error message, select "Ignore Errors For This Provider".



        ![Error about conversion](/.attachments/SME-Topics/Azure-Files-Sync/How-to-Investigate-AFSDiag-Traces_missing-metadata-error.png)



	4. After finishing conversion, check the text files.



        ![Insight Client Output](/.attachments/SME-Topics/Azure-Files-Sync/How-to-Investigate-AFSDiag-Traces_insightclient-resultfiles.png)

	



# References

 

* Public document

 [**Troubleshoot Azure File Sync - Debug-StorageSyncServer cmdlet**](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/file-sync-troubleshoot#debug-storagesyncserver-cmdlet)

 

::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md

:::


