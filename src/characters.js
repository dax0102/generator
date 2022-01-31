import { extractToken } from "./tools.js";

function updateTriggers(characters) {
  const newContent = [];

  const content = characters.split('\n');
  content.forEach((str, index) => {
    if (str.includes('available')) {
      let token = content[index + 1];
      token = extractToken(token);
      let result = str.replace('can_replace_minister = no }', `\n\t\t\t\thidden_trigger = { has_country_flag = ${token}_hired }\n\t\t\t}`);
      newContent.push(result);
    } else {
      newContent.push(str);
    }
  }); 

  return newContent.join('\n');
}

function generateEffect(characters) {
  const tokens = [];

  const content = characters.split('\n');
  content.forEach((str) => {
    if (str.includes('idea_token')) {
      let token = extractToken(str);
      tokens.push(token);
    }
  });
  return tokens;
} 

export {
  updateTriggers,
  generateEffect,
};