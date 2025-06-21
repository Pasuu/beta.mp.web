// 初始化函数
function initializeApp(modpacks) {
    generateModpackCards(modpacks);
    updateStats(modpacks);
    setupSearch(modpacks);
    setupFilters(modpacks);
}