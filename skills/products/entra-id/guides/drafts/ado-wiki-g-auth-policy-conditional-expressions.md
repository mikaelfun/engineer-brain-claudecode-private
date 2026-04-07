---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: Authentication Policies and Silos/Verifications and Troubleshooting/Conditional expressions"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20Authentication%20Policies%20and%20Silos/Verifications%20and%20Troubleshooting/Conditional%20expressions"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1924669&Instance=1924669&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1924669&Instance=1924669&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This article provides an overview of conditional expressions, also known as Boolean expressions, which are used in software to enhance decision-making capabilities. It covers the structure, operators, and examples of conditional expressions, as well as the evaluation order of operators.

[[_TOC_]]
 
#Conditional Expressions are also known as Boolean expressions or logical expressions.  
  
These expressions consider of a left-hand-side (LHS) operand and a right-hand-side (RHS) operand separated by an operator.   
All conditional expressions provide a true or false result. Software can use these Boolean results to increase its decision-making capabilities.    
lsass reads this information from the Kerberos PAC to create security tokens. When users access resources, lsass performs an access check.    
  
Window represents claims in two parts: a claim type and a claim name.  

The two entities are separated by a single period. Windows uses the claim type portion of the claim to identify the type of claim. 

There are two types of claim types: user and device.    

A claim type is represented by the at-sign (@) followed by the word user, resource, or device.    
This identifies the type of claim used in the conditional expression.   
The claim name is simply the name of the claim provided at the time of its creation.      
Therefore, an example of claim for a user's department would look like @user.department  

| Expression Element | Description |
| :---: | :---: |
| ClaimType.ClaimName | Test whether the specified claim has a non-zero value|
| Exists ClaimType.ClaimName | Test whether the specified claim exists for the security principal|
| Not_Exists ClaimType.ClaimName | Test whether the specified claim does not exist for the security principal |
| ClaimType.ClaimName Operator Value<br>or<br>ClaimType.ClaimName Operator ClaimType.ClaimName | Returns the result of the specific operation|
| Conditional Expression || Conditional Expression | Test whether either of the specified conditional expressions is true |
| Conditional Expression && Conditional Expression | Test whether both of the specified conditional expressions are true |
| !(Conditional Expression) | Inverses the result of a conditional expression|
| Memberof SID String or SDDL SID Alias,  | Tests whether the security principal's SID matches all SIDs present in the comma-separated list|
| DeviceMember_of SID String or SDDL SID Alias,  | Tests whether device's SID matches all the SIDs present in the comma-separated list|
| MemberOf_Any SID String or SDDL SID Alias,  | Tests whether the security principal's SID matches any SIDs present in the comma-separated list|
| DeviceMemberOf_Any SID String or SDDL SID Alias,  | Tests whether device's SID matches any the SIDs present in the comma-separated list|

# Conditional Operators
The following operators compare any left-hand-side (LHS) and right-hand-side (RHS) combination of claim variables. Additionally the RHS operands may contain literals representing claim values of the same value type as the claim variable represented by the LHS operand.
All operators where the LHS operand or the RHS operand contain multi-valued claims fail and produce an unknown value except when using the Contains and Any_of operators.
Table 3 Valid Conditional Expression Operators

| Operator<br> | Evaluation Description<br> |
| :---: | :---: |
| Equals (==) | Evaluates to TRUE if the right-hand side operand evaluates to the exact value of the left-hand side operand; otherwise, it evaluates to FALSE |
| Not Equals (!=) | Evaluates to FALSE if the right-hand side operand evaluates to the exact value of the left-hand side operand; otherwise, it evaluates to TRUE|
| Greater than (>) | Evaluates to TRUE if the left-hand side operand is greater than the right-hand side operand; otherwise, it evaluates to FALSE |
| Greater than or equal to<br>(>=) | Evaluates to TRUE if the left-hand side operand is greater than or equal to the right-hand side operand; otherwise, it evaluates to FALSE |
| Less than (<) | Evaluates to TRUE if the left-hand side operand is less than the right-hand side operand; otherwise, it evaluates to FALSE |
| Less than or equal to(<=) | Evaluate to TRUE if the left-hand side operand is less than or equal to the right-hand side operand; otherwise, it evaluates to FALSE|
| Contains | Evaluates to TRUE if the left-hand side operand contains the right-hand side operand; otherwise, it evaluates to FALSE<br>Note: The right-hand side operand can be a single valued, multi-valued, or a constant |
| Any_Of| Evaluates to TRUE if the left-hand side operand is contained in the union of the right-hand side operand; otherwise, it evaluates to FALSE<br>Note: The left-hand side operand can be a single valued, multi-valued, or a constant |
| MemberOf | Evaluates the same as Contains operator; however, both operands must represent a security identifier (SID) |
| MemberOf_Any | Evaluates the same as Of_Any operator; however,both operands must represent a security identifier (SID) |
| Not (!)| Evaluates to TRUE if the conditional expression that follows the operator evaluates to FALSE<br>Evaluates to FALSE if the conditional expression that follows the operator evaluates to TRUE |
| And (&&) | Evaluates to TRUE if both the left-hand side and right-hand side expressions evaluate to TRUE; otherwise, it evaluates to FALSE |
| Or (||) | Evaluate to TRUE if either the left-hand side or right-hand side expressions evaluate to TRUE; otherwise, it evaluates to FALSE |

#Operator Precedence
Windows Server evaluates conditional in the following order of precedence.   
Operators with equal precedence are evaluated from left to right.

| Exists, MemberOf, MemberOf_Any, DeviceMemberOf, DeviceMemberOf_Any|
| :---: |
| Contains, Any_Of |
| ==, !=, >, >=, <, <= |
| ! |
| && |
| || |

Additionally, any portion of a conditional expression can be enclosed in parenthesis. Windows Server evaluates expressions within parentheses first.