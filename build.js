const fs = require('fs');
const path = require('path');

const modpacksDir = './modpacks';
const outputFile = './modpacks.json';

const combined = {};

// 读取所有整合包文件
fs.readdirSync(modpacksDir).forEach(file => {
  if (path.extname(file) === '.json') {
    const filePath = path.join(modpacksDir, file);
    const modpackData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 从文件名还原原始名称
    const modpackName = file
      .replace('.json', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()); // 首字母大写
    
    combined[modpackName] = modpackData;
  }
});

// 保存合并后的文件
fs.writeFileSync(outputFile, JSON.stringify(combined, null, 2));
console.log(`已生成 ${outputFile}，包含 ${Object.keys(combined).length} 个整合包`);