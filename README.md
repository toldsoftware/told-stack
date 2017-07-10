# Told Stack

Monorepo for Feature Oriented Modules

## Installation

`npm @told/stack`

## Cli Commands

- Build Main Package Code
    - Inside `told-stack-npm`
    - `tsc -w`
- Build Demo
    - Inside `samples/demo`
    - `npm start`
- Run Functions Locally
    - Inside `samples/demo/_deploy`
    - `func host start --debug VSCODE`
- Remote Testing
    - Example
        - Multiple Requests at Multiple Urls
        - In Git Bash:
        - `curl http://toldstack.toldpro.com/api/lookup-lsc/test/aaa100[101-120]`

## Structure

- Each Folder is a module
- Each folder can have multiple tsconfig and webpacks
- Folders:
    - src-client: Client Code
    - src-server: Server Code (Azure Functions Api)
    - src-config: Configuration Settings for the Module

## Modules

### Stack Patterns

#### Read Pattern: Lookup Polling

Super Efficient High Latency Global Data

### Update Pattern: Timer

Update Data using a Timer

Ideal for Common Resources that are Always Needed

### Update Pattern: Request Queue

Update Data using an Update Request Queue

Ideal for Sporadic Resources that are Rarely Needed


## References

- Azure Function Triggers
    - https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/azure-functions/functions-bindings-storage-blob.md

- Azure Functions Queue Bindings
    - https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-queue