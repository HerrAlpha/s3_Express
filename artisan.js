// artisan.js

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
// const { apps } = require('./index');
const { warning, basic, reset } = require('./library/console-style');
const { createModelFile, addNewModelToDatabaseLibrary } = require('./library/create-file');

const allowedTypes = ['views', 'model', 'controller', 'library'];

dotenv.config();
//* Create a file
program
  .version('1.0.0')
  .description('Artisan - A simple file creation tool')
  .command('make <type> <path>')
  .description('Create a file')
  .action((type, inputPath) => {
    if (!allowedTypes.includes(type)) {
      console.error(`\n${warning.warn}   Error: '${type}' is not a valid type. Allowed types are: ${allowedTypes.join(', ')}`);
      return;
    }

    // Extract main folder and subfolders
    const segments = inputPath.split('/');
    const fileName = segments.pop(); // Extract file name
    const subfolders = segments; // Extract any subfolders

    // Navigate to the directory specified by type
    let typePath = '';
    switch (type) {
      case 'views':
        typePath = 'views';
        break;
      case 'model':
        typePath = 'model';
        break;
      case 'controller':
        typePath = 'controller';
        break;
      case 'library':
        typePath = 'library';
        break;
      default:
        console.error(`\n${warning.warn}   Invalid type.`);
        return;
    }

    // Create directories if they don't exist
    if (!fs.existsSync(typePath)) {
      fs.mkdirSync(typePath);
    }
    process.chdir(typePath);
    console.log(`\nNavigated to directory: ${typePath}..........${basic.green}✔${reset}`);

    // Create subfolders if they don't exist
    subfolders.forEach((folder) => {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder); // Create folder if it doesn't exist
        console.log(`\nCreated folder: ${path.join(process.cwd(), folder)}..........${basic.green}✔${reset}`);
      }
      process.chdir(folder); // Change directory
    });

    // Determine file path
    const filePath = path.join(process.cwd(), `${fileName}.js`);

    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      console.log(`${warning.error}  File ${filePath} already exists. Skipping file creation.\n`);
      process.chdir('../../');
      return;
    }

    // Write file
    if (type === 'model') {
      createModelFile(fileName);
      addNewModelToDatabaseLibrary(fileName);
      console.log(`${warning.good}  Model file ${fileName}.js created successfully.\n`);
    } else {
      fs.writeFile(filePath, '', (err) => {
        if (err) {
          console.error(`\n${warning.error}   Error creating file:`, err);
          return;
        }
        console.log(`${warning.good}  File ${fileName}.js created successfully.\n`);
      });
    }

    // Navigate back to original directory
    process.chdir('../../');
  });

//* List all files

program
    .command('list')
    .description('List all files')
    .action(() => {
        const files = fs.readdirSync(process.cwd());
        files.forEach((file) => {
        console.log(file);
        });
    });

//* Delete a file

program
    .command('delete <file>')
    .description('Delete a file')
    .action((file) => {
        if (!fs.existsSync(file)) {
        console.error(`${warning.error}   Error: File '${file}' does not exist.`);
        return;
        }
        fs.unlinkSync(file);
        console.log(`${warning.good}   File '${file}' deleted successfully.`);
    }
    );

//* Rename a file

program
    .command('rename <oldName> <newName>')
    .description('Rename a file')
    .action((oldName, newName) => {
        if (!fs.existsSync(oldName)) {
        console.error(`${warning.error}   Error: File '${oldName}' does not exist.`);
        return;
        }
        fs.renameSync(oldName, newName);
        console.log(`${warning.good}   File '${oldName}' renamed to '${newName}' successfully.`);
    }
    );

//* Show Version

program
    .command('version')
    .description('Show version')
    .action(() => {
        const versionFromEnv = process.env.S3_CLOUD_VERSION;
        console.log(`${warning.info} This is Muse Cloud version `,versionFromEnv);
    });

//* run server

// program
//     .command('serve')
//     .description('Run server')
//     .action(() => {
//         // Start the server
//         console.log(`\n${warning.info}  Starting server...\n`);
//         apps();
//     });

//* help

program
    .command('help')
    .description('Help')
    .action(() => {
        console.log(`\n${warning.info}  Welcome to Artisan! A simple file creation tool.\n`);

        // Define commands
        const commands = [
            { command: 'delete <file>', description: 'Delete a file' },
            { command: 'help', description: 'Help' },
            { command: 'list', description: 'List all files' },
            { command: 'make <type> <path>', description: 'Create a file' },
            { command: 'rename <oldName> <newName>', description: 'Rename a file' },
            { command: 'serve', description: 'Run server' },
            { command: 'version', description: 'Show version' }
        ];
        
        // Sort commands alphabetically
        commands.sort((a, b) => a.command.localeCompare(b.command));
        
        // Print sorted commands
        console.log('Usage:');
        console.log('  command [options] [arguments]  | Description');
        console.log('  -------------------------------+-----------------------');
        commands.forEach(cmd => console.log(`  ${cmd.command.padEnd(30)} | ${cmd.description}`));
        console.log('  -------------------------------+-----------------------\n');
        
    });


program.parse(process.argv);
