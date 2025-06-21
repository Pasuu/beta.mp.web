function initializeApp(modpacks) {
    generateModpackCards(modpacks);
    updateStats(modpacks);
    setupSearch(modpacks);
    generateFilterButtons(modpacks);
    setupFilters();
}