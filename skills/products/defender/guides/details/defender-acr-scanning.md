# DEFENDER ACR 容器镜像扫描 — Comprehensive Troubleshooting Guide

**Entries**: 26 | **Draft sources**: 6 | **Kusto queries**: 0
**Source drafts**: ado-wiki-c-acr-arg-queries.md, ado-wiki-c-tsg-acr-image-vuln-security-explorer.md, ado-wiki-d-docker-hub-container-image-va-tsg.md, ado-wiki-d-jfrog-container-image-va-tsg.md, onenote-acr-vulnerability-scanning.md, onenote-acr-vulnerability-simulation-lab.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Acr
> Sources: ado-wiki, onenote

**1. MDC ACR vulnerability recommendation flagging vulnerabilities for container images that customer believes no longer exist in the registry**

- **Root Cause**: Only images deleted from the manifest are considered non-existing for MDC scanning purposes. If an image is still referenced in the manifest (even without an explicit tag), it remains eligible for vulnerability scanning. Deleting a tag alone is not sufficient.
- **Solution**: Verify whether the image is truly deleted from the registry manifest (not just untagged). To remove vulnerability assessment, delete the image from the manifest using 'az acr manifest delete' or the Azure Portal. Untagged images still in the manifest will continue to be scanned.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. After deleting a container image from ACR, vulnerability findings for that image continue to appear in MDC recommendations**

- **Root Cause**: ACR sends a deletion notification to Defender for Cloud, which normally removes the vulnerability assessment within 1 hour. In rare cases, Defender for Cloud may not receive the deletion notification from ACR.
- **Solution**: If findings persist more than 1 hour after confirmed image deletion, inform customer this is a known edge case - wait up to 3 days for system reconciliation. If findings persist beyond 3 days, verify image is truly deleted from manifest and escalate to MDC PG via ICM.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. ACR container registry vulnerability sub-assessments generated between June-Aug 2022 display scanner field as Trivy instead of Qualys**

- **Root Cause**: Backend data migration bug where old Qualys-generated sub-assessments were incorrectly tagged with Trivy scanner identifier
- **Solution**: Known issue tracked by ICM 393649737. Only affects historical data from Jun-Aug 2022, newer assessments show correct scanner info
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — OneNote]`

**4. ACR image vulnerability scan fails with UnsupportedOS error for Windows-based container images**

- **Root Cause**: Defender for Container ACR image scan does not support Windows OS-based images
- **Solution**: Known platform limitation. Only Linux-based container images are supported for vulnerability scanning
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

**5. ACR vulnerability scan fails with UnSupportedRegistry_FirewallVnetProtectedRegistry error, images not scanned**

- **Root Cause**: Customer configured firewall rules on ACR registry host, preventing Defender from pulling images for scanning
- **Solution**: Remove or adjust firewall rules to allow Defender scanner to access the ACR registry, or add service exception
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

**6. ACR vulnerability scan fails with FailedToPullImage error for container images**

- **Root Cause**: Image, repository, or registry was deleted or does not exist in ACR when scan attempted to pull
- **Solution**: Verify the image/repository/registry exists in ACR and was not deleted. Re-push the image if needed
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

**7. ACR vulnerability scan fails with UnSupportedRegistry_ClassicRegistry for classic container registries**

- **Root Cause**: Only ARM-based registries are supported; classic registries are not compatible with Defender scanning
- **Solution**: Upgrade the classic registry to an ARM-based container registry (Basic/Standard/Premium SKU)
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

**8. Deleted ACR images/repositories still appear in Defender vulnerability scan results as stale entries**

- **Root Cause**: ACR image scan old event pipeline does not support repository/registry delete events, causing stale assessments
- **Solution**: Known limitation. New event pipeline developed with ACR team to handle deletions. For immediate cleanup, request stale scan deletion via ADO wiki TSG
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

**9. Container images pushed to ACR before enabling Defender are not scanned, shown as unverified repo**

- **Root Cause**: Defender only triggers scan on image push events after enablement; pre-existing images are not retroactively scanned
- **Solution**: Re-push the image to trigger a new scan event. Pre-existing unscanned images appear under unverified repo
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

**10. ACR vulnerability scan fails with UnSupportedRegistry_BearerAuthNotEnabledForRegistry error**

- **Root Cause**: Bearer authentication not enabled on the container registry
- **Solution**: Enable bearer authentication on the ACR registry
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 6.0/10 — OneNote]`

**11. ACR vulnerability scan fails with ImageValidationError for distroless or non-standard Linux images**

- **Root Cause**: Qualys scanner requires shell under root directory for validation; distroless images lack package manager, shell, or OS components needed for scan
- **Solution**: Known limitation for distroless/minimal images. Check ExternalErrorData for details. Contact PG for specific image validation failures
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 6.0/10 — OneNote]`

**12. ARG queries for container VA sub-assessments return unexpected schema or missing fields after One Queue migration.**

- **Root Cause**: One Queue changed sub-assessment resourceDetails schema: registry uses full container image resource ID with new fields (ResourceType/ResourceName/ResourceProvider). Runtime replaced kubernetesContext.workloads with flat kubernetesDetails object.
- **Solution**: Update ARG queries to new schema. Registry: parse properties.resourceDetails with full image ID and new fields. Runtime: use properties.additionalData.kubernetesDetails (flat: namespace/clusterName/controllerKind/containerName/podName) instead of deprecated kubernetesContext.workloads.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**13. Image tags not displayed or missing in Defender for Cloud ACR VA recommendations UI.**

- **Root Cause**: Tags are mutable, not stored in backend. Fetched real-time from ACR via API. Firewall blocking MDC service IPs prevents tag retrieval.
- **Solution**: Ensure MDC service IPs can access ACR API. Check firewall/NSG rules. Scan results (based on immutable digests) unaffected; only tag UI display impacted.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**14. Old ACR/container VA recommendations (e.g. assessment key c0b7cfc6) return empty results or are deprecated after One Queue migration.**

- **Root Cause**: One Queue replaced existing container VA recommendations with new granular ones scoped to individual container images/running containers. Old assessment keys deprecated ~1 month after public preview.
- **Solution**: Use new assessment keys: Azure registry 33422d8f-ab1e-42be-bc9a-38685bb567b9, Azure running e9acaf48-d2cf-45a3-a6e7-3caa2ef769e0, AWS registry 2a139383-ec7e-462a-90ac-b1b60e87d576, AWS running d5d1e526-363a-4223-b860-f4b6e710859f, GCP registry 24e37609-dcf5-4a3b-b2b0-b7d76f2e4e04, GCP running c7c1d31d-a604-4b86-96df-63448618e165.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🟡 4.0/10 — ADO Wiki]`

### Phase 2: Containers
> Sources: ado-wiki, mslearn

**1. Gated Deployment Policy 设置为 Audit 或 Deny 后，容器镜像部署仍被允许（策略未生效）**

- **Root Cause**: 可能原因：(1) Azure Container Registry (ACR) 未挂载到 AKS 集群；(2) 策略 Cloud Scope 或 Resource Scope（cluster/namespace）配置有误；(3) 镜像在 ACR 中没有 security artifact（`application/vnd.in-toto+json`）或缺少签名；(4) 策略未成功部署到集群
- **Solution**: (1) 在集群 overview 中验证 Container registries 已正确挂载 ACR；(2) 核查策略规则的 cluster name / namespace 范围配置；(3) 在 ACR 中找到该镜像，检查 Referrers 标签页，确认存在带签名的 `application/vnd.in-toto+json` artifact（admission controller 仅验证最新 artifact）；(4) 执行 kubectl 命令验证策略是否已部署到集群
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Container image scan results not generated or delayed >24 hours after image push to Azure Container Registry (ACR). Findings inconsistently reported across images.**

- **Root Cause**: Defender for Containers scanner relies on push notifications from ACR telemetry to trigger scans. If push notifications are missing or delayed, scan results are not generated timely. A bug where scanner missed ACR push notifications was fixed August 21, 2025.
- **Solution**: Re-push image to ACR to manually trigger rescan. Verify ACR network config allows Defender to receive push events. If recurring post-August 2025, escalate to Containers engineering team as potential regression. Ensure ACR is in supported region and SKU (Premium or Standard).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Defender for Cloud shows VA findings for container images that were already deleted from ACR. Stale recommendations persist in portal and ARG queries.**

- **Root Cause**: Multiple causes: (1) Image pushed without tag - still exists as untagged in ACR but not visible in UI. (2) Entire ACR deleted without triggering delete telemetry - aligner service SLA is 10 days. (3) Runtime assessment (c609cf0f) only clears when all K8s pods using the image are deleted (2-3 day SLA). (4) Potential bug in VA result deletion service.
- **Solution**: Step 1: Verify image truly deleted via az acr manifest show-metadata or Kusto query on ACR RegistryManifestEvent. Step 2: If untagged image found, delete with az acr manifest delete. Step 3: If image confirmed deleted, wait up to 10 days for aligner service. For runtime assessments, ensure all pods using the image are removed (2-3 day clearance). If still persisting, escalate via ICM with proof.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. ACR Vulnerability Assessment shows incomplete package path for nested jar files. The Package Information parameter only shows the outermost .jar file instead of the full nested path to the actual vuln**

- **Root Cause**: ACR VA scanner limitation. When vulnerable library B is packaged inside library A (.jar), the scan report only indicates library A as the vulnerable file path, not the nested path to library B within it.
- **Solution**: 1) Request customer to share Dockerfile or the specific vulnerable .jar file. 2) Extract contents of the outermost .jar. 3) Create a minimal image with only extracted contents using Dockerfile: FROM alpine:latest / ADD ./* to src/. 4) Push new image to ACR and re-scan - results will show nested path. 5) Repeat to pinpoint exact vulnerable file. To extract from any image: az acr login, docker pull, docker save -o image.tar IMAGE_ID, then examine tar contents.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Defender for Containers: no vulnerability scan results**

- **Root Cause**: ACR not configured, images not pushed, assessment not enabled, or wait up to 4h
- **Solution**: Configure ACR integration; push images; enable assessment; wait 4 hours
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 3: Container
> Sources: onenote

**1. ACR image scan fails with error UnsupportedOS - Windows OS based container images cannot be scanned by MDC vulnerability scanner**

- **Root Cause**: MDC ACR image scanning (Qualys-based) does not support Windows OS based container images - only Linux images are supported
- **Solution**: By design limitation. Inform customer that Windows container images are not supported for vulnerability scanning.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

**2. ACR image scan fails with UnSupportedRegistry_FirewallVnetProtectedRegistry or UnSupportedRegistry_BearerAuthNotEnabledForRegistry - MDC cannot pull image from customer registry**

- **Root Cause**: Customer configured firewall/VNet protection on ACR blocking MDC image pull, or bearer authentication not enabled on registry
- **Solution**: For firewall: allow MDC trusted service access. For bearer auth: enable on registry. Also check UnSupportedRegistry_ClassicRegistry - only ARM registries supported.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

**3. Stale ACR image scan results remain in MDC recommendations after repository/registry deletion - deleted images still show vulnerability findings**

- **Root Cause**: ACR image scan old event pipeline does not support repository/registry delete events. Deleted images scan results not cleaned up.
- **Solution**: Known limitation in old pipeline. New event pipeline developed with ACR team. For workaround, contact support to manually delete stale scan results (see ADO wiki TSG).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

**4. Images pushed to ACR before Defender for ACR/Containers was enabled are not scanned - shown as unverified repo in MDC**

- **Root Cause**: MDC only scans images on push event. Pre-existing images have no push events and are never scanned.
- **Solution**: Workaround: re-push images to ACR to trigger new push event and initiate scanning. By design - MDC relies on ACR push events.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

**5. ACR image scan returns ImageValidationError - Qualys scanner validation fails on distroless or non-standard Linux images**

- **Root Cause**: Qualys scanner expects standard Linux image structure (shell under root). Distroless images without package manager or shell fail validation.
- **Solution**: Check ExternalErrorData for details. Distroless images not fully supported by Qualys scanner. For unclear errors, contact Detection team.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 6.0/10 — OneNote]`

### Phase 4: Admission Controller
> Sources: ado-wiki

**1. Admission controller fails to validate container image vulnerability assessment - reports no artifacts found or verification fails**

- **Root Cause**: The latest security artifact (application/vnd.in-toto+json) attached to the container image in ACR is either missing or not signed with a matching application/vnd.cncf.notary.signature. The admission controller requires both the artifact and its signature to validate.
- **Solution**: In Azure portal, navigate to ACR > Repositories > Image > Referrers tab. Verify: (1) at least one application/vnd.in-toto+json artifact exists, (2) the latest artifact has a matching application/vnd.cncf.notary.signature. Also verify the container registry is attached to the cluster (cluster overview > registries). Check admission controller logs: kubectl logs -n kube-system deployments/defender-admission-controller for permission denied or artifact-not-found errors.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 5: Mcas
> Sources: mslearn

**1. Cloud Discovery log collector shows 'Failed pulling latest collector image' during Docker deployment**

- **Root Cause**: Insufficient disk space on the Docker host machine to pull the log collector container image
- **Solution**: Run docker pull mcr.microsoft.com/mcas/logcollector to verify; if 'no space left on device' error, provide more disk space on host
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | MDC ACR vulnerability recommendation flagging vulnerabilities for container images that customer ... | Only images deleted from the manifest are considered non-existing for MDC scanning purposes. If a... | Verify whether the image is truly deleted from the registry manifest (not just untagged). To remo... | 🟢 8.5 | ADO Wiki |
| 2 | After deleting a container image from ACR, vulnerability findings for that image continue to appe... | ACR sends a deletion notification to Defender for Cloud, which normally removes the vulnerability... | If findings persist more than 1 hour after confirmed image deletion, inform customer this is a kn... | 🟢 8.5 | ADO Wiki |
| 3 | Gated Deployment Policy 设置为 Audit 或 Deny 后，容器镜像部署仍被允许（策略未生效） | 可能原因：(1) Azure Container Registry (ACR) 未挂载到 AKS 集群；(2) 策略 Cloud Scope 或 Resource Scope（cluster/n... | (1) 在集群 overview 中验证 Container registries 已正确挂载 ACR；(2) 核查策略规则的 cluster name / namespace 范围配置；(3)... | 🟢 8.5 | ADO Wiki |
| 4 | Admission controller fails to validate container image vulnerability assessment - reports no arti... | The latest security artifact (application/vnd.in-toto+json) attached to the container image in AC... | In Azure portal, navigate to ACR > Repositories > Image > Referrers tab. Verify: (1) at least one... | 🟢 8.5 | ADO Wiki |
| 5 | Container image scan results not generated or delayed >24 hours after image push to Azure Contain... | Defender for Containers scanner relies on push notifications from ACR telemetry to trigger scans.... | Re-push image to ACR to manually trigger rescan. Verify ACR network config allows Defender to rec... | 🟢 8.5 | ADO Wiki |
| 6 | Defender for Cloud shows VA findings for container images that were already deleted from ACR. Sta... | Multiple causes: (1) Image pushed without tag - still exists as untagged in ACR but not visible i... | Step 1: Verify image truly deleted via az acr manifest show-metadata or Kusto query on ACR Regist... | 🟢 8.5 | ADO Wiki |
| 7 | ACR Vulnerability Assessment shows incomplete package path for nested jar files. The Package Info... | ACR VA scanner limitation. When vulnerable library B is packaged inside library A (.jar), the sca... | 1) Request customer to share Dockerfile or the specific vulnerable .jar file. 2) Extract contents... | 🟢 8.5 | ADO Wiki |
| 8 | ACR container registry vulnerability sub-assessments generated between June-Aug 2022 display scan... | Backend data migration bug where old Qualys-generated sub-assessments were incorrectly tagged wit... | Known issue tracked by ICM 393649737. Only affects historical data from Jun-Aug 2022, newer asses... | 🔵 7.5 | OneNote |
| 9 | ACR image vulnerability scan fails with UnsupportedOS error for Windows-based container images | Defender for Container ACR image scan does not support Windows OS-based images | Known platform limitation. Only Linux-based container images are supported for vulnerability scan... | 🔵 7.0 | OneNote |
| 10 | ACR vulnerability scan fails with UnSupportedRegistry_FirewallVnetProtectedRegistry error, images... | Customer configured firewall rules on ACR registry host, preventing Defender from pulling images ... | Remove or adjust firewall rules to allow Defender scanner to access the ACR registry, or add serv... | 🔵 7.0 | OneNote |
| 11 | ACR vulnerability scan fails with FailedToPullImage error for container images | Image, repository, or registry was deleted or does not exist in ACR when scan attempted to pull | Verify the image/repository/registry exists in ACR and was not deleted. Re-push the image if needed | 🔵 7.0 | OneNote |
| 12 | ACR vulnerability scan fails with UnSupportedRegistry_ClassicRegistry for classic container regis... | Only ARM-based registries are supported; classic registries are not compatible with Defender scan... | Upgrade the classic registry to an ARM-based container registry (Basic/Standard/Premium SKU) | 🔵 7.0 | OneNote |
| 13 | Deleted ACR images/repositories still appear in Defender vulnerability scan results as stale entries | ACR image scan old event pipeline does not support repository/registry delete events, causing sta... | Known limitation. New event pipeline developed with ACR team to handle deletions. For immediate c... | 🔵 7.0 | OneNote |
| 14 | Container images pushed to ACR before enabling Defender are not scanned, shown as unverified repo | Defender only triggers scan on image push events after enablement; pre-existing images are not re... | Re-push the image to trigger a new scan event. Pre-existing unscanned images appear under unverif... | 🔵 7.0 | OneNote |
| 15 | ACR image scan fails with error UnsupportedOS - Windows OS based container images cannot be scann... | MDC ACR image scanning (Qualys-based) does not support Windows OS based container images - only L... | By design limitation. Inform customer that Windows container images are not supported for vulnera... | 🔵 7.0 | OneNote |
| 16 | ACR image scan fails with UnSupportedRegistry_FirewallVnetProtectedRegistry or UnSupportedRegistr... | Customer configured firewall/VNet protection on ACR blocking MDC image pull, or bearer authentica... | For firewall: allow MDC trusted service access. For bearer auth: enable on registry. Also check U... | 🔵 7.0 | OneNote |
| 17 | Stale ACR image scan results remain in MDC recommendations after repository/registry deletion - d... | ACR image scan old event pipeline does not support repository/registry delete events. Deleted ima... | Known limitation in old pipeline. New event pipeline developed with ACR team. For workaround, con... | 🔵 7.0 | OneNote |
| 18 | Images pushed to ACR before Defender for ACR/Containers was enabled are not scanned - shown as un... | MDC only scans images on push event. Pre-existing images have no push events and are never scanned. | Workaround: re-push images to ACR to trigger new push event and initiate scanning. By design - MD... | 🔵 7.0 | OneNote |
| 19 | ACR vulnerability scan fails with UnSupportedRegistry_BearerAuthNotEnabledForRegistry error | Bearer authentication not enabled on the container registry | Enable bearer authentication on the ACR registry | 🔵 6.0 | OneNote |
| 20 | ACR vulnerability scan fails with ImageValidationError for distroless or non-standard Linux images | Qualys scanner requires shell under root directory for validation; distroless images lack package... | Known limitation for distroless/minimal images. Check ExternalErrorData for details. Contact PG f... | 🔵 6.0 | OneNote |
| 21 | ACR image scan returns ImageValidationError - Qualys scanner validation fails on distroless or no... | Qualys scanner expects standard Linux image structure (shell under root). Distroless images witho... | Check ExternalErrorData for details. Distroless images not fully supported by Qualys scanner. For... | 🔵 6.0 | OneNote |
| 22 ⚠️ | Cloud Discovery log collector shows 'Failed pulling latest collector image' during Docker deployment | Insufficient disk space on the Docker host machine to pull the log collector container image | Run docker pull mcr.microsoft.com/mcas/logcollector to verify; if 'no space left on device' error... | 🔵 6.0 | MS Learn |
| 23 ⚠️ | Defender for Containers: no vulnerability scan results | ACR not configured, images not pushed, assessment not enabled, or wait up to 4h | Configure ACR integration; push images; enable assessment; wait 4 hours | 🔵 6.0 | MS Learn |
| 24 | ARG queries for container VA sub-assessments return unexpected schema or missing fields after One... | One Queue changed sub-assessment resourceDetails schema: registry uses full container image resou... | Update ARG queries to new schema. Registry: parse properties.resourceDetails with full image ID a... | 🔵 5.5 | ADO Wiki |
| 25 | Image tags not displayed or missing in Defender for Cloud ACR VA recommendations UI. | Tags are mutable, not stored in backend. Fetched real-time from ACR via API. Firewall blocking MD... | Ensure MDC service IPs can access ACR API. Check firewall/NSG rules. Scan results (based on immut... | 🔵 5.5 | ADO Wiki |
| 26 ⚠️ | Old ACR/container VA recommendations (e.g. assessment key c0b7cfc6) return empty results or are d... | One Queue replaced existing container VA recommendations with new granular ones scoped to individ... | Use new assessment keys: Azure registry 33422d8f-ab1e-42be-bc9a-38685bb567b9, Azure running e9aca... | 🟡 4.0 | ADO Wiki |
