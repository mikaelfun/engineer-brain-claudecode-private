# Purview Troubleshooting Guide Index

| Guide | Type | Kusto | Keywords | Entries | Confidence |
|-------|------|-------|----------|---------|------------|
| [扫描连接与凭据问题](scan-connectivity-credentials.md) | 📋 fusion | 0 | 3rd-party, account-name, adls-gen2, ads | 24 | high |
| [SHIR 安装注册与运行时](scan-shir-setup.md) | 📋 fusion | 0 | 3804, adf, assembly, authentication-key | 38 | high |
| [扫描私有终结点与网络](scan-private-endpoint-network.md) | 📋 fusion | 0 | 409-error, account-pe, adf, authorization | 32 | high |
| [第三方数据源扫描](scan-third-party.md) | 📋 fusion | 0 | 3p-datasource, authentication, aws, aws-s3 | 23 | high |
| [Fabric 与 Power BI 扫描](scan-fabric-powerbi.md) | 📋 fusion | 0 | adls, adls-gen2, admin-settings, collection | 23 | high |
| [扫描性能与异常终止](scan-performance-stuck.md) | 📋 fusion | 0 | adls-gen2, azure-files, cancelled, csv | 8 | high |
| [扫描后资产丢失](scan-missing-assets.md) | 📋 fusion | 0 | asset-deletion, audit log, data-map, deleted-asset | 10 | high |
| [Data Map 分类标注](classification-datamap.md) | 📋 fusion | 0 | 403-forbidden, acl, asset-deletion, classification | 17 | high |
| [Schema 与资源集](schema-resource-set.md) | 📋 fusion | 0 | 1mb, ars, by-design, classification | 13 | high |
| [Data Map API 与资产操作](data-map-api-operations.md) | 📋 fusion | 0 | api, api-version, asset-count, asset-deletion | 22 | high |
| [集合管理与元数据策略](data-map-collections.md) | 📋 fusion | 0 | 409-error, collection, collections, data-map | 4 | low |
| [数据质量扫描](data-quality.md) | 📋 fusion | 0 | 500-error, data-profile, data-quality, databricks | 9 | medium |
| [Azure Data Share (ADS)](azure-data-share.md) | 📋 fusion | 0 | ads, authentication, blob-missing, data-share | 22 | medium |
| [Purview 数据共享](purview-data-sharing.md) | 📊 compact | 0 | access, asset, asset-mapping, attach | 14 | medium |
| [ADF / Synapse 血缘](lineage-adf-synapse.md) | 📋 fusion | 0 | adf, connection, data-factory, databricks | 6 | medium |
| [敏感度标签可见性与策略](sensitivity-labels-visibility.md) | 📋 fusion | 0 | 12mb-limit, activity-explorer, aip, aip-add-in | 37 | high |
| [敏感度标签加密与权限](sensitivity-labels-encryption.md) | 📋 fusion | 1 | aipservice, b2b, cmk, cross-cloud | 7 | high |
| [自动标签 (客户端 / 服务端)](auto-labeling.md) | 📋 fusion | 0 | 100-file-limit, auto-labeling, client-side, custom-sit | 10 | medium |
| [MPIP 客户端 (AIP Client)](mpip-client.md) | 📋 fusion | 0 | ad-rms, aip-add-in, co-authoring, conflict | 16 | medium |
| [MPIP / AIP Scanner](mpip-scanner.md) | 📋 fusion | 0 | aip, authentication, cpu, dlp | 8 | high |
| [IRM / RMS / 邮件加密](irm-rms-pme.md) | 📋 fusion | 2 | 550, 554, aad-groups, activity-explorer | 34 | high |
| [AIP Service / BYOK / TPD 管理](aip-service-byok.md) | 📋 fusion | 2 | ad-rms, aip, aip-service, aipservice | 20 | high |
| [RMS Connector 与 AD RMS](rms-connector-adrms.md) | 📋 fusion | 1 | ad-rms, aip, aip-template, caching | 10 | medium |
| [Double Key Encryption (DKE)](dke-double-key.md) | 📊 compact | 0 | authentication, case-sensitive, connectivity, dke | 5 | medium |
| [跨云 / 跨租户 MIP 标签](cross-cloud-mip.md) | 📋 fusion | 1 | cross-cloud, cross-tenant, external-user, guest-account | 5 | high |
| [MIP SDK 集成](mip-sdk.md) | 📋 fusion | 0 | encryption, mip-sdk, office | 1 | low |
| [eDiscovery 搜索与保留](ediscovery.md) | 📋 fusion | 1 | ambiguous-location, bulk-update, compliance-boundaries, content search | 16 | high |
| [Activity Explorer 与 Content Explorer](activity-content-explorer.md) | 📋 fusion | 0 | activity-explorer, admin-unit, aggregation, audit-log | 17 | medium |
| [保留策略与记录管理](retention-records.md) | 📋 fusion | 2 | activedirectorysyncerror, archive, archive-quota, audit | 11 | high |
| [DLP 策略与告警](dlp-policies.md) | 📋 fusion | 2 | china-id-card, defender, dlp, endpoint-dlp | 3 | high |
| [审计日志](audit-log.md) | 📊 compact | 0 | api, audit, audit-log, deleted-email | 5 | high |
| [账户创建 / 升级 / 合并 / 配额](account-provisioning.md) | 📋 fusion | 0 | account, account-creation, account-deletion, account-limit | 29 | medium |
| [账户区域变更与迁移](account-region-migration.md) | 📊 compact | 0 | account-move, region-move, subscription-transfer | 1 | low |
| [计费与定价](billing-pricing.md) | 📋 fusion | 0 | adf, billing, capacity-unit, classic-billing | 17 | medium |
| [权限与 RBAC](permissions-rbac.md) | 📋 fusion | 1 | 401, access, admin-role, admin-units | 22 | high |
| [门户访问与 UX](portal-access-ux.md) | 📋 fusion | 0 | azure-subscription, browser-compatibility, business-assets, chrome | 8 | medium |
| [数据治理与统一目录](data-governance-catalog.md) | 📋 fusion | 0 | 412, access-loss, bulk-delete, classic-to-new | 11 | medium |
| [策略存储与执行](policy-store-enforcement.md) | 📋 fusion | 0 | access-policy, adls-gen2, artifact-store, azure-sql | 11 | medium |
| [工作流审批](workflow-approval.md) | 📋 fusion | 0 | approval, email, outlook, workflow | 2 | low |
| [21Vianet 功能差异与缺失](21v-feature-gaps.md) | 📋 fusion | 0 | 21v, aip, alert, archive-quota | 28 | high |
| [Sovereign Cloud 工具与访问](sovereign-cloud-tooling.md) | 📋 fusion | 0 | corp-access, dfm-access, dsts, dsts-enforcement | 8 | medium |
| [工程师内部工具 (DTM/rCRI/ICM)](support-internal-tooling.md) | 📋 fusion | 0 | access-denied, accesscheck, asc, azure-subscription | 10 | high |

Last updated: 2026-04-07