# AVD AVD Teams 多媒体 - multimedia-redirection - Issue Details

**Entries**: 3 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. High utilization of heap memory by Terminal Services Service Host Process (TermService) on AVD sessi...
- **ID**: `avd-ado-wiki-163`
- **Source**: ADO Wiki | **Score**: 🔵 7.0
- **Root Cause**: Potential memory leak in RdpCoreCDV related to camera redirection and multimedia redirection features
- **Solution**: Have customers turn off camera redirection and multimedia redirection to see if memory leak stops reproducing. Related ICM: 511924256
- **Tags**: termservice, memory-leak, rdpcorecdv, camera-redirection, multimedia-redirection, heap-memory

### 2. MMR extension shows not loaded in first browser tab
- **ID**: `avd-mslearn-046`
- **Source**: MS Learn | **Score**: 🔵 7.0
- **Root Cause**: Known initialization issue in first tab
- **Solution**: Open a second browser tab
- **Tags**: MMR, multimedia-redirection

### 3. VoIP call not being redirected through Multimedia Redirection (MMR) even though browser extension sh...
- **ID**: `avd-ado-wiki-a-r14-007`
- **Source**: ADO Wiki | **Score**: 🔵 6.0
- **Root Cause**: The actual calling URL (e.g. my.connect.aws used by Salesforce) was not registered in the MMR custom domain registry key. The visible page URL differs from the underlying WebRTC calling domain.
- **Solution**: 1. Install latest MMR from https://aka.ms/avdmmr/msi. 2. Use MMR extension Advanced Settings > Start Collect logs to identify actual calling URL. 3. Add all required domains to registry: HKLM\SOFTWARE\Policies\Microsoft\Edge\3rdparty\extensions\joeclbldhdmoijbaagobkhlpfjglcihd\policy. 4. Restart browser. Ref: https://learn.microsoft.com/en-us/azure/virtual-desktop/multimedia-redirection-video-playback-calls
- **Tags**: mmr, multimedia-redirection, voip, salesforce, w365
