---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/Workflows/Soft Delete for File Shares_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FWorkflows%2FSoft%20Delete%20for%20File%20Shares_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Soft Delete for File Shares (Preview)

Azure Storage now offers soft delete for file shares so that you can more easily recover your data when it is erroneously modified or deleted by an application or other storage account user.

## How soft delete works

When enabled, soft delete enables you to save and recover your file shares when they are deleted. When data is deleted, it transitions to a soft deleted state instead of being permanently erased. You can configure the amount of time soft deleted data is recoverable before it is permanently expired.

Soft delete is backwards compatible, so you don't have to make any changes to your applications to take advantage of the protections this feature affords.

You can enable soft delete on your existing file shares.

## Configuration settings

When you create a new account, soft delete is off by default. Soft delete is also off by default for existing storage accounts. You can toggle the feature on and off at any time during the life of a storage account.

If you enable soft delete for file shares, delete some file shares, and then disable soft delete, you will still be able to access and recover those file shares, if those shares were saved when soft delete was enabled.

When you turn on soft delete, you also need to configure the retention period. The retention period indicates the amount of time that soft deleted file shares are stored and available for recovery. For file shares that are explicitly deleted, the retention period clock starts when the data is deleted. **Currently you can retain soft deleted shares for between 1 and 365 days.**

**You can change the soft delete retention period at any time.** An updated retention period will only apply to shares deleted after the retention period has been updated. Shares deleted previous to the retention period update will expire based on the retention period that was configured when that data was deleted.

## Case Handling

Soft delete feature for Azure File Shares is currently supported by the IaaS Incubation team. Please use the following support topics:

- `/Routing Azure Storage File/Deletion and Recovery/Issue using soft delete feature`
- `/Routing Azure Storage File/Deletion and Recovery/Recover deleted file share`

## Escalation Path

Escalate issues using File Storage Ava Teams Channel.

## Pricing and billing

There is no additional capacity charge for soft deleted data. Soft deleted file share data is billed at the normal file share capacity rate. No additional charges for using the soft delete feature.

Soft delete retention duration can be configured independently for new and existing storage accounts.
