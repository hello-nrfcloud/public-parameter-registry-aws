---
retry:
  initialDelay: 5000
---

# Get Parameters

> A client can access the published parameters using a HTTP REST request

## Background

Given a random string is stored in `randomString`

Given a random string is stored in `aRandomKey`

Given a random number is stored in `randomNumber`

## Store the parameters

Given `${randomString}` is stored in `aStringParameter`

Given `${randomNumber}` is stored in `${aRandomKey}/aNumberParameter`

## Get the parameters

Soon the result of GET `${registryEndpoint}` should match this JSON

```json
{
  "aStringParameter": "${randomString}",
  "${aRandomKey}": {
    "aNumberParameter": ${randomNumber}
  }
}
```
