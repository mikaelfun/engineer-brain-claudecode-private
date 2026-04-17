# SUSE Upgrade/Patching Failure - Handling Process

> Source: OneNote - 4.13 [BMW] SUSE upgrade failure
> Related: vm-onenote-209

## Scope

Certain customers (e.g., BMW) frequently submit cases for SUSE OS upgrade or patching failures, sometimes requesting multiple VMs handled in one case.

## Key Points

- SUSE OS upgrade/patching failures are **OS-internal maintenance issues**, outside Azure platform support scope
- We will assist within knowledge but must set proper expectations

## Handling Process

### 1. Scoping Email Template

Include the following clarification:

> 经过和您的沟通确认，了解到您现在遇到的问题和平台没有直接关系，是 OS 内部的升级运维问题，这已超出 Azure 的支持范围，但我们会在知识能力范围内尽力协助。请您理解！
>
> 请您提供这台 VM 的如下信息：
> 1. Detailed Issue Description: 运行具体什么命令时的报错文本，请勿截图。
>    从信息来看，这些都是 Warning，请运行下如下命令来看看具体报错:
>    `zypper packages --orphaned`
> 2. 报错 VM 的资源 ID

### 2. Multiple VMs - Request Separate Cases

If customer wants to continue with next VM after resolving current one:

> 由于 OS 升级的问题通常并不会完全一样，为了便于跟进和专门处理，烦请您新开一个 case 给到我们，并同时提供报错和资源信息，我们工程师会基于新的问题提供分析和协助。

### 3. Escalation

If any questions arise during handling, contact TA or team lead immediately.
