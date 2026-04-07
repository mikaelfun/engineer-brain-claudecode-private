# GPO Administrative Templates Central Store Setup

## Summary
How to deploy GPO Administrative Templates (ADMX/ADML) to the Central Store so that WHFB and other Windows policy settings appear in Group Policy Management Console (GPMC).

## Prerequisites
- Domain Controller with SYSVOL access
- Windows 10/11 client or downloaded ADMX package

## Steps

### 1. Obtain Templates
**Option A** — Copy from existing Windows 10/11 client:
```
C:\Windows\PolicyDefinitions\
```

**Option B** — Download from Microsoft:
- [Administrative Templates (.admx) for Windows 11 22H2 v3.0](https://www.microsoft.com/en-us/download/details.aspx?id=105390)
- Install the MSI, then copy from:
```
C:\Program Files (x86)\Microsoft Group Policy\<version>\PolicyDefinitions\
```

### 2. Deploy to Central Store
1. On Domain Controller, locate or create:
   ```
   \\domain.com\SYSVOL\domain.com\Policies\PolicyDefinitions\
   ```
2. If folder exists: copy files into it, select "Replace files" for conflicts
3. If folder doesn't exist: copy the entire `PolicyDefinitions` folder

**Folder structure:**
```
PolicyDefinitions/
├── *.admx           (template files)
└── en-US/
    └── *.adml       (language-specific files)
```

> If you only need specific templates, copy just `<name>.admx` + `<name>.adml` from `en-US/`.

### 3. Verify
In GPMC, edit a GPO — Administrative Templates should show source:
- **Central store**: `Policy definitions retrieved from the central store`
- **Local store**: `Policy definitions (ADMX files) retrieved from the local machine`

## Notes
- Templates are backward-compatible — updating won't break older OS support
- Updating templates does not change existing GPO settings
- For WHFB specifically, ensure the Windows 11 22H2+ templates are deployed to see cloud trust settings

## References
- [Create and manage Central Store](https://learn.microsoft.com/en-us/troubleshoot/windows-client/group-policy/create-and-manage-central-store)

## Source
- OneNote: Mooncake POD Support Notebook > WHFB > Configuration
