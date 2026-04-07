---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/Entra External ID Troubleshooting/How to update custom CSS file to include the new selector"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20(CIAM)%2FEntra%20External%20ID%20Troubleshooting%2FHow%20to%20update%20custom%20CSS%20file%20to%20include%20the%20new%20selector"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Introduction

This document outlines an issue with CSS support identified as part of Fluent migration (modernization of End User UX). This is intended for supporting customers who are likely to be impacted.

## The change

As part of modern accessibility enhancements, internal navigation links such as _"No account? Create one"_ Signup link on Sign-in page, _"I don't have an account. Sign in instead."_ Sign-in link on the Signup page, and the Resend code link on Email OTP page used to be customized in CSS using `a, a:link` selector but will now be customized via a new `.ext-link` class selector.

**Note**: Custom CSS is being removed for Entra ID (workforce). Custom CSS is still allowed for Entra External ID.

## The impact

Once the new UX is rolled out, customers who have customized links using CSS will no longer see that customized change reflected in End User UX for internal navigation links.

## The fix

Customers will need to update custom CSS file to include the new selector. Specifically, they will need to copy the style they applied to links with `a, a:link` and apply it to `.ext-link` as well.

## When should it be fixed

This can be done right away so that when the UX changes roll out, there will be no change (no impact) to End User UX - it will be a seamless transition.

## Reference

- [CSS reference guide for customizing company branding](https://learn.microsoft.com/en-us/entra/fundamentals/reference-company-branding-css-template)
