function updateStats(modpacks) {
    // 计算统计数据
    const totalModpacks = Object.keys(modpacks).length;
    const downloadable = Object.values(modpacks).filter(pack => pack.isdownload).length;
    
    // 提取所有版本
    const versions = new Set();
    Object.values(modpacks).forEach(pack => {
        const version = pack.gversion.split('-')[0];
        versions.add(version);
    });
    
    // 提取所有团队
    const teams = new Set();
    Object.values(modpacks).forEach(pack => {
        teams.add(pack.i18team);
    });
    
    // 更新DOM元素
    document.getElementById('totalModpacks').textContent = totalModpacks;
    document.getElementById('downloadable').textContent = downloadable;
    document.getElementById('teams').textContent = teams.size;
    document.getElementById('versions').textContent = versions.size;
}