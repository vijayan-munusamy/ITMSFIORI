const fs = require('fs');
let content = fs.readFileSync('webapp/controller/Assets.controller.js', 'utf8');
content = content.replace(/mode: 'SingleSelectMaster',/, "mode: 'SingleSelectMaster', showSeparators: 'None',");
fs.writeFileSync('webapp/controller/Assets.controller.js', content);
