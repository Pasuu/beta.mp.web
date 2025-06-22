const fs = require('fs');
const path = require('path');

const modpacksDir = './modpacks';
const indexPath = path.join(modpacksDir, 'index.json');

// 读取 modpacks 目录中的所有文件
fs.readdir(modpacksDir, (err, files) => {
  if (err) {
    console.error('无法读取目录:', err);
    return;
  }

  // 过滤出 JSON 文件（排除 index.json 自身）
  const jsonFiles = files.filter(file => 
    path.extname(file) === '.json' && file !== 'index.json'
  );

  // 创建索引数据
  const indexData = {
    generated: new Date().toISOString(),
    count: jsonFiles.length,
    files: jsonFiles
  };

  // 写入索引文件
  fs.writeFile(indexPath, JSON.stringify(indexData, null, 2), (err) => {
    if (err) {
      console.error('写入索引文件失败:', err);
    } else {
      console.log(`成功创建索引文件: ${indexPath}`);
      console.log(`包含 ${jsonFiles.length} 个整合包文件`);
    }
  });
});