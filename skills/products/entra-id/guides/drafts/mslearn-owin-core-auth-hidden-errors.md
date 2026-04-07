# Expose Hidden Authentication Errors in ASP.NET OWIN / ASP.NET Core with Entra ID

> Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/asp-dot-net-open-web-interface-for-dot-net-core-authentication-sign-in-failures)

## When to Use

When an ASP.NET OWIN or ASP.NET Core app integrated with Microsoft Entra ID exhibits sign-in failures without clear error messages:
- Infinite redirect loop between app and Entra ID
- Redirected back to app as if never signed in
- Generic error page with no useful details

## Approach: Hook `OnAuthenticationFailed` Event

### ASP.NET OWIN (Startup.Auth.cs)

```csharp
Notifications = new OpenIdConnectAuthenticationNotifications()
{
    AuthenticationFailed = (context) =>
    {
        String ErrorMessage = context.Exception.Message;
        String InnerErrorMessage = context.Exception.InnerException?.Message ?? "";
        String RedirectError = $"error_message={ErrorMessage}";
        if (!string.IsNullOrEmpty(InnerErrorMessage))
            RedirectError += $"&inner_error={InnerErrorMessage}";
        context.Response.Redirect("/?" + RedirectError.Replace("\r\n", "  "));
        context.HandleResponse();
        return Task.FromResult(0);
    }
}
```

### ASP.NET Core (Startup.cs)

```csharp
options.Events.OnAuthenticationFailed = async context =>
{
    String ErrorMessage = context.Exception.Message;
    String InnerErrorMessage = context.Exception.InnerException?.Message ?? "";
    String RedirectError = $"?error_message={ErrorMessage}";
    if (!string.IsNullOrEmpty(InnerErrorMessage))
        RedirectError += $"&inner_error={InnerErrorMessage}";
    context.Response.Redirect(RedirectError.Replace("\r\n", "  "));
    context.HandleResponse();
};
```

## Debugging Tips

- Error message visible in browser address bar after redirect
- For infinite loops, use Fiddler to capture the error in the redirect chain
- See also: [Entra error codes reference](https://learn.microsoft.com/en-us/entra/identity-platform/reference-error-codes)

## 21V (Mooncake) Notes

- Applicable — same OWIN/Core middleware pattern works with China endpoints
