import { promises as fs } from 'fs';
import ora from 'ora';
import { updateTriggers, generateEffect }from './characters.js';
import inquirer from "inquirer";

inquirer
  .prompt([
    {
      name: "action",
      message: "Choose action. (Use arrow keys)",
      type: "list",
      choices: ['update character triggers', 'generate character scripted effects']
    },
    {
      name: "directory",
      message: "Enter the workspace directory of the mod.",
      type: "input",
    }
  ])
  .then(answers => {
    switch(answers.action) {
      case 'update character triggers':
        update(answers.directory.trim());
        break;
      case 'generate character scripted effects':
        generate(answers.directory.trim());
        break;
    }
  });

async function update(dir) {
  let spinner = ora('Working on it');

  const folder = `${dir}/common/characters`;
  const workspace = await fs.readdir(folder);
  
  workspace.forEach(async (path) => {
    spinner.start();
    const file = await fs.readFile(`${dir}/${path}`, 'utf8');
    
    let characters = updateTriggers(file);
    await fs.writeFile(`${folder}/${path}`, characters);
    spinner.stop();
    console.log('Success');
  });
}

async function generate(dir) {
  let spinner = ora('Working on it');
  let merged = {};

  const folder = `${dir}/common/characters`;
  const workspace = await fs.readdir(folder);
  spinner.start();
  for (const path of workspace) {
    const tag = path.substring(0, path.indexOf('.'));
    const file = await fs.readFile(`${folder}/${path}`, 'utf8');

    let tokens = generateEffect(file);
    merged[`${tag}`] = tokens;
  }

  let data = "# Auto-Generated; use the tool.";
  for (let key in merged) {
    if (Object.prototype.hasOwnProperty.call(merged, key)) {
      const tokens = merged[key];
      if (tokens.length > 0) {
        data = data.concat(`\nclear_${key}_ministers = {`);
        tokens.forEach((str) => {
          data = data.concat(`\n\tclr_country_flag = ${str}_hired`);
        });
        data = data.concat('\n}');
      }
    }
  }
  spinner.stop();
  await fs.writeFile(`${dir}/common/scripted_effects/_minister_effects.txt`, data);
}