# VM Azure Compute Gallery (ACG) — 排查速查

**来源数**: 2 (AW, ML) | **条目**: 36 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot update Purchase Plan information (name, publisher, product) on an existing Azure Compute Gall | Purchase Plan properties are immutable after the Image Definition is created. Tw | Specify correct Purchase Plan info at Image Definition creation time (Portal Pub | 🔵 7.5 | AW |
| 2 | Cannot create Gallery Image Version - 400 InvalidParameter: version name must follow Major(int).Mino | Image Version name must follow semantic versioning: Major.Minor.Patch with numbe | Use correct format: e.g. 1.0.0, 2024.1.0. Only numbers and periods allowed. | 🔵 7.5 | AW |
| 3 | Gallery Image Version replication timeout after 6 hours - TimeoutException in CopySeedBlobsIntoRegio | Image too large causes replication timeout (default 6h). OS disk max 2TB. Data d | For OS disk: max 2TB. Data disk <1TB: delete and recreate version. Data disk >1T | 🔵 7.5 | AW |
| 4 | Failed to stop replication of image version in Azure Compute Gallery from Azure Portal. Customers tr | Safety profile feature (allowDeletionOfReplicatedLocations=false) is enabled by  | Set allowDeletionOfReplicatedLocations=true using Azure CLI: az sig image-versio | 🔵 7.5 | AW |
| 5 | VM created from latest image version in Azure Compute Gallery deploys a much older version instead o | By design, the latest image version is determined by semantic versioning (highes | Ensure new image versions use a higher semantic version number (e.g., 2.13.x or  | 🔵 7.5 | AW |
| 6 | LinkedAuthorizationFailed error when creating Azure Compute Gallery image version in cross tenant us | Known bug in Azure CLI version 2.69.0 and 2.70.0 due to a code change, confirmed | Upgrade Azure CLI to version 2.71.0 (which contains the fix), or downgrade to ve | 🔵 7.5 | AW |
| 7 | Azure Compute Gallery image version replication fails with ReplicationJobsTimedOut error when source | Replication times out when gallery image version contains large disks (>100GB).  | 1) Check if disks really need to be that large. 2) Keep source and destination r | 🔵 7.5 | AW |
| 8 | Cannot create VM Application version: 'The gallery application version name is invalid. Should follo | The version name does not follow the required semantic versioning format (Major. | Use version names following Major.Minor.Patch format, e.g. 1.0.0, 2018.12.1. Eac | 🔵 7.5 | AW |
| 9 | Cannot create VM Application version: 'Source Image .../applications/APPLICATION is not found. Check | The source application does not exist, is in a different region, or is in a diff | Verify: 1) The source application exists. 2) It is in the same region as the gal | 🔵 7.5 | AW |
| 10 | Gallery Image Version fails: diskControllerType mismatch - source missing NVMe support; known bug ca | Source OS disk diskControllerTypes does not include NVMe as required by target I | Update source disk: az resource update --ids <diskId> --set properties.supported | 🔵 6.5 | AW |
| 11 | Cannot create Image Definition - 409 Conflict: gallery image with same publisher/offer/sku already e | Publisher/Offer/SKU combination must be unique within the same gallery. | Change at least one of publisher, offer, or sku to make it unique. Use az sig im | 🔵 6.5 | AW |
| 12 | Cannot create Azure Compute Gallery - 409 Conflict InvalidResourceLocation: gallery name already exi | Gallery names must be unique within a subscription. Same name in different regio | Use a unique gallery name. Check existing galleries via az sig list or ASC. | 🔵 6.5 | AW |
| 13 | Cannot create Azure Compute Gallery - 400 Bad Request: gallery name invalid per validation rule | Gallery name contains invalid characters. | Use only uppercase/lowercase letters, digits, dots and periods for gallery name. | 🔵 6.5 | AW |
| 14 | Cannot create Gallery Image Version - NotFound: source image not found; must exist in same region an | Source managed image must exist, be in same region, and same subscription as the | Verify source image exists, is in same region and subscription. Move or recreate | 🔵 6.5 | AW |
| 15 | Cannot create Gallery Image Version - Conflict: source image being used by another replication curre | Source image is locked by another concurrent replication operation. | Wait for current replication to complete, then retry. | 🔵 6.5 | AW |
| 16 | Cannot delete Azure Compute Gallery or Image Definition - CannotDeleteResource: cannot delete before | ACG enforces hierarchical deletion order. Gallery > Definition > Version; must d | Delete in reverse order: (1) Image Versions (az sig image-version delete), (2) I | 🔵 6.5 | AW |
| 17 | Encryption is not supported for gallery image version with shared parent gallery when community shar | Community sharing does not support encrypted images. An image version with encry | Either (1) create the image version in a new gallery that has not been shared to | 🔵 6.5 | AW |
| 18 | Cannot share a gallery to community because it contains encrypted image versions. Error: Cannot shar | Gallery cannot be enabled for community sharing when it contains image versions  | Either (1) delete the encrypted image version(s), or (2) use a new gallery that  | 🔵 6.5 | AW |
| 19 | Authorization failure when trying to enable community sharing on gallery. Error: The client does not | The user, service principal, group, or managed identity used to enable community | Either (1) assign the Owner role to the user/service principal/group/managed ide | 🔵 6.5 | AW |
| 20 | Cannot delete a gallery that has been shared to the community. Error: Gallery is still shared to Com | Azure prevents deletion of galleries that are currently shared to the community. | Reset the permissions for the gallery to private (unshare from community) before | 🔵 6.5 | AW |
| 21 | Creating Azure Compute Gallery image version via Capture fails with Conflict error: 'The resource ha | The source VM was created from a Marketplace image with a purchase plan, but the | Re-create the Image Definition with the correct purchase plan information (name, | 🔵 6.5 | AW |
| 22 | Azure Compute Gallery image version update fails with error: 'The replication region and replica cou | When Shallow Replication is enabled for an image version, replication settings ( | Configure all desired replication regions and replica counts BEFORE enabling the | 🔵 6.5 | AW |
| 23 | Publishing image to Azure Compute Gallery fails with SubscriptionNotRegistered error: 'Cannot specif | The subscription is not enabled/registered for the specific target region. The M | Create a collaboration task and engage the Quota Team (SAP: Azure/Service and su | 🔵 6.5 | AW |
| 24 | VM Application deployment fails because the application version has been deprecated. Error: 'Current | Attempting to deploy a VM Application version that has already passed its deprec | Either change the expiry/deprecation date for the application version and retry, | 🔵 6.5 | AW |
| 25 | VM Application deployment fails: 'The maximum number of VM applications (max=5) has been exceeded.'  | Azure currently only supports a maximum of 5 VM Applications per VM or VMSS inst | Remove one or more existing VM Applications from the VM/VMSS before adding new o | 🔵 6.5 | AW |
| 26 | VM Application deployment fails: 'Storage account in the arguments does not exist.' No applications  | The specified VM Application does not exist or is not available for the current  | Verify that the application exists and is available for this subscription. Check | 🔵 6.5 | AW |
| 27 | VM Application deployment fails: 'The gallery image is not available in {region} region.' Gallery ap | The gallery application version exists but has not been replicated to the region | Update the gallery application version to replicate it to the required region, o | 🔵 6.5 | AW |
| 28 | Cannot create VM Application Definition in Azure Compute Gallery due to invalid name. Error: 'The en | The VM Application Definition name contains invalid characters. Names must start | Use only valid characters for the definition name: uppercase/lowercase letters,  | 🔵 6.5 | AW |
| 29 | Cannot create VM Application version: 'The gallery application version url cannot be accessed: NotFo | The package file URL (packageFileId) points to a blob that does not exist, is no | Verify the blob exists in the storage account, ensure it is either publicly acce | 🔵 6.5 | AW |
| 30 | Cannot create VM Application version: 'The blob referenced by source uri is too big. The maximum blo | The package file or default configuration file exceeds the maximum allowed size  | Reduce the package file size to below 1 GB. Both the package file and default co | 🔵 6.5 | AW |
| 31 | Cannot create VM Application version: 'Append blob type is not supported for PutGalleryApplicationVe | The package file is stored as an append blob in Azure Storage. VM Application ve | Re-upload the package file as either a block blob or page blob. Append blobs are | 🔵 6.5 | AW |
| 32 | Cannot delete Azure Compute Gallery application definition; error: Gallery application still has gal | Gallery application definition still has one or more application versions undern | Delete all application versions under the gallery application definition first,  | 🔵 6.5 | AW |
| 33 | Cannot update gallery application version properties; error: Changing property galleryApplicationVer | Only a limited set of properties can be changed on existing gallery application  | Confirm the property being changed is one of the allowed update properties (targ | 🔵 6.5 | AW |
| 34 | VM Application version publishing fails with SAS URI is not valid error when using Az.Storage PowerS | Known bug in Az.Storage PowerShell module version 3.12.0 that generates invalid  | Downgrade Az.Storage to version 3.11.0: 1) Uninstall-Module Az.Storage, 2) Close | 🔵 6.5 | AW |
| 35 | Customer needs to uninstall VM Application from a virtual machine while keeping the application in t |  | Use PowerShell: 1) $vm = Get-AzVM -ResourceGroupName <rg> -Name <vm>  2) Remove- | 🔵 5.5 | AW |
| 36 | Allocation failure when deploying VM from custom/gallery/marketplace image. New VM request fails bec | New VM allocation request is pinned to a cluster that either does not support th | Cause 1 (size not supported): Retry with smaller size, or stop all VMs in availa | 🔵 5.5 | ML |

## 快速排查路径

1. **Cannot update Purchase Plan information (name, publisher, product) on an existin**
   - 根因: Purchase Plan properties are immutable after the Image Definition is created. Two Image Definitions within the same ACG 
   - 方案: Specify correct Purchase Plan info at Image Definition creation time (Portal Publishing options tab, CLI az sig image-definition create, or PowerShell
   - `[🔵 7.5 | AW]`

2. **Cannot create Gallery Image Version - 400 InvalidParameter: version name must fo**
   - 根因: Image Version name must follow semantic versioning: Major.Minor.Patch with numbers and periods only.
   - 方案: Use correct format: e.g. 1.0.0, 2024.1.0. Only numbers and periods allowed.
   - `[🔵 7.5 | AW]`

3. **Gallery Image Version replication timeout after 6 hours - TimeoutException in Co**
   - 根因: Image too large causes replication timeout (default 6h). OS disk max 2TB. Data disk >1TB may fail.
   - 方案: For OS disk: max 2TB. Data disk <1TB: delete and recreate version. Data disk >1TB: not fully supported. Reduce target regions initially, add more late
   - `[🔵 7.5 | AW]`

4. **Failed to stop replication of image version in Azure Compute Gallery from Azure **
   - 根因: Safety profile feature (allowDeletionOfReplicatedLocations=false) is enabled by default for all image versions created w
   - 方案: Set allowDeletionOfReplicatedLocations=true using Azure CLI: az sig image-version update --resource-group <rg> --gallery-name <gallery> --gallery-imag
   - `[🔵 7.5 | AW]`

5. **VM created from latest image version in Azure Compute Gallery deploys a much old**
   - 根因: By design, the latest image version is determined by semantic versioning (highest MajorVersion.MinorVersion.Patch), not 
   - 方案: Ensure new image versions use a higher semantic version number (e.g., 2.13.x or 2.12.18 instead of 2.2.35). Alternatively, deploy VMs using a specific
   - `[🔵 7.5 | AW]`

