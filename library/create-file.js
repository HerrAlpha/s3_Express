const fs = require('fs');
const path = require('path');
const { basic, reset } = require('./console-style');

function createModelFile(modelName) {
    // Read the model template file
    const templatePath = path.join(__dirname, 'basic.js');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    // const libraryPath = path.join(__dirname, 'database', 'database-library.js');
    // const libraryContent = fs.readFileSync(libraryPath, 'utf8');

    // Replace placeholders with actual model name and schema fields
    const replacedContent = templateContent
        .replace(/basic/g, modelName)
        .replace(/Basics/g, `${modelName.charAt(0).toUpperCase() + modelName.slice(1)}s`);
    

    // Determine the file path
    const filePath = path.join(__dirname, '../model', `${modelName}.js`);

    // Check if the file already exists
    if (fs.existsSync(filePath)) {
        console.error(`File ${filePath} already exists. Skipping file creation.`);
        return;
    }

    // Write the replaced content to the model file
    fs.writeFileSync(filePath, replacedContent);

    console.log(`File ${filePath} created successfully...........${basic.green}✔${reset}`);
}

function generateSchemaFields(schemaFields) {
    let fields = '';
    for (const field of schemaFields) {
        fields += `\n    ${field.name}: { type: ${field.type}, ${field.required ? 'required: true' : ''} },`;
    }
    return fields;
}

function addNewModelToDatabaseLibrary(modelName) {
    const databaseLibraryPath = path.join(__dirname, '../database', 'database-library.js');
    const validationLibraryPath = path.join(__dirname, './validation.js');
    
    // Read the existing files
    let databaseContent = fs.readFileSync(databaseLibraryPath, 'utf8');
    let validationContent = fs.readFileSync(validationLibraryPath, 'utf8');

    const modelNameUpperCase = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    const modelNameLowerCase = modelName.toLowerCase();
    
    // Update the module.exports in database library
    databaseContent = databaseContent
                        .replace(`const Basics = require("../library/basic");`, `const Basics = require("../library/basic");\nconst ${modelNameUpperCase}s = require("../model/${modelName}");`)
                        .replace(/Basics, /g, `Basics, ${modelNameUpperCase}s, `);

    // Update the validation library to include the new model
    validationContent = validationContent.replace(/(Chunk\s*)/, `$1, ${modelNameUpperCase}s`);

    // Write the updated content back to the files
    fs.writeFileSync(databaseLibraryPath, databaseContent);
    fs.writeFileSync(validationLibraryPath, validationContent);

    console.log(`Model ${modelName} added to database library...........${basic.green}✔${reset}`);
    console.log(`Model ${modelName} added to validation library.........${basic.green}✔${reset}`);
}



module.exports = addNewModelToDatabaseLibrary;

module.exports = {createModelFile, addNewModelToDatabaseLibrary};
