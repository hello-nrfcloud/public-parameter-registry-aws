---
retry:
  initialDelay: 5000
needs:
  - Get Parameters
---

# Remove a deleted parameters

> After removing a parameter, it should be removed from the registry

## Background

Given `example/aNumberParameter` is deleted

## Get the parameters

Soon the result of GET `${registryEndpoint}` should not have property `example`
