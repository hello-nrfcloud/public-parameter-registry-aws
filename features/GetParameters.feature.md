---
retry:
  initialDelay: 5000
---

# Get Parameters

> A client can access the published parameters using a HTTP REST request

## Background

Given a random string in `randomString` is stored in `aStringParameter`

And a random number in `randomNumber` is stored in `example/aNumberParameter`

## Get the parameters

Soon the result of GET `${registryEndpoint}` should match this JSON

```json
{
  "aStringParameter": "${randomString}",
  "example": {
    "aNumberParameter": ${randomNumber}
  }
}
```
