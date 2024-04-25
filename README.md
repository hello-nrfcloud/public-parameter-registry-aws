# Public Parameter Registry for AWS

[![GitHub Actions](https://github.com/hello-nrfcloud/public-parameter-registry-aws-js/workflows/Test%20and%20Release/badge.svg)](https://github.com/hello-nrfcloud/public-parameter-registry-aws-js/actions/workflows/test-and-release.yaml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![@commitlint/config-conventional](https://img.shields.io/badge/%40commitlint-config--conventional-brightgreen)](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
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

[Provide your AWS credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html).

Install the dependencies:

```bash
npm ci
```

### Deploy

```bash
# Optionally, configure the stack name to use a suitable name for your project:
export STACK_NAME="my-project-registry"
npx cdk deploy
```

### Setting parameters

Use SSM:

```bash
aws ssm put-parameter --name /${STACK_NAME:-public-parameter-registry}/public/some-parameter --type String --value "Some Value"
```

For parameters to be published, they must be below the path
`/<stack name>/public/`.

## CD with GitHub Actions

Create a GitHub environment `production`.

<!-- FIXME: add CLI comment -->

Store the role name from the output as a GitHub Action secret:

```bash
CD_ROLE_ARN=`aws cloudformation describe-stacks --stack-name ${STACK_NAME:-public-parameter-registry} | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "cdRoleArn") | .OutputValue' | sed -E 's/\/$//g'`
gh variable set AWS_REGION --env production --body "${AWS_REGION}"
gh secret set AWS_ROLE --env production --body "${CD_ROLE_ARN}"
# If you've used a custom stack name
gh variable set STACK_NAME --env production --body "${STACK_NAME}"
```
