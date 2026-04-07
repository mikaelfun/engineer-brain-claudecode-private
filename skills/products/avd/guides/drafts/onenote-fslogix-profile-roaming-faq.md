# FSLogix Profile Roaming FAQ

> Source: OneNote Case Study 2110050060002398

## Q1: Multiple host pools sharing the same file share — one folder or two per user?

**Answer:** Same user produces **one** profile folder in the file share, regardless of how many host pools reference it. However, this configuration (multiple host pools sharing one file share) is **not recommended** by Microsoft.

Reference: [FSLogix profile containers with Azure Files architecture](https://docs.microsoft.com/en-us/azure/architecture/example-scenario/wvd/windows-virtual-desktop-fslogix)

## Q2: Must all VMs in a host pool use the same image?

**Answer:** There is no hard restriction — adding a session host with a different image will not produce an error. However, Microsoft documentation states:

> "Each host pool VM must be built of the same type and size VM based on the same master image."

**Risk:** Profile roaming across different OS versions (e.g., Windows 10 vs Windows Server 2019) may cause data loss or inconsistencies. For example, files created on Windows 10 may not appear when the profile is loaded on Windows Server 2019.

## Key Takeaways

- FSLogix profile = one folder per user per file share, regardless of host pool count
- Mixing images in a host pool is technically possible but unsupported and risky
- Always use consistent OS images within a host pool for reliable profile roaming
