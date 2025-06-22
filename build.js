const fs = require('fs');
const path = require('path');

const modpacksDir = './modpacks';
const outputFile = './modpacks.json';

const combined = {};

fs.readdirSync(modpacksDir).forEach(file => {
  if (path.extname(file) === '.json') {
    const filePath = path.join(modpacksDir, file);
    const modpackData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 优先使用文件中的name属性，没有则使用文件名
    const modpackName = modpackData.name || file
      .replace('.json', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    
    combined[modpackName] = modpackData;
  }
});

fs.writeFileSync(outputFile, JSON.stringify(combined, null, 2));
console.log(`已生成 ${outputFile}，包含 ${Object.keys(combined).length} 个整合包`);