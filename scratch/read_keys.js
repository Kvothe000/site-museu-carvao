const fs = require('fs');

const content = fs.readFileSync('js/translations.js', 'utf8');

// Use regular expression to find all keys starting with "project"
const regex = /"project_[\w]*"|"projects_[\w]*"/g;
const matches = content.match(regex);

if (matches) {
  const uniqueMatches = Array.from(new Set(matches));
  console.log('Found keys:', uniqueMatches);
} else {
  console.log('No keys found');
}
