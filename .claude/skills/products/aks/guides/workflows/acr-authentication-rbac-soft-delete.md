# AKS ACR 认证与 RBAC — soft-delete — 排查工作流

**来源草稿**: ado-wiki-a-acr-soft-delete.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: ACR Soft-Delete
> 来源: ado-wiki-a-acr-soft-delete.md | 适用: 适用范围未明确

### 排查步骤

#### ACR Soft-Delete


#### Overview

The _soft-delete_ feature allows customers to restore deleted images from their repositories without involving Customer Support. Soft-deleted items are kept in a **Recycle Bin** and are recoverable via customer action.

- **soft-delete**: state of an image deleted from a repository but recoverable
- **Recycle Bin**: collection of images in soft-delete state
- **live repository**: repository containing images that are not deleted

Default Recycle Bin Retention Policy: **7 days** (min: 1d, max: 90d).

> ⚠️ **Limitation**: Soft Delete does **NOT** support registries with Geo-Replication enabled.

#### Restore Operations (Portal & CLI)

##### Restore a deleted tag/image
```bash
az acr manifest restore -r <MyRegistry> -n <hello-world:latest>
```

##### List soft-deleted manifests
```bash
az acr manifest list-deleted -r <myRegistry> -n <hello-world>
```

##### List soft-deleted tags
```bash
az acr manifest list-deleted-tags -r <myRegistry> -n <hello-world:latest>
```

##### Force restore (overwrite existing tag in live repo)
```bash
az acr manifest restore -r <MyRegistry> -n <hello-world:latest> -d <sha256:abc123> -f
```

#### Error Messages & Solutions

| # | Error | Cause | Solution |
|---|-------|-------|----------|
| 1 | `You must provide either a fully qualified repository specifier...` | Missing repository name/tag in command | Add `-r MyRegistry -n hello-world:latest` to command |
| 2 | `You must provide either a fully qualified manifest specifier...` | Missing manifest specifier | Add `-r MyRegistry -n hello-world:latest` |
| 3 | `No deleted manifests found for tag:` | Tag not found in Recycle Bin | Check tag name spelling; verify item is actually soft-deleted |
| 4 | `manifest sha256:abc123 was soft-deleted, and can be restored if needed` | Pushing same image that exists in Recycle Bin | Restore first: `az acr manifest restore -r myRegistry -n hello-world:latest` |
| 5 | `Import failed: A soft-deleted image with digest sha256:... already exists in repository` | Importing image with same digest as soft-deleted item | Restore the soft-deleted image first before importing |
| 6 | `METADATA_CONFLICT: Tag 'latest' already exists linked to a different digest; try force restore instead` | Restoring tag that exists in live repo with different digest | Use force restore: `az acr manifest restore -r MyRegistry -n hello-world:latest -d sha256:abc123 -f` |
| 7 | `NOT_FOUND: soft-deleted artifact was not found; tagName: latest, digest: sha256:abc123` | Artifact not in Recycle Bin | Verify tag/digest name; item may have already been permanently deleted |
| 8 | `Error: repository "--Repository" is not found` | ACR has Geo-Replication enabled (incompatible with Soft Delete) | Remove Geo-Replicated registries or do not use Soft Delete with geo-replicated ACRs |

#### Recycle Bin Retention Policy Behavior

##### Changing the policy
- If retention policy is changed to a shorter period, images that have already been in Recycle Bin longer than the new policy will be **immediately deleted**.

##### Enabling/Disabling Soft Delete
- Can be toggled in registry settings along with retention policy.
- When **disabled**: deletions are **final and irrecoverable**.
- When **enabled** (default): deleted images go to Recycle Bin for the configured retention period.

##### Empty Recycle Bin
Customer can manually empty the Recycle Bin via Portal. This action is **irreversible**.

#### Pushing Images Present in the Recycle Bin

| Scenario | Behavior |
|----------|----------|
| Pushed image manifest AND tag match item in Recycle Bin | Item removed from Recycle Bin, appears only in live repo |
| Pushed image manifest is in Recycle Bin but different tag | Image removed from Recycle Bin, added to live repo with new tag |
| Pushed image tag is in Recycle Bin but manifest is different | Image pushed normally; tag removed from Recycle Bin |

#### Storage Costs

Images in soft-delete state incur storage costs (charged to customer). The Portal shows how much storage is used by the Recycle Bin for cost transparency.

#### Audit Log Entries

Audit logs track all delete/restore/untag operations including: which tag/manifest was affected, associated tags/manifests affected, and any untagging side effects.

#### References

Feature PM: Hudhayfah Stroud

---
