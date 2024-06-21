// scripts/links.js
hexo.extend.helper.register('getLink', function(key) {
  const linksData = this.site.data.links; // 获取数据文件中的 links 数据
  return linksData[key] || ''; // 根据 key 返回对应的链接，若不存在返回空字符串
});