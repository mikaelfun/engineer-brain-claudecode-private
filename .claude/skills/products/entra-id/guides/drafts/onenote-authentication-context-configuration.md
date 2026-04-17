# Authentication Context for Conditional Access

## Purpose

Conditional Access authentication context allows granular policies on sensitive data and actions, beyond app-level control. For example, block specific users from performing delete operations while allowing all other operations.

## Configuration Steps

1. **Configure authentication contexts:**
   https://docs.azure.cn/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps#configure-authentication-contexts

2. **Assign CA policies to authentication context:**
   https://docs.azure.cn/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps#add-to-conditional-access-policy

3. **Tag resources with authentication context:**
   https://docs.azure.cn/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps#tag-resources-with-authentication-contexts

## Example: Block Delete Action for Specific Users

1. Associate delete action with authentication context in app code
2. Create CA policy targeting the auth context, blocking specific users
3. When blocked user tries to delete → access denied with auth context error

## Developer Reference

- [Developer guide for CA auth context](https://docs.azure.cn/en-us/entra/identity-platform/developer-guide-conditional-access-authentication-context)
- [Sample app (GitHub)](https://github.com/Azure-Samples/ms-identity-dotnetcore-ca-auth-context-app)

## Source

OneNote: Mooncake POD Support Notebook / Conditional Access / Case study / Authentication context
