const path = require('path');
const shell = require('shelljs');
const fs = require('fs');
const {baseDir} = require('../config');
const {capitalize} = require('../utils');

function generateComponent(argv) {
  const {name} = argv;
  let pathToComponents = argv.path;
  if (!pathToComponents) pathToComponents = 'src/components/';

  if (!name) {
    shell.echo('Please state the component name using --name flag.');
    shell.exit(1);
  }
  // The uppercase version of the component alias
  let componentName = capitalize(name);
  // The tag name of the component alias
  let componentTag = name.toLowerCase();

  let componentParts = '';

  const templatePath = path.join(baseDir, 'templates', 'component');

  // Create the right formats for the given component name
  if (componentName.includes('-')) {
    componentParts = componentName.split("-");
    componentName = '';
    for (let part in componentParts) {
      componentName += capitalize(componentParts[part]);
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
    if (fileExt === '.ts') fileExt = '.spec.ts';
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
}

module.exports = generateComponent;
