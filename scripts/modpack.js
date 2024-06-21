const fs = require('fs');
const path = require('path');

hexo.extend.tag.register('modpack', function(args) {
  const packname = args[0];
  const jsonPath = path.join(hexo.source_dir, 'data', 'modpacks', `${packname}.json`);
  let data = {};

  try {
    data = JSON.parse(fs.readFileSync(jsonPath));
  } catch (e) {
    console.error(`Failed to read JSON file for ${packname}:`, e);
  }

  const img = data.img || '';
  const i18version = data.i18version || '';
  const gversion = data.gversion || '';
  const i18team = data.i18team || '';
  const isdownload = data.isdownload ? '支持直链下载' : '';

  return `
    <div class="modpack">
      <img src="${img}" alt="${packname}" width="200" height="200">
      <p><strong>最新汉化版本：</strong><span style="color: rgb(17, 165, 133);">${i18version}</span></p>
      <p><strong>游戏版本：</strong><span style="color: rgba(12, 64, 206, 0.8);">${gversion}</span></p>
      <p><strong>汉化成员：</strong><span style="color: rgb(110, 35, 231);">${i18team}</span></p>
      <p style="color: rgb(255, 0, 0);">${isdownload}</p>
    </div>
  `;
}, {async: false});

console.log('modpack tag plugin loaded');
console.log(`Reading JSON file from: ${jsonPath}`);