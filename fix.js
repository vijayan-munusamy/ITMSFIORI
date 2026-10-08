const fs = require('fs');
let content = fs.readFileSync('webapp/controller/Assets.controller.js', 'utf8');

if (!content.includes('"sap/m/Page"')) {
    content = content.replace(/sap\.ui\.define\(\[\s*/, 'sap.ui.define([\n    "sap/m/Page",\n    "sap/m/NavContainer",\n    "sap/m/StandardListItem",\n    "sap/m/List",\n    "sap/m/ScrollContainer",\n    ');
    content = content.replace(/\], function \(/, '], function (Page, NavContainer, StandardListItem, List, ScrollContainer, ');
    fs.writeFileSync('webapp/controller/Assets.controller.js', content);
    console.log('Fixed imports');
}
