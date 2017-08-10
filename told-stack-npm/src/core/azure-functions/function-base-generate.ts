import { FunctionDefinitionBase, HTTP_BINDING, BindingInstanceBase } from "./function-base";
import { BindingFull, HttpBinding, bindingNameToType } from "./types";

export function generateFunctionJsonDoc(definition: FunctionDefinitionBase) {
    const doc: BindingFull[] = [];

    // Add Http
    if ((definition as any)[HTTP_BINDING]) {

        const httpBinding = (definition as any)[HTTP_BINDING] as HttpBinding;
        doc.push(
            {
                name: 'req',
                type: 'httpTrigger',
                direction: 'in',
                authLevel: httpBinding.authLevel || 'anonymous',
                route: httpBinding.route,
            },
            {
                // BUG in Typescript
                name: 'res' as 'res',
                type: 'http',
                direction: 'out'
            },
        );
    }

    // Add Named Bindings
    // console.log('generateFunctionJsonDoc', { definition });

    for (let k in definition) {
        const binding = (definition as any)[k] as BindingInstanceBase<any>;
        if (!binding || !binding.__definition) { continue; }

        const b = { ...binding.__definition };
        doc.push(b);
        b.name = k;

        // Use name to set direction
        if (k.match('^in')) {
            b.direction = 'in';
        } else if (k.match('^out')) {
            b.direction = 'out';
        }

        b.type = bindingNameToType(b.name);
    }

    return { bindings: doc };
}

// Generate Functions Json

//   {
//    "name": "req",
//    "type": "httpTrigger",
//    "direction": "in",
//    "authLevel": "anonymous",
//    "route": "api/http-early-response/{key}"
//   },
//   {
//    "name": "res",
//    "type": "http",
//    "direction": "out"
//   },
//   {
//    "name": "outOutputQueue",
//    "type": "queue",
//    "direction": "out",
//    "queueName": "http-to-queue-output-queue",
//    "connection": "AZURE_STORAGE_CONNECTION_STRING"
//   }