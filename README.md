# Public Parameter Registry for AWS

[![GitHub Actions](https://github.com/bifravst/public-parameter-registry-aws-js/workflows/Test%20and%20Release/badge.svg)](https://github.com/bifravst/public-parameter-registry-aws-js/actions/workflows/test-and-release.yaml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)

Public Parameter Registry for developed using
[AWS CDK](https://aws.amazon.com/cdk) in
[TypeScript](https://www.typescriptlang.org/).

This project provides a JSON file in a public S3 bucket, that contains all SSM
Parameters under a path that starts with the name of this stack.

This is useful to publish for example resource endpoints without relying on AWS,
or configuration settings for web applications without having to redeploy the
application.

It is used in our projects to provide a way to share outputs from CloudFormation
stacks without needed to depend on them directly. This also allows to have a web
application, which might be hosted on a CDN and therefore only exists in on
region, to consume stack outputs from backend stacks in multiple regions.

## Installation in your AWS account

### Setup

Provide your AWS credentials, for example using the `.envrc` (see
[the example](.envrc.example)).

Install the dependencies:

```bash
npm ci
```

### Deploy

```bash
npx cdk deploy
```

### Setting parameters

Use SSM:

```bash
aws ssm put-parameter --name /${STACK_NAME:-public-parameter-registry}/public/some-parameter --type String --value "Some Value"
```

For parameters to be published, they must be below the path
`/<stack name>/public/`.

## CI with GitHub Actions

Configure the AWS credentials for an account used for CI, then run

```bash
npx cdk --app 'npx tsx cdk/ci.ts' deploy
```

This creates a role with Administrator privileges in that account, and allows
the GitHub repository of this repo to assume it.

Store the role name from the output as a GitHub Action secret:

```bash
ROLE_ARN=`aws cloudformation describe-stacks --stack-name ${STACK_NAME:-public-parameter-registry}-ci | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "roleArn") | .OutputValue' | sed -E 's/\/$//g'`
gh secret set AWS_REGION --body "${AWS_REGION}"
gh secret set AWS_ROLE --body "${ROLE_ARN}"
```
