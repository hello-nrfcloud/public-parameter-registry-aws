---
retry:
  initialDelay: 5000
exampleContext:
  aRandomKey: 33ec3829-895f-4265-a11f-6c617a2e6b87
  randomNumber: 42
  randomString: some-value
  registryEndpoint: https://abc.cloudfront.net
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
