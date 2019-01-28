#! /usr/bin/env node
const shell = require("shelljs");
const path = require('path');
const yargs = require('yargs');
const {generateComponent} = require('../tasks');

const argv = yargs
  .command('generate', 'Generate a component.', {
    name: {
      alias: 'n',
      description: 'Name of a component directory.'
    },
    help: {
      alias: 'h',
    },
    path: {
      alias: 'p',
      description: 'Path to the directory where component has to be placed.'
    }
  }, generateComponent)
  .help()
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
