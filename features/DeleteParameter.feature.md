---
retry:
  initialDelay: 5000
needs:
  - Get Parameters
exampleContext:
  aRandomKey: 33ec3829-895f-4265-a11f-6c617a2e6b87
  bucketName: some-bucket
---

# Remove a deleted parameters

> After removing a parameter, it should be removed from the registry

## Background

Given `${aRandomKey}/aNumberParameter` is deleted

## Get the parameters

<!-- S3 file is accessed here directly to circumvent CLoudFront caching. -->

Soon the S3 file `${bucketName}/registry.json` should not have property
`${aRandomKey}`
