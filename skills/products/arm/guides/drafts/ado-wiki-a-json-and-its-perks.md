---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/Basic Concepts/JSON & its perks"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FBasic%20Concepts%2FJSON%20%26%20its%20perks"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## General concepts
JSON (JavaScript Object Notation) is a lightweight data-interchange format. It is easy for humans to read and write. It is easy for machines to parse and generate.

JSON is a text format that is completely language independent but uses conventions that are familiar to programmers of the C-family of languages, including C, C++, C#, Java, JavaScript, Perl, Python, and many others. These properties make JSON an ideal data-interchange language.

JSON is built on two structures:

- A collection of name/value pairs. In various languages, this is realized as an object, record, struct, dictionary, hash table, keyed list, or associative array.
- An ordered list of values. In most languages, this is realized as an array, vector, list, or sequence.

These are universal data structures. Virtually all modern programming languages support them in one form or another. It makes sense that a data format that is interchangeable with programming languages also be based on these structures.

In JSON, they take on these forms:

An object is an unordered set of name/value pairs. An object begins with `{` (left brace) and ends with `}` (right brace). Each name is followed by `:` (colon) and the name/value pairs are separated by `,` (comma).

Here is a sample JSON

``` json
{
    "name": "Robert", 
    "lastname": "Smith",
    "age": 27,
    "addresses":[
        {
            "name": "home",
            "street":"Main St.",
            "gpsCoordinates":"Latitude: 16.45121, Longitude: -72.00909, Distortion: 1.09"
        },
        {
            "name": "work",
            "street": "2nd Ave.",
            "gpsCoordinates":"Latitude: 6.60331, Longitude: 150.60735, Distortion: 1.01"
        }
    ],
    "nicknames":[
        "Bob",
        "Rob",
        "Robbie"
    ],
    "family":{
        "spouse": null,
        "children": [],
        "married":false
    }
}
```

JSON **does not** support inline comments, but we are going to add some for the sake of explaining the above snippet.

``` json
{ // a valid JSON always start as with a left brace, because the JSON itself is considered a JSON object
    "name": "Robert", // this is a json property called 'name' with value 'Robert'. Notice the comma at the end of the line
    "lastname": "Smith", // property 'lastname' with value 'Smith'. The commas separate the properties
    "age": 27, //property 'age' with value 27. This property value is an integer, as it is not surrounded in quotes
    "addresses":[ // 'addresses' is a property, which contains an array as value. The left bracket starts an array
        { // we have a left brace here, because this is an array of JSON objects. This left brace opens a new object
            "name": "home", // each object in this array contains 3 properties: 'name', 'street' and 'geoCoordinates'
            "street":"Main St.", // properties inside this object are also separated by commas
            "gpsCoordinates":"Latitude: 16.45121, Longitude: -72.00909, Distortion: 1.09"
        }, // right brace closes the last opened object (first element of the array). The comma is also used to separate objects inside the array
        { // left brace opens the second object this array contains
            "name": "work",
            "street": "2nd Ave.",
            "gpsCoordinates":"Latitude: 6.60331, Longitude: 150.60735, Distortion: 1.01"
        } // right brace closes the second object on this array, notice how because this is the last element, we do not use a comma this time.
    ], // right bracket closes the array. A comma is used because there are more properties to be added in the main JSON object
    "nicknames":[ // property 'nicknames'. Also has an array as value.
        "Bob", // notice how this one is an array of strings, not an array of objects, therefore no braces are used.
        "Rob",
        "Robbie"
    ], // right bracket to close the 'nicknames' array.
    "family":{ // property 'family'. This property has a JSON object as the value with 3 properties.
        "spouse": null, // property 'spouse'. The value can be set as null on a JSON, no quotes are used on the value.
        "children": [], // a value can also be an empty array
        "married": false // this property has a boolean type value. True/false can be used as values without quotes to indicate a boolean value.
    } //right brace closing the 'family' object. Notice how no comma is needed because this is the last element of the main JSON.
} // left brace closing the main JSON object
```

As you saw above, JSON is very flexible to declare data. You can set the data type based on how you declare the object, whether you use quotes or not, of even the values you provide.

ARM templates are a JSON representation of the resources configuration in Azure, but JSON is also used for other products in Azure, e.g. Azure Policy.

> JSON inline comments are not part of the JSON format specification, therefore they are not supported anywhere. There is an extension of the specification called JSONC which supports comments, but this is entirely a different format and not applicable to ARM templates/APIs in Azure.

## JSON paths
Because JSON objects are structured, that means you can map to a specific property based on hierarchy.

Let's look at some samples using the JSON snippet.

``` json
{
    "name": "Robert", 
    "lastname": "Smith",
    "age": 27,
    "addresses":[
        {
            "name": "home",
            "street":"Main St.",
            "gpsCoordinates":"Latitude: 16.45121, Longitude: -72.00909, Distortion: 1.09"
        },
        {
            "name": "work",
            "street": "2nd Ave.",
            "gpsCoordinates":"Latitude: 6.60331, Longitude: 150.60735, Distortion: 1.01"
        }
    ],
    "nicknames":[
        "Bob",
        "Rob",
        "Robbie"
    ],
    "family":{
        "spouse": null,
        "children": [],
        "married":false
    }
}
```
- `[root].age` maps to the fourth line (age property) on the JSON (27).
- `[root].addresses[0].street` maps to the street property, on the first element of the addresses array. Notice how array count always starts at 0 ("Main St.").
- `[root].nicknames[2]` maps to the nicknames array, on position number 2 ("Robbie").
- `[root].family.married` maps to the married property, inside family, on the JSON snippet (false).
