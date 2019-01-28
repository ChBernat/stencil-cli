#! /usr/bin/env node
const shell = require("shelljs");
const path = require('path');
const fs = require('fs');

const yargs = require('yargs');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2), {
  alias: {}
})


// The path to the installation directory of this tool
const cliPath = path.join(path.dirname(__filename), '..');

const argv = yargs
  .command('generate', 'upload a file', (yargs) => {
  }, (argv) => {

    const {name} = argv;
    let pathToComponents = argv.path;
    if (!pathToComponents) pathToComponents = 'src/components/';

    if (!name) {
      shell.echo('Please state the component name using --name flag.');
      shell.exit(1);
    }
    // The uppercase version of the component alias
    let componentName = capitalizeFirstLetter(name);
    let componentParts = '';
    // The tag name of the component alias
    let componentTag = process.argv[3].toLowerCase();

    const templatePath = path.join(cliPath, 'templates', 'component');

    // Create the right formats for the given component name
    if (componentName.includes('-')) {
      componentParts = componentName.split("-");
      componentName = '';
      for (let part in componentParts) {
        componentName += capitalizeFirstLetter(componentParts[part]);
      }
    } else {
      componentParts = componentName.split(/(?=[A-Z])/);
      componentTag = '';
      let first = true;
      for (let part in componentParts) {
        if (first) {
          componentTag += componentParts[part].toLowerCase();
        } else {
          componentTag += '-' + componentParts[part].toLowerCase();
        }
        first = false;
      }
    }

    // Create component folder
    const pathToComponentDir = path.join(pathToComponents, componentTag);
    shell.mkdir('-p', pathToComponentDir);

    const templateFiles = fs.readdirSync(templatePath);

    templateFiles.forEach((fileName) => {
      let fileExt = path.extname(fileName);
      if(fileExt === '.ts') fileExt = '.spec.ts';
      const componentFile = componentTag + fileExt;
      shell.cp(path.join(templatePath, fileName), path.join(pathToComponentDir, componentFile));
    });

    // Replace the placeholders with the component name and tag name
    shell.ls(path.join(pathToComponentDir, componentTag + '.*')).forEach(function (file) {
      shell.sed('-i', 'COMPONENT_NAME', componentName, file);
      shell.sed('-i', 'COMPONENT_TAG', componentTag, file);
    });

    shell.echo('Generated stencil component "' + componentName + '".');
    shell.exit(0);
  })
  .alias('name', 'n')
  .alias('path', 'p')
  .argv;

// Check that a command is given
if (!process.argv[2]) {
  shell.echo('Please tell me what you want me todo!');
  shell.exit(1);
}

// Command for starting a new stencil starter app, example 'stencil start-app my-app'
if (process.argv[2] === 'start-app') {
  if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
  }

  var projectName = process.argv[3];
  if (!projectName) {
    shell.echo('Please state the project name after the "start-app" command.');
    shell.exit(1);
  }

  shell.exec('git clone https://github.com/ionic-team/stencil-app-starter ' + projectName);
  shell.cd(projectName);
  shell.echo('Running: git remote rm origin');
  shell.exec('git remote rm origin');
  shell.echo('Updating npm package names to ' + projectName + '.');
  shell.ls('package*.json').forEach(function (file) {
    shell.sed('-i', '@stencil/starter', projectName, file);
  });
  shell.echo('Running: npm install');
  shell.exec('npm install');
  shell.exit(0);
}

// Command for starting a new stencil component project, example 'stencil start-component my-component'
if (process.argv[2] === 'start-component') {
  if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
  }

  var projectName = process.argv[3];
  if (!projectName) {
    shell.echo('Please state the project name after the "start-component" command.');
    shell.exit(1);
  }

  shell.exec('git clone https://github.com/ionic-team/stencil-component-starter ' + projectName);
  shell.cd(projectName);
  shell.echo('Running: git remote rm origin');
  shell.exec('git remote rm origin');
  shell.echo('Updating npm package names to ' + projectName + '.');
  shell.ls('package*.json').forEach(function (file) {
    shell.sed('-i', 'my-component', projectName, file);
  });
  shell.echo('Updating namespace in stencil.config.js to ' + projectName + '.');
  shell.ls('stencil.config.js').forEach(function (file) {
    shell.sed('-i', 'mycomponent', projectName, file);
  });
  shell.echo('Updating script tag in index.html to ' + projectName + '.');
  shell.ls('src/index.html').forEach(function (file) {
    shell.sed('-i', 'mycomponent', projectName, file);
  });
  shell.echo('Running: npm install');
  shell.exec('npm install');
  shell.exit(0);
}

// Command for generating a new stencil component within any stencil project, example 'stencil generate my-component'
if (process.argv[2] === 'generate') {

}

// Alias for starting a stencil development server
if (process.argv[2] === 'start') {
  shell.exec('npm start');
}
else if (process.argv[2] === 'test') {
  shell.echo('Use "npm run test" instead, jest was to unstable in the Stencil CLI.');
}
else if (process.argv[2] === 'test.watch') {
  shell.echo('Use "npm run test.watch" instead, jest was to unstable in the Stencil CLI.');
}
else {
  // If the command is not found try it as an alias for a npm run script.
  shell.exec('npm run ' + process.argv[2]);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
