# Get Parameters

> A client can access the published parameters using a HTTP REST request

## Get the parameters

Given the string `someValue` is stored in `aStringParameter`

And the number `42` is stored in `example/aNumberParameter`

When I GET `{registryEndpoint}`

Then the result should match this JSON

```json
{
  "aStringParameter": "someValue",
  "example": {
    "aNumberParameter": 42
  }
}
```
