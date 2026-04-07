# ENTRA-ID MSAL Auth Libraries — Detailed Troubleshooting Guide

**Entries**: 58 | **Drafts fused**: 9 | **Kusto queries**: 0
**Draft sources**: ado-wiki-d-add-custom-httpclient-msal4j.md, ado-wiki-d-msal-net-confidential-client-auth-code-powershell.md, ado-wiki-d-msal-net-native-client-powershell-setup.md, ado-wiki-d-msal-ps-native-client-auth-context.md, ado-wiki-f-configure-msal-android-dev-environment.md, ado-wiki-msal-python-wsl-broker.md, mslearn-enable-logging-msal-graph-sdk.md, mslearn-enable-msal4j-logging-spring-boot.md, mslearn-package-inspector-msal-android.md
**Generated**: 2026-04-07

---

## Phase 1: Oneauth
> 9 related entries

### Users getting prompted to sign in repeatedly in New Outlook for Mac with OneAuth error 965ya (invalid_grant, token_expired)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SIF Conditional Access policy causing interactive prompt every 18 hours. CA configuration issue, not related to OneAuth library.

**Solution**: Review and adjust tenant CA policies (SIF CA policy). If prompts are infrequent (~18h), this is expected CA behavior.

---

### Users are getting prompted to sign in repeatedly in New Outlook for Mac with OneAuth MSAL error tag 965ya (StatusInternal::InteractionRequired, inv...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SIF (Sign-In Frequency) Conditional Access policy causes interactive prompt every 18 hours. The token_expired suberror triggers InteractionRequired, but this is expected CA-driven behavior, not a OneAuth/MSAL library bug.

**Solution**: Review the tenant Conditional Access policies for Sign-In Frequency settings. If the 18-hour prompt interval matches the configured SIF policy, this is by design. Adjust the CA policy if the frequency is undesirable.

---

### Work Profile Error encountered after domain password change with OneAuth MSAL error tag 5pa42 indicating SSL handshake process error in Android broker
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The error originates from the Android broker side during SSL handshake (tag 5pa42). This is not related to the OneAuth/MSAL library itself.

**Solution**: Route to Mobile broker team for diagnosis and resolution. This is an Android broker issue, not OneAuth/MSAL.

---

### After the latest Android OS version 14 update, users cannot access Teams, OneDrive with OneAuth MSAL error tag 5ssab (Android broker returns CANCEL)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Android broker returns CANCEL status (tag 5ssab) after OS update. This is an Android broker-side issue, not related to OneAuth/MSAL library.

**Solution**: Route to Mobile broker team for investigation. The issue is on the Android broker side, not OneAuth/MSAL.

---

### User sees Something went wrong window with OneAuth MSAL error tag 5objn on Android, corresponding to broker returning INVALID_REQUEST
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Tag 5objn corresponds to Android broker returning INVALID_REQUEST. This can be returned by the broker from the server for multiple reasons and is a broker-side issue.

**Solution**: Route to Android broker team for investigation. Since INVALID_REQUEST comes from the broker, the Android broker team should investigate the root cause first.

---

### Android Edge app Conditional Access does not prompt to register device, OneAuth MSAL error tag 5sr96 indicating interaction required error from And...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Tag 5sr96 indicates an interaction required error from the Android broker. In observed cases, the error was caused by the customer Conditional Access policy, with Logsminer showing error code UserStrongAuthClientAuthNRequired.

**Solution**: Check the customer Conditional Access policies. Use Logsminer to search for the specific error code. The interaction required error is driven by CA policy, not a OneAuth/MSAL bug.

---

### Getting invalid account (2201) errors when using SSO to sign into Edge on Android Shared Device Mode (SDM). Edge hits Invalid Account on startup bu...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Under SDM, Edge uses SignInSilently to load the current user profile. The account is in an interrupt state, and token acquisition fails with InteractionRequired, causing Edge to show Invalid account. Teams uses different startup logic that resolves the interrupt first.

**Solution**: Upgrade to OneAuth 6.2.1 or later which introduces partial success status for SignIn* methods, where an account is returned along with an error. Edge should integrate with this new API behavior.

---

### Linux Broker sign-in silently is not working as expected: device-bound PRT is downgraded by eSTS to a device-less PRT during the call
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: eSTS server bug: the device-bound PRT should not be downgraded to a device-less PRT. In Logsminer, searching the device keyword shows the device-less PRT does not have a DeviceId.

**Solution**: This is a server-side (eSTS) bug. File/reference bug 3300735 in Identity Division Engineering. In Logsminer, verify by searching device keyword to confirm the PRT lacks DeviceId.

---

### AirGap user running into authentication and connection issues testing from an Ubuntu Linux client after RDP client team moved from legacy auth libr...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: RDP Linux client team removed the existing auth library approximately 6 months ago and moved to OneAuth-MSAL. Authentication does not work from Day 1 for partners using the RDP SDK in production in UsSec/UsNat environments. RDP team has no local test environment in these clouds.

**Solution**: Route to RDP Linux client team to lead the investigation. While OneAuth-MSAL team may assist with fixes, the RDP Linux client team should own the issue since they integrated the SDK.

---

## Phase 2: Android
> 8 related entries

### Android device authentication fails - sign-in logs show no device properties (IsManaged/IsCompliant/IsKnown all false), app using WebKit/embedded b...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application does not support broker authentication (ADAL/MSAL + broker), cannot perform device auth via PKeyAuth or PRT

**Solution**: Check app broker support via ASC Authentication troubleshooter > Expert view > Client info. If 3rd party app lacks broker support, instruct customer to contact vendor. Ensure app uses MSAL with broker enabled.

---

### Android authentication fails intermittently, SSO breaks, broker IPC errors in logs
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Power savings/battery optimization interferes with background IPC between client app and broker app (Company Portal/Authenticator)

**Solution**: Exclude both Company Portal and Microsoft Authenticator from power savings/battery optimization settings. Upgrade to MSAL Android 1.5.2+ with latest broker which uses Android Content Provider mechanism to fix IPC issues.

---

### Compilation errors in MSAL Android project due to misconfigured JDK version - build failures across codebase
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MSAL Android SDK requires JDK 11; any other version causes compilation failures

**Solution**: Android Studio > Preferences > Build Tools > Gradle > set Gradle JDK to 11.0.15. Clean and rebuild

---

### MSAL Android compilation errors after accepting Android Studio prompt to update Gradle version from 6.8
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Updating Gradle version from 6.8 breaks dependencies in MSAL Android project

**Solution**: File > Project Structure > Project > set Gradle Version to 6.8. Ignore all upgrade prompts

---

### Error insufficient memory for Java Runtime Environment when building MSAL Android project
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Default JVM memory allocation insufficient for MSAL Android build

**Solution**: In gradle.properties add: org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8

---

### Gradle daemon keeps restarting or never starts when building MSAL Android project
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Mismatch between Android Studio JDK and system JDK, or Gradle version reset from 6.8

**Solution**: Verify Gradle 6.8. Download JBR 11 from JetBrains, replace Android Studio/jbr, set Gradle SDK and JAVA_HOME, invalidate cache restart

---

### Error 401 Unauthorized accessing identitydivision.pkgs.visualstudio.com maven feed when building MSAL Android
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: vstsMavenAccessToken in gradle.properties missing or incorrect for IdentityDivision DevOps maven feed

**Solution**: Create PAT at identitydivision.visualstudio.com with Org=IdentityDivision Scopes=Packaging Read. Set vstsUsername=VSTS and vstsMavenAccessToken in gradle.properties

---

### Android app authentication fails after publishing to Google Play Store — redirect URI signature hash mismatch error
**Score**: 🟡 4.5 | **Source**: MS Learn

**Root Cause**: Google Play App Signing uses a different signing certificate than the developer's upload key, causing the public signature hash to differ from the one configured in MSAL and Azure app registration

**Solution**: 1) Get new signature hash from Google Play Console (App Integrity > App signing > SHA-1 fingerprint) or MSAL Package Inspector. 2) Add new redirect URI with correct hash in Azure portal App Registration. 3) Update MSAL config and AndroidManifest.xml with new redirect URI and hash.

---

## Phase 3: Msal Js
> 8 related entries

### Angular app throws "Maximum call stack size exceeded" error when loading MSAL configuration from a remote config service using HttpClient. Circular...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: HttpClient injection in MSAL config factory triggers all HTTP_INTERCEPTORS including MsalInterceptor, creating a circular dependency: MsalInterceptor -> MsalService -> MSAL_CONFIG -> HttpClient -> MsalInterceptor.

**Solution**: Use HttpBackend instead of HttpClient in the config service constructor to bypass HTTP_INTERCEPTORS: this.http = new HttpClient(httpHandler). Load config via APP_INITIALIZER before MsalService initializes. See MSAL GitHub issue #1403.

---

### MSAL.js error: "Interaction is currently in progress. Please ensure that this interaction has been completed before calling an interactive API." Lo...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MSAL login methods called multiple times before previous attempt completes. Common with auto-login on page load without checking handleRedirectPromise first.

**Solution**: Call handleRedirectPromise() before any interactive login. Check for existing accounts first. If stuck, clear sessionStorage "msal.<clientId>.interaction.status". MSAL v2.28.0+: use msalInstance.getBrowserStorage().clear().

---

### MSAL Angular: MsalGuard not activating or protecting routes. Users can access guarded routes without authentication. Guard bypassed during initial ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: initialNavigation property in RouterModule.forRoot() set to enabledNonBlocking, causing guard bypass during initial navigation in iframe/popup scenarios.

**Solution**: Change initialNavigation from enabledNonBlocking to enabledBlocking in app-routing.module.ts.

---

### MSAL React hooks (useMsalAuthentication, useIsAuthenticated) return incorrect state - user reported as not authenticated after successful login.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MsalProvider renders before react-router-dom v6 completes first navigation. MSAL hooks evaluate before auth state is initialized. Navigation Client not configured.

**Solution**: Wrap MsalProvider in ClientSideNavigation component that delays rendering using useState/useEffect. Set pca.setNavigationClient(navigationClient). Return null on first render.

---

### MSAL.js redirect results in infinite loop between app and login.microsoftonline.com. Browser keeps redirecting without completing authentication.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: App endpoint not in same trusted zone as login.microsoftonline.com (IE/Edge). Or x-ms-refreshTokenCredential header from broker plugin interfering.

**Solution**: Ensure app domain and login.microsoftonline.com in same browser trusted zone. Verify redirect_uri callback does not perform additional redirects.

---

### MSAL.js CDN endpoint https://secure.aadcdn.microsoftonline-p.com returns HTTP 404. Auth library JS files cannot be loaded from deprecated CDN.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CDN endpoint https://secure.aadcdn.microsoftonline-p.com/* deprecated. Microsoft stopped publishing newer library versions to CDN.

**Solution**: Replace with https://alcdn.msauth.net/lib/{version}/js/ or https://alcdn.msftauth.net/lib/{version}/js/. For new projects, self-host auth libraries.

---

### Third-party security scanner flags Entra ID cookies as missing HttpOnly flag. Security audit reports cookies from login.microsoftonline.com without...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Entra ID intentionally sets some cookies without HttpOnly because JavaScript auth libraries (MSAL.js) need to read them.

**Solution**: Expected behavior, by design. Document as accepted risk. Reference: "Web browser cookies used in Microsoft Entra authentication" on learn.microsoft.com.

---

### Angular app with Ivy compiler fails to use MsalModule.forRoot(). Compilation or runtime error during MSAL Angular module initialization with Ivy en...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MsalModule.forRoot() incompatible with Angular Ivy compiler due to how Ivy handles module metadata and factory providers.

**Solution**: Use FactoryProvider pattern instead of MsalModule.forRoot(). Create factory functions for MSAL_CONFIG, MSAL_CONFIG_ANGULAR, and MsalService as individual providers. See MSAL GitHub issue #1400.

---

## Phase 4: Linux Sso
> 4 related entries

### During Intune enrollment on Linux, user sees blank screen (no password prompt) after entering UPN. journalctl for microsoft-identity-broker.service...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: No default keyring/password has been set on the machine prior to running Intune enrollment. MSAL fails to save tokens to the keyring because no default keyring exists or it is locked.

**Solution**: Open Edge browser — a 'Choose password for new keyring' prompt will appear. Set a keyring password. Then launch Microsoft Intune Portal and proceed with enrollment as usual. Note: PG is tracking a bug to have microsoft-identity-broker.service trigger the keyring prompt automatically.

---

### `dpkg -i intune-portal` fails with dependency errors: missing msalsdk-dbusclient, microsoft-identity-broker, libsdbus-c++1, or default-jre
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Linux SSO package stack has a strict dependency chain: intune-portal → msalsdk-dbusclient → (microsoft-identity-broker + libsdbus-c++1) → default-jre. Packages must be installed in correct order.

**Solution**: Install dependencies in order: 1) `sudo apt install default-jre` 2) `sudo apt install libsdbus-c++1` 3) `sudo dpkg -i microsoft-identity-broker_<VERSION>_amd64.deb` 4) `sudo dpkg -i msalsdk-dbusclient_<VERSION>_amd64.deb` 5) `sudo dpkg -i intune-portal_<VERSION>_amd64.deb`. Run `sudo apt --fix-broken install` if apt reports unmet dependencies. For RHEL/Fedora use dnf equivalents.

---

### MSAL Python app needs broker authentication on WSL or standalone Linux, or app falls back to non-broker auth flow unexpectedly
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: enable_broker_on_linux flag not set in MSAL Python, or on standalone Linux the Intune Portal (Linux broker) is not installed. On WSL, WAM (Windows Authentication Manager) serves as broker; on standalone Linux, Intune Portal provides the broker.

**Solution**: Set `enable_broker_on_linux=True` in MSAL Python config. For WSL-only activation, conditionally enable only when running under WSL (no extra dependencies needed — WAM is available by default on Windows). For standalone Linux: install Intune Portal for broker support. Without broker on standalone Linux, MSAL gracefully falls back to non-broker auth flow.

---

### MSAL.Net application running via WSL (Windows Subsystem for Linux) fails to access keyring or secret storage
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: MSAL.Net on Linux/WSL requires libsecret for GNOME keyring-based secret storage used by the authentication flow

**Solution**: Install required keyring packages: `sudo apt install libsecret-tools seahorse`

---

## Phase 5: Adal
> 2 related entries

### ADAL to MSAL Recommendations API (adalToMsalMigration) no longer available in Microsoft Entra Recommendations after Dec 15, 2025 retirement
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The ADAL to MSAL Recommendations API was officially retired on December 15, 2025

**Solution**: Use Microsoft Graph API directly to identify applications still using ADAL. See internal doc: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/341179/Azure-AD-Graph-and-ADAL-Deprecation?anchor=how-to-find-applications-still-using-aad-graph-api

---

### Customer encounters ADAL library issues or needs ADAL support for authentication in their application
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ADAL (Azure Active Directory Authentication Library) is deprecated and no longer supported by Microsoft

**Solution**: Migrate from ADAL to MSAL following official guide: https://learn.microsoft.com/en-us/entra/identity-platform/msal-migration

---

## Phase 6: Dotnet
> 2 related entries

### .NET application throws 'Could not load file or assembly' error (e.g., Microsoft.Identity.Client, Version=X.X.X.0) - assembly version mismatch or m...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The application has a dependency on a specific version of an assembly (e.g., MSAL Microsoft.Identity.Client) and the DLL is missing from deployment or a version mismatch exists between referenced and deployed assemblies

**Solution**: 1) Verify assembly exists in bin folder, reinstall via NuGet 2) Ensure all projects reference same version 3) Update binding redirects in web.config/app.config 4) Add AutoGenerateBindingRedirects to .csproj 5) Clean/rebuild (delete bin/obj) 6) Check target framework 7) Use Fusion Log Viewer (fuslogvw) 8) Verify deployment includes all assemblies

---

### MSAL AcquireToken calls appear to hang or freeze the .NET application, especially in WinForm/WPF apps on the UI Thread. App becomes unresponsive wh...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Async/await deadlock caused by blocking calls (.Result, .Wait()) on async methods that capture the UI thread SynchronizationContext, preventing continuation from executing

**Solution**: Method 1: Use async/await all the way up (avoid .Result/.Wait()). Method 2: ConfigureAwait(false) on all await calls. Method 3: Task.Run(() => GetTokenAsync()).GetAwaiter().GetResult(). Method 4: ContinueWith(TaskScheduler.FromCurrentSynchronizationContext())

---

## Phase 7: Java
> 2 related entries

### Java IDE shows 'the import cannot be resolved' error after importing JAR packages or adding Maven dependencies for MSAL4J or Microsoft Graph SDK.
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: IDE cache is stale after adding new JAR dependencies. The project needs to be cleaned and rebuilt to resolve the new imports.

**Solution**: Clean the project: VS Code - Java: Clean Java Language Server Workspace; Eclipse - Maven mvn clean install then Update Project then Project Clean.

---

### Java application using MSAL/Azure SDK throws java.lang.NoClassDefFoundError at runtime. Class is present at compile time but missing at runtime, ca...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Missing JAR file dependency in the runtime classpath. The class exists during compilation but the JAR is not included in the runtime environment or deployment package.

**Solution**: Identify the missing class from the error message. Verify the JAR file exists in the compile/build environment. Check runtime Java classpath for typos or missing JARs. For Java EE apps, verify EAR/WAR packaging and MANIFEST for all dependency JARs.

---

## Phase 8: Msal.Net
> 2 related entries

### Could not load file or assembly Microsoft.Identity.Client - system cannot find the file specified
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Required MSAL DLL version missing from deployment or version mismatch with binding redirects

**Solution**: Reinstall NuGet package, update binding redirects in web.config, clean+rebuild (delete bin/obj). Use Fusion Log Viewer (fuslogvw) to diagnose.

---

### MSAL.NET System.Security.Cryptography.CryptographicException: Keyset does not exist when using certificate auth
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Private key not persisted in certificate store - X509Certificate2 loaded without PersistKeySet flag

**Solution**: Use X509KeyStorageFlags.PersistKeySet | Exportable when creating X509Certificate2. Consider Singleton pattern for certificate instance.

---

## Phase 9: Id_Token
> 1 related entries

### MSAL Obj-C SDK returns expired id_tokens to developer application
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MSAL refreshes tokens based on access token lifetime (60-90min random) which can exceed id_token fixed lifetime (60min). MSAL only refreshes access tokens, not id_tokens independently.

**Solution**: [Preferred] Use access tokens instead of id_tokens for resource access. [Alternative] Set access token lifetime to 60 minutes to match id_token lifetime using Token Lifetime policy.

---

## Phase 10: Wsl
> 1 related entries

### MSAL.Net on WSL (Windows Subsystem for Linux) cannot securely store credentials/tokens, authentication fails or tokens not persisted
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Missing libsecret and seahorse packages required for Linux credential storage backend on WSL

**Solution**: Install credential storage packages: `sudo apt install libsecret-tools seahorse`

---

## Phase 11: Laps
> 1 related entries

### LAPS Azure discovery fails. Event ID 10025 Azure discovery failed with error code 0x80072EE7 ERROR_ADAL_INTERNET_NAME_NOT_RESOLVED
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Network connectivity issue - enterpriseregistration.windows.net endpoint is unreachable from the client device

**Solution**: Verify network connectivity: run curl https://enterpriseregistration.windows.net/ -D - from admin command prompt. Fix firewall/proxy rules to allow access.

---

## Phase 12: Aad Graph Api
> 1 related entries

### Applications using Azure AD Graph API (https://graph.windows.net) stop working or return errors after June 30, 2025 (Stage 1 retirement). ADAL to M...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD Graph API Stage 1 retirement commenced June 30, 2025 (announced June 2020). Applications still using AAD Graph instead of Microsoft Graph are affected. ADAL to MSAL Recommendations API (adalToMsalMigration) retired December 15, 2025 per MC1151678.

**Solution**: Migrate applications to Microsoft Graph API (graph.microsoft.com). Refer to internal wiki: 'Unblock AAD Graph APIs in App Registrations'. For ADAL→MSAL migration, see Microsoft Graph migration guidance. Message Center post MC1151678 was sent to affected tenants September 11, 2025.

---

## Phase 13: Python
> 1 related entries

### Python Flask web app generates HTTP redirect URIs instead of HTTPS when using MSAL/Entra authentication, causing redirect_uri mismatch or insecure ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Flask url_for() generates HTTP URLs by default, especially when behind a reverse proxy or when the HTTPS scheme is not explicitly set in URL generation.

**Solution**: Use url_for('authorization', _external=True, _scheme='https') to force HTTPS scheme in Flask redirect URIs.

---

## Phase 14: .Net
> 1 related entries

### MSAL .NET throws "No account or login hint was passed to the AcquireTokenSilent call" in ASP.NET/ASP.NET Core web apps after application restart or...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MSAL token cache is empty (in-memory by default) when AcquireTokenSilent is called. User has valid auth cookie but MSAL cache was lost on app restart. No persistent token cache configured.

**Solution**: Option 1: Implement persistent token cache (SQL, distributed, or file-based). See https://learn.microsoft.com/en-us/entra/msal/dotnet/how-to/token-cache-serialization. Option 2: Catch MsalUiRequiredException and send Challenge/redirect to re-authenticate. For Microsoft Identity Web: use RejectSessionCookieWhenAccountNotInCacheEvents to auto-reject stale cookies.

---

## Phase 15: Instance Discovery
> 1 related entries

### MSAL instance discovery validation fails when using a custom or non-Entra identity provider authority. App cannot authenticate against non-Microsof...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: MSAL performs instance discovery by default, validating the authority against known Microsoft identity provider endpoints. Custom/third-party IdP authorities are not in the trusted endpoint list.

**Solution**: Disable instance discovery in MSAL configuration. .NET: .WithInstanceDiscovery(false); Java: .instanceDiscovery(false); iOS: MSALGlobalConfig.enableInstanceDiscovery = NO; JS: auth.instanceDiscovery = false; Python: instance_discovery=False; Go: public.WithInstanceDiscovery(false). Note: using MSAL for non-Entra IdPs is not officially supported.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Android device authentication fails - sign-in logs show no device properties ... | Application does not support broker authentication (ADAL/... | Check app broker support via ASC Authentication troublesh... | 🟢 8.5 | ADO Wiki |
| 2 | Android authentication fails intermittently, SSO breaks, broker IPC errors in... | Power savings/battery optimization interferes with backgr... | Exclude both Company Portal and Microsoft Authenticator f... | 🟢 8.5 | ADO Wiki |
| 3 | MSAL Obj-C SDK returns expired id_tokens to developer application | MSAL refreshes tokens based on access token lifetime (60-... | [Preferred] Use access tokens instead of id_tokens for re... | 🟢 8.5 | ADO Wiki |
| 4 | LAPS Azure discovery fails. Event ID 10025 Azure discovery failed with error ... | Network connectivity issue - enterpriseregistration.windo... | Verify network connectivity: run curl https://enterpriser... | 🟢 8.5 | ADO Wiki |
| 5 | ADAL to MSAL Recommendations API (adalToMsalMigration) no longer available in... | The ADAL to MSAL Recommendations API was officially retir... | Use Microsoft Graph API directly to identify applications... | 🟢 8.5 | ADO Wiki |
| 6 | Users getting prompted to sign in repeatedly in New Outlook for Mac with OneA... | SIF Conditional Access policy causing interactive prompt ... | Review and adjust tenant CA policies (SIF CA policy). If ... | 🟢 8.5 | ADO Wiki |
| 7 | During Intune enrollment on Linux, user sees blank screen (no password prompt... | No default keyring/password has been set on the machine p... | Open Edge browser — a 'Choose password for new keyring' p... | 🟢 8.5 | ADO Wiki |
| 8 | Applications using Azure AD Graph API (https://graph.windows.net) stop workin... | Azure AD Graph API Stage 1 retirement commenced June 30, ... | Migrate applications to Microsoft Graph API (graph.micros... | 🟢 8.5 | ADO Wiki |
| 9 | `dpkg -i intune-portal` fails with dependency errors: missing msalsdk-dbuscli... | Linux SSO package stack has a strict dependency chain: in... | Install dependencies in order: 1) `sudo apt install defau... | 🟢 8.5 | ADO Wiki |
| 10 | MSAL Python app needs broker authentication on WSL or standalone Linux, or ap... | enable_broker_on_linux flag not set in MSAL Python, or on... | Set `enable_broker_on_linux=True` in MSAL Python config. ... | 🟢 8.5 | ADO Wiki |
| 11 | .NET application throws 'Could not load file or assembly' error (e.g., Micros... | The application has a dependency on a specific version of... | 1) Verify assembly exists in bin folder, reinstall via Nu... | 🟢 8.5 | ADO Wiki |
| 12 | MSAL AcquireToken calls appear to hang or freeze the .NET application, especi... | Async/await deadlock caused by blocking calls (.Result, .... | Method 1: Use async/await all the way up (avoid .Result/.... | 🟢 8.5 | ADO Wiki |
| 13 | Python Flask web app generates HTTP redirect URIs instead of HTTPS when using... | Flask url_for() generates HTTP URLs by default, especiall... | Use url_for('authorization', _external=True, _scheme='htt... | 🟢 8.5 | ADO Wiki |
| 14 | MSAL .NET throws "No account or login hint was passed to the AcquireTokenSile... | MSAL token cache is empty (in-memory by default) when Acq... | Option 1: Implement persistent token cache (SQL, distribu... | 🟢 8.5 | ADO Wiki |
| 15 | Compilation errors in MSAL Android project due to misconfigured JDK version -... | MSAL Android SDK requires JDK 11; any other version cause... | Android Studio > Preferences > Build Tools > Gradle > set... | 🟢 8.5 | ADO Wiki |
| 16 | MSAL Android compilation errors after accepting Android Studio prompt to upda... | Updating Gradle version from 6.8 breaks dependencies in M... | File > Project Structure > Project > set Gradle Version t... | 🟢 8.5 | ADO Wiki |
| 17 | Error insufficient memory for Java Runtime Environment when building MSAL And... | Default JVM memory allocation insufficient for MSAL Andro... | In gradle.properties add: org.gradle.jvmargs=-Xmx2048m -X... | 🟢 8.5 | ADO Wiki |
| 18 | Gradle daemon keeps restarting or never starts when building MSAL Android pro... | Mismatch between Android Studio JDK and system JDK, or Gr... | Verify Gradle 6.8. Download JBR 11 from JetBrains, replac... | 🟢 8.5 | ADO Wiki |
| 19 | Error 401 Unauthorized accessing identitydivision.pkgs.visualstudio.com maven... | vstsMavenAccessToken in gradle.properties missing or inco... | Create PAT at identitydivision.visualstudio.com with Org=... | 🟢 8.5 | ADO Wiki |
| 20 | Could not load file or assembly Microsoft.Identity.Client - system cannot fin... | Required MSAL DLL version missing from deployment or vers... | Reinstall NuGet package, update binding redirects in web.... | 🟢 8.5 | ADO Wiki |
| 21 | MSAL.NET System.Security.Cryptography.CryptographicException: Keyset does not... | Private key not persisted in certificate store - X509Cert... | Use X509KeyStorageFlags.PersistKeySet / Exportable when c... | 🟢 8.5 | ADO Wiki |
| 22 | MSAL Android: User is automatically signed in after explicitly signing out. L... | On non-shared devices, MSAL Android logout does not clear... | Expected behavior. For full sign-out across apps, configu... | 🟢 8.5 | ADO Wiki |
| 23 | Angular app throws "Maximum call stack size exceeded" error when loading MSAL... | HttpClient injection in MSAL config factory triggers all ... | Use HttpBackend instead of HttpClient in the config servi... | 🟢 8.5 | ADO Wiki |
| 24 | MSAL.js error: "Interaction is currently in progress. Please ensure that this... | MSAL login methods called multiple times before previous ... | Call handleRedirectPromise() before any interactive login... | 🟢 8.5 | ADO Wiki |
| 25 | MSAL Angular: MsalGuard not activating or protecting routes. Users can access... | initialNavigation property in RouterModule.forRoot() set ... | Change initialNavigation from enabledNonBlocking to enabl... | 🟢 8.5 | ADO Wiki |
| 26 | MSAL React hooks (useMsalAuthentication, useIsAuthenticated) return incorrect... | MsalProvider renders before react-router-dom v6 completes... | Wrap MsalProvider in ClientSideNavigation component that ... | 🟢 8.5 | ADO Wiki |
| 27 | MSAL.js redirect results in infinite loop between app and login.microsoftonli... | App endpoint not in same trusted zone as login.microsofto... | Ensure app domain and login.microsoftonline.com in same b... | 🟢 8.5 | ADO Wiki |
| 28 | MSAL.js CDN endpoint https://secure.aadcdn.microsoftonline-p.com returns HTTP... | CDN endpoint https://secure.aadcdn.microsoftonline-p.com/... | Replace with https://alcdn.msauth.net/lib/{version}/js/ o... | 🟢 8.5 | ADO Wiki |
| 29 | Third-party security scanner flags Entra ID cookies as missing HttpOnly flag.... | Entra ID intentionally sets some cookies without HttpOnly... | Expected behavior, by design. Document as accepted risk. ... | 🟢 8.5 | ADO Wiki |
| 30 | Angular app with Ivy compiler fails to use MsalModule.forRoot(). Compilation ... | MsalModule.forRoot() incompatible with Angular Ivy compil... | Use FactoryProvider pattern instead of MsalModule.forRoot... | 🟢 8.5 | ADO Wiki |
