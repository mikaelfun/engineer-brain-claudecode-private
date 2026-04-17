---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/Array aliases evaluation"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Policy/Architecture/Array aliases evaluation"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Regular conditions with aliases

Logically speaking, saying `!(value1 != value2)` is the same as saying `(value1 == value2)`.

Putting this in policy terms this will look as

``` json
{
    "not": {
        "field": "name",
        "notEquals": "myVM"
    }
}
```
and
``` json
{
    "field":"name",
    "equals":"myVM"
}
```

which still has the same logical output (*true* or *false* depending of the value **name** has).

However, this logic does not provide the same output when evaluating array aliases. Let's take a look at why.

Array aliases (aliases that contain a [*]) iterate over each element of the array. When evaluating these aliases a condition like
``` json
{
    "field":"myResourceType/myArrayAlias[*]",
    "equals":"myValue"
}
```
will ensure **every single one** of the elements of the array meets the condition.

Knowing this, let's take a look at this other sample:
``` json
{
    "field":"myResourceType/myArrayAlias[*]",
    "notEquals":"myValue"
}
```
For the condition above, the result will only be true if **all** the array elements meet the condition.

So what if we surround that with a **not** operator?
``` json
{
    "not": {
        "field": "myResourceType/myArrayAlias[*]",
        "notEquals": "myValue"
    }
}
```
Let's break it down:
- The **equals** condition result will only be *true* if all elements on the array meet the condition.
- The **not** operator flips that boolean result.

Which in other words means: If all elements of the array are **not** equal to the value, then the result will be *false* **or** you could also say, if at least **one** element of the array equals the value, the result will be *true*.

Now, take a look at the patterns shown above for array aliases, and compare them to the ones shown at the beginning of this page, you will notice they are exactly the same. However, because array aliases evaluate all objects in array at the same time, the logical output is different.

For additional details on this please refer to [Author policies for array properties - Evaluating the [*] alias](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/definition-structure#understanding-the--alias).

## Limitations of using regular conditions with aliases

Now that we know we can evaluate for a single element of the array by tweaking our conditions, let's take a look the limitation that logic presents. Here is a sample array for demo purposes:
``` json
"ipRules":[
    {
        "address": "10.0.0.1",
        "action": "deny"
    },
    {
        "address": "5.5.5.5",
        "action": "allow"
    }
]
```
Based on the logic described in the previous section, if I wanted to have a condition that checks if one of the addresses in the array is `10.0.0.1` I could write a condition like this:
``` json
{
    "not": {
        "field": "ipRules[*].address",
        "notEquals": "10.0.0.1"
    }
}
```
The **notEquals** condition will be *false* if at least one element of the array equals my IP, which then the **not** operator will switch to *true*.

Now let's say I want to ensure that at least one element of the array has IP address `10.0.0.1` and an `allow` action. I would think to do something like this:
``` json
"allOf": [
    {
        "not": {
            "field": "ipRules[*].address",
            "notEquals": "10.0.0.1"
        }
    },
    {
        "not": {
            "field": "ipRules[*].action",
            "notEquals": "allow"
        }
    }
]
```
It kind of makes sense, but there is a problem: each condition will be evaluated independently. We already know the first condition will return `true`, but what happens to the second condition? It will return `true` as well.

First condition will return *true* because **ipRules[*].address** on position 0 equals `10.0.0.1`, and the second condition will return *true* because **ipRules[*].action** on position 1 equals `allow`. Based on my intent, this would be a false positive, the expectation was to find one element of the array that met both conditions, instead, now we have two elements of the array that meet one condition each.

The behavior above was a limitation with condition evaluation in arrays, and that is the reason the **count** operator was introduced.

## The count operator

The count operator was introduced to resolve the limitations of evaluating array aliases with regular conditions, and also to simplify the logic when writing policy definitions.

The syntax of the count operator contains three values:
- The array you want to iterate.
- The conditions to evaluate for each element iterated on the array.
- A condition to evaluate on the result.

And it looks like this:
``` json
{
    "count": {
        "field": "<[*] alias>",
        "where": {
            /* condition expression */
        }
    },
    "<condition>": "<compare the count of true condition expression array members to this value>"
}
```
Another way to read this is: Iterate over the array (1), for each element evaluate these conditions (2) and when the result is `true`, increase the counter (+1). Once the iteration over the array is complete, evaluate the counter against this condition (3).

Example using ipRules array:
``` json
{
    "count": {
        "field": "ipRules[*]",
        "where": {
            "allOf": [
                {
                    "field": "ipRules[*].address",
                    "equals": "10.0.0.1"
                },
                {
                    "field": "ipRules[*].action",
                    "equals": "allow"
                }
            ]
        }
    },
    "greaterOrEquals": 1
}
```
This reads as: Iterate over array **ipRules[*]**, for each element check if the **address** is '10.0.0.1' and the **action** is 'allow'. If those conditions are `true` increase the counter by 1. Once iteration is complete, check if counter is **greaterOrEquals** `1`.

Because count evaluates array elements one by one, there is no need to worry about the array evaluation logic nor false positives when evaluating all elements of the array at once.

For more information and samples about the **count** operator see [Azure Policy Definition Structure - Count](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/definition-structure#count).
