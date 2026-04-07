# Using XTS to Identify VM Freeze Time During VMPHU

> Source: MCVKB 2.31
> Applicability: Global + Mooncake

## Background

VMPHU (VM Preserving Host Update) freezes the VM for several seconds during host OS updates. Ref: https://www.osgwiki.com/wiki/VM-PHU

## Steps

1. Set up XTS on corp machine (local AD joined), SHALAB VDI, or SAVM
2. Download `hostupdate_info.log` from `Node\Data\VmphuSvc\Logs\windows` folder
3. Search for the following phases in the log:

### Phase 1: FastSave Start
**Keyword**: `NODE: FastSave:AllVmFastSave`

### Phase 2: FastSave Exit
**Keyword**: `[Started] FastSave:Exit`

### Phase 3: KSR Initiate (Kernel Soft Reboot)
**Keyword**: `[Started] Ksr:Initiate KSR`

### Phase 4: FastRestore Start
**Keyword**: `[Started] FastRestore:Entry`

### Phase 5: FastRestore Exit
**Keyword**: `[Started] FastRestore:Exit`

## Calculating Freeze Time

Total freeze time = FastRestore Exit timestamp - FastSave Start timestamp

**Example**: 07:17:41 → 07:18:19 = **38 seconds**

## Reference ICMs

- ICM 361569060
- ICM 361609978
