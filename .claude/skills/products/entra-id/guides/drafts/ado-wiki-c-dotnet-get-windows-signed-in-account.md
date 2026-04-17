---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/DotNet/Get Windows Signed In Account"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FDotNet%2FGet%20Windows%20Signed%20In%20Account"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Get Windows Signed-In Account Username/UPN

## Method 1: MSAL OperatingSystemAccount

```csharp
authResult = clientApp.AcquireTokenInteractive(scopes)
    .WithPrompt(Prompt.NoPrompt)
    .WithAccount(PublicClientApplication.OperatingSystemAccount)
    .ExecuteAsync().Result;
```

## Method 2: WindowsIdentity

```csharp
string userName = System.Security.Principal.WindowsIdentity.GetCurrent().Name;
```

## Method 3: GetUserNameEx P/Invoke (get UPN)

```csharp
public enum ExtendedFormat
{
    NameUnknown = 0,
    NameFullyQualifiedDN = 1,
    NameSamCompatible = 2,
    NameDisplay = 3,
    NameUniqueId = 6,
    NameCanonical = 7,
    NameUserPrincipal = 8,
    NameCanonicalEx = 9,
    NameServicePrincipal = 10,
    NameDnsDomain = 12,
}

[DllImport("secur32.dll", CharSet = CharSet.Unicode)]
public static extern int GetUserNameEx(int nameFormat, StringBuilder userName, ref int userNameSize);

public string GetCurrentUPN()
{
    StringBuilder userUPN = new StringBuilder(1024);
    int userUPNSize = userUPN.Capacity;
    if (GetUserNameEx((int)ExtendedFormat.NameUserPrincipal, userUPN, ref userUPNSize) != 0)
        return userUPN.ToString();
    return null;
}
```
