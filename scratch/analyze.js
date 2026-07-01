const fs = require('fs');
const path = require('path');

const sellerServicePath = path.join(__dirname, '..', 'src', 'services', 'sellerService.js');
const apiPath = path.join(__dirname, '..', 'src', 'services', 'api.js');

const sellerServiceContent = fs.readFileSync(sellerServicePath, 'utf8');
const apiContent = fs.readFileSync(apiPath, 'utf8');

// Function to extract exports or functions from file
function extractFunctions(content) {
    const lines = content.split('\n');
    const functions = {};
    let currentFuncName = null;
    let currentFuncLines = [];
    let bracketCount = 0;
    let inFunction = false;

    // A simpler parser: find lines starting with "export const <name> = async" or "export const <name> = ("
    // or similar patterns, and extract their full body.
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Match: export const fnName = async ... or export const fnName = ( ... or const fnName = ...
        const exportMatch = line.match(/^(export\s+)?const\s+(\w+)\s*=\s*(async\s*)?(\(([^)]*)\)|[^=]+)\s*=>/);
        const functionMatch = line.match(/^(export\s+)?function\s+(\w+)\s*\(/);
        
        if (exportMatch || functionMatch) {
            const name = exportMatch ? exportMatch[2] : functionMatch[2];
            
            // If we were already in a function, save it
            if (currentFuncName) {
                functions[currentFuncName] = currentFuncLines.join('\n');
            }
            
            currentFuncName = name;
            currentFuncLines = [line];
            inFunction = true;
            
            // Count curly braces
            const openBraces = (line.match(/{/g) || []).length;
            const closeBraces = (line.match(/}/g) || []).length;
            bracketCount = openBraces - closeBraces;
            
            if (bracketCount === 0 && line.includes('=>') && !line.includes('{')) {
                // Single line arrow function without braces
                functions[currentFuncName] = currentFuncLines.join('\n');
                currentFuncName = null;
                inFunction = false;
            }
        } else if (inFunction) {
            currentFuncLines.push(line);
            const openBraces = (line.match(/{/g) || []).length;
            const closeBraces = (line.match(/}/g) || []).length;
            bracketCount += openBraces - closeBraces;
            
            if (bracketCount <= 0) {
                functions[currentFuncName] = currentFuncLines.join('\n');
                currentFuncName = null;
                inFunction = false;
            }
        }
    }
    
    if (currentFuncName) {
        functions[currentFuncName] = currentFuncLines.join('\n');
    }
    
    return functions;
}

const sellerServiceFuncs = extractFunctions(sellerServiceContent);
const apiFuncs = extractFunctions(apiContent);

console.log(`sellerService.js function count: ${Object.keys(sellerServiceFuncs).length}`);
console.log(`api.js function count: ${Object.keys(apiFuncs).length}`);

// Compare function lists
const allNames = new Set([...Object.keys(sellerServiceFuncs), ...Object.keys(apiFuncs)]);
const onlyInSellerService = [];
const onlyInApi = [];
const differentImplementation = [];
const identicalImplementation = [];

for (const name of allNames) {
    if (sellerServiceFuncs[name] && !apiFuncs[name]) {
        onlyInSellerService.push(name);
    } else if (!sellerServiceFuncs[name] && apiFuncs[name]) {
        onlyInApi.push(name);
    } else {
        const body1 = sellerServiceFuncs[name].replace(/\s+/g, '');
        const body2 = apiFuncs[name].replace(/\s+/g, '');
        if (body1 !== body2) {
            differentImplementation.push(name);
        } else {
            identicalImplementation.push(name);
        }
    }
}

console.log('\n--- ONLY IN SELLER SERVICE ---');
console.log(onlyInSellerService.join(', ') || 'None');

console.log('\n--- ONLY IN API (Friend\'s code) ---');
console.log(onlyInApi.join(', ') || 'None');

console.log('\n--- DIFFERENT IMPLEMENTATION ---');
console.log(differentImplementation.join(', ') || 'None');

// Print detailed difference for different implementations
if (differentImplementation.length > 0) {
    console.log('\n--- DETAILS OF DIFFERENCES ---');
    for (const name of differentImplementation) {
        console.log(`\n=== Function: ${name} ===`);
        console.log(`--- sellerService.js:`);
        console.log(sellerServiceFuncs[name].slice(0, 300) + (sellerServiceFuncs[name].length > 300 ? '...' : ''));
        console.log(`--- api.js:`);
        console.log(apiFuncs[name].slice(0, 300) + (apiFuncs[name].length > 300 ? '...' : ''));
    }
}
