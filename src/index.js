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
      choices: [
        'update character triggers', 
        'generate character scripted effects',
        'generate goal gfx shine',
        'generate effects',
        'remove chief',
        'remove ideologies in military'
      ]
    },
    {
      name: "directory",
      message: "Enter the workspace directory of the mod.",
      type: "input",
    },
  ])
  .then(answers => {
    switch(answers.action) {
      case 'update character triggers':
        update(answers.directory.trim());
        break;
      case 'generate character scripted effects':
        generate(answers.directory.trim());
        break;
      case 'generate goal gfx shine':
        generateShine(answers.directory.trim());
        break;
      case 'generate effects':
        writeEffects(answers.directory.trim())
        break;
      case 'remove chief':
        removeChiefs(answers.directory.trim());
        break;
      case 'remove ideologies in military':
        remove(answers.directory.trim());
        break;
    }
  });

async function removeChiefs(dir) {
  const source = `${dir}/common/characters`;
  const folder = await fs.readdir(source);
  folder.forEach(async (path) => {
    const file = await fs.readFile(`${source}/${path}`, 'utf8');
    const src = file.split('\n');

    let newArr = [];
    src.forEach((str) => {
      let s = str;
      //console.log(str);
      if (!str.includes('slot')) {
        if (str.includes('head_of_government')) {
          s = "XXXXX";
          //s = str.replace('chief_of_staff', '');
          //console.log(s);
        } else if (str.includes('foreign_minister')) {
          s = "XXXXX";
          //s = str.replace('chief_of_army', '');
          //console.log(s);
        } else if (str.includes('economy_minister')) {
          s = "XXXXX";
          //s = str.replace('chief_of_navy', '');
          //console.log(s);
        } else if (str.includes('security_minister')) {
          s = "XXXXX";
          //console.log(s);
          //s = str.replace('chief_of_air_force', '');
        } else if (str.includes('chief_of_staff')) {
          s = "XXXXX"
        } else if (str.includes('chief_of_army')) {
          s = "XXXXX"
        } else if (str.includes('chief_of_navy')) {
          s = "XXXXX"
        } else if (str.includes('chief_of_air_force')) {
          s = "XXXXX"
        }
      }
      newArr.push(s);
    });
    newArr = newArr.filter((s) => !s.includes('XXXXX'));
    await fs.writeFile(`${source}/${path}`, newArr.join('\n'));
  })
}

async function remove(dir) {
  const source = `${dir}/common/characters`;
  const folder = await fs.readdir(source);
  folder.forEach(async (path) => {
    const file = await fs.readFile(`${source}/${path}`, 'utf8');
    const src = file.split('\n');
  
    const ideologies = [
      'vanguardist',
      'collectivist',
      'libertarian_socialist',
      'social_democrat',
      'social_liberal',
      'market_liberal',
      'social_conservative',
      'authoritarian_democrat',
      'paternal_autocrat',
      'national_populist',
      'valkist'
    ];
    const positions = [
      'chief_of_staff',
      'chief_of_army',
      'chief_of_navy',
      'chief_of_air_force'
    ];
    const content = src;
    content.forEach((str, index) => {
      if (ideologies.findIndex((i) => str.includes(i)) !== -1) {
        if (!str.includes('subtype')) {
          const pos = src[index - 1];
          if (positions.findIndex((p) => pos.includes(p)) !== -1) {
            content[index] = '';
            content.splice(index, 1);
          }
        }
      }
    });
    await fs.writeFile(`${source}/${path}`, content.join('\n'));
  });
}

async function generateShine(dir) {
  const source = `${dir}/interface/FX_goals.gfx`;
  const file = await fs.readFile(source, 'utf8');
  const src = file.split('\n');

  const content = new Map();
  src.forEach((str, index) => {
    if (str.includes('spriteType')) {
      if (src.length > (index + 2)) {
        let name = src[index + 1];
        let dir = src[index + 2];

        name = name.substring(name.indexOf('"') + 1, name.lastIndexOf('"')).trim();
        dir = dir.substring(dir.indexOf('"') + 1, dir.lastIndexOf('"')).trim();
        content.set(name, dir);
      }
    }
  });

  let shines = [];
  content.forEach((value, key) => {
    let shine = `
  spriteType = {
    name = "${key}_shine"
    texturefile = "${value}"
    effectFile = "gfx/FX/buttonstate.lua"
    animation = {
      animationmaskfile = "${value}"
      animationtexturefile = "gfx/interface/goals/shine_overlay.dds"
      animationrotation = -90.0
      animationlooping = no
      animationtime = 0.75
      animationdelay = 0
      animationblendmode = "add"
      animationtype = "scrolling"
      animationrotationoffset = { x = 0.0 y = 0.0 }
      animationtexturescale = { x = 1.0 y = 1.0 }
    }

    animation = {
      animationmaskfile = "${value}"
      animationtexturefile = "gfx/interface/goals/shine_overlay.dds"
      animationrotation = 90.0
      animationlooping = no
      animationtime = 0.75
      animationdelay = 0
      animationblendmode = "add"
      animationtype = "scrolling"
      animationrotationoffset = { x = 0.0 y = 0.0 }
      animationtexturescale = { x = 1.0 y = 1.0 }
    }
    legacy_lazy_load = no
  }
    `;

    if (key && value)
      shines.push(shine);
  })

  let shine = `
spriteTypes = {
  ${shines.join('\n')}
}
  `
  await fs.writeFile(`${dir}/interface/FX_goals_shine.gfx`, shine);
}

async function update(dir) {
  let spinner = ora('Working on it');

  const folder = `${dir}/common/characters`;
  const workspace = await fs.readdir(folder);
  
  workspace.forEach(async (path) => {
    spinner.start();
    const file = await fs.readFile(`${folder}/${path}`, 'utf8');
    
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

async function writeEffects(dir) {
  const source = `${dir}/common/country_leader/00_minister_traits.txt`;
  const file = await fs.readFile(source, 'utf-8');
  const src = file.split('\n');

  const arr = src.filter((s) => {
    return s.includes('hog_') || s.includes('for_') || s.includes('eco_')
      || s.includes('sec_') || s.includes('cos_') || s.includes('carm_')
      || s.includes('cnav_') || s.includes('cair_')
  });
  const traits = {};
  arr.forEach((str) => {
    let trait = str.substring(0, str.indexOf('=')).trim();
    if (trait.includes('hog')) {
      let a = traits['hog'];
      if (a) {
        traits['hog'] = [...a, ...[trait]];
      } else {
        traits['hog'] = [trait];
      }
    } else if (trait.includes('for_')) {
      let a = traits['for'];
      if (a) {
        traits['for'] = [...a, ...[trait]];
      } else {
        traits['for'] = [trait];
      }
    } else if (trait.includes('eco_')) {
      let a = traits['eco'];
      if (a) {
        traits['eco'] = [...a, ...[trait]];
      } else {
        traits['eco'] = [trait];
      }
    } else if (trait.includes('sec_')) {
      let a = traits['sec'];
      if (a) {
        traits['sec'] = [...a, ...[trait]];
      } else {
        traits['sec'] = [trait];
      }
    } else if (trait.includes('cos_')) {
      let a = traits['cos'];
      if (a) {
        traits['cos'] = [...a, ...[trait]];
      } else {
        traits['cos'] = [trait];
      }
    } else if (trait.includes('carm_')) {
      let a = traits['carm'];
      if (a) {
        traits['carm'] = [...a, ...[trait]];
      } else {
        traits['carm'] = [trait];
      }
    } else if (trait.includes('cnav_')) {
      let a = traits['cnav'];
      if (a) {
        traits['cnav'] = [...a, ...[trait]];
      } else {
        traits['cnav'] = [trait];
      }
    } else if (trait.includes('cair_')) {
      let a = traits['cair'];
      if (a) {
        traits['cair'] = [...a, ...[trait]];
      } else {
        traits['cair'] = [trait];
      }
    }
  });

  let content = "# Auto-Generated; use the tool";
  Object.keys(traits).forEach((key) => {
    content = content.concat(`\n\nremove_every_${key}_trait = {`);
    content = content.concat('\n\thidden_effect = {');
    traits[key].forEach((trait) => {
      content = content.concat(`\n\t\tremove_ideas_with_trait = ${trait}`);
    });
    content = content.concat('\n\t}');
    content = content.concat('\n}')
  })
  await fs.writeFile(`${dir}/common/scripted_effects/FX_automated_effects.txt`, content);
}