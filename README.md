# Told Stack

Monorepo for Feature Oriented Modules

## Installation

`npm @told/stack`

## Structure

- Each Folder is a module
- Each folder can have multiple tsconfig and webpacks
- Folders:
    - src-client: Client Code
    - src-server: Server Code (Azure Functions Api)
    - src-data: Shared Data Types
    - 

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