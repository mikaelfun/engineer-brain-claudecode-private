---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Azure Files Versus Blob_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Azure%20Files%20Versus%20Blob_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.How-To
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::

 


[[_TOC_]]

## Summary

Sometimes it is better to use Azure Files to store your data, other times it is better to use blob storage to store your data.

This article is intended to point you (or a customer) towards the best solution.

## More Information

The document in the **References** section provides details on when it is better to use Azure Files versus blob storage. To summarize (as of 12/5/2016):

### Pros for Azure Files

1.  Azure Files allows you to easily access data from multiple locations at the same time.
    1.  Page blobs can only be attached to one VM at a time. Block blobs require special software to be accessed (e.g. Storage Explorer - unless the blobs are shared publicly).
2.  Azure Files allows you to easily access data from any client worldwide that supports SMB 3.0+ (VM or on-prem), and from any in-region VM that supports SMB 2.1.
    1.  Blobs can only be attached to a VM, or accessed via special software (e.g. Storage Explorer) unless they are shared publicly.
3.  Azure Files allows you to have more directory layers.
    1.  With blob storage, you can't natively go any deeper than the container level (unless you put a slash in the container name to create a Virtual Directory).
4.  Azure Files can be accessed just as any other file share, providing easy compatibility with client applications. If an Azure Files share mapped as a drive, it will behave almost the same as any other local drive.

### Cons for Azure Files

1.  Azure Files is more expensive. As of 12/5/2016, it would cost about $82/month in West US 2 to store 1 TB in an Azure Files share, but about $51/month to store 1 TB in a page blob.
    1.  This applies to transactions as well as capacity. For example, as of 12/30/2016, 1 billion Put transactions in West US 2 would cost about $1500/month for Azure Files (100,000 transaction units \* 10,000 transactions/unit \* $.0150/unit). However, for Blob storage, it would cost about $36/month (10,000 transaction units \* 100,000 transactions/unit \* $0.0036/unit). <https://azure.microsoft.com/en-us/pricing/calculator/>
2.  Azure Files does not support RA-GRS, so you can't access you data read-only from the secondary region.
3.  Azure Files provides fewer encryption options.

## References

- [Deciding when to use Azure Blobs, Azure Files, or Azure Data Disks](https://learn.microsoft.com/en-us/azure/storage/common/storage-introduction#sample-scenarios-for-azure-storage-services)
- [Understand Azure Files billing](https://learn.microsoft.com/en-us/azure/storage/files/understanding-billing)

::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
