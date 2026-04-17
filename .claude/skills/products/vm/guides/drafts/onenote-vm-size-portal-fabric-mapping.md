# VM Size Mapping: Portal Name vs Fabric Name

**Source**: Mooncake POD Support Notebook > VMSCIM > VM > Tools > VM Size Mapping

## Overview

Azure Portal 中显示的 VM Size 名称（ExternalName）与 Fabric 内部名称（FabricName）存在映射关系。映射定义在 CRP 配置文件中。

## 配置文件

源代码位置：`Compute-CPlat-Core` 仓库
- 路径：`src/CRP/Dev/ComputeResourceProvider/Config/Common/CRP.Configs.VMSizes.Global.xml`
- ADO 链接：https://msazure.visualstudio.com/DefaultCollection/One/_git/Compute-CPlat-Core#path=%2Fsrc%2FCRP%2FDev%2FComputeResourceProvider%2FConfig%2FCommon%2FCRP.Configs.VMSizes.Global.xml

## 映射示例

| ExternalName (Portal) | FabricName | vCPUs | MemoryMB | MaxDataDisk | Tier | VMFamily |
|------------------------|-----------|-------|----------|-------------|------|----------|
| Basic_A0 | B0 | 1 | 768 | 1 | Basic | B_A0_A4 |

## XML Structure

```xml
<Section Name="Basic_A0" Type="ComputeResourceProvider.Config.VMSizeConfiguration">
  <Property Name="ExternalName"><DefaultValue>Basic_A0</DefaultValue></Property>
  <Property Name="FabricName"><DefaultValue>B0</DefaultValue></Property>
  <Property Name="vCPUs"><DefaultValue>1</DefaultValue></Property>
  <Property Name="MemoryMB"><DefaultValue>768</DefaultValue></Property>
  <Property Name="ACUs"><DefaultValue>50</DefaultValue></Property>
  <Property Name="HyperVGenerations"><DefaultValue>V1</DefaultValue></Property>
</Section>
```

## 使用场景

- Kusto 查询中看到 Fabric Name 需要对应到 Portal Size
- Host Analyzer 报告中 containerType 字段使用 Fabric Name
- 排查 VM allocation 失败时确认 size family
