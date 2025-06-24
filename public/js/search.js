function setupSearch(modpacks) {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        // 如果没有搜索词，显示所有卡片
        if (!searchTerm) {
            const cards = document.querySelectorAll('.modpack-card');
            cards.forEach(card => card.style.display = 'block');
            return;
        }
        
        const cards = document.querySelectorAll('.modpack-card');
        let hasMatches = false;
        
        cards.forEach(card => {
            const name = card.querySelector('.modpack-name').textContent.toLowerCase();
            const tags = card.querySelector('.modpack-tags').textContent.toLowerCase();
            const version = card.querySelector('.version')?.textContent.toLowerCase() || '';
            
            if (name.includes(searchTerm) || tags.includes(searchTerm) || version.includes(searchTerm)) {
                card.style.display = 'block';
                hasMatches = true;
            } else {
                card.style.display = 'none';
            }
        });
        
        // 如果没有匹配项，显示提示
        if (!hasMatches) {
            const container = document.getElementById('modpacksContainer');
            const noResults = document.createElement('div');
            noResults.className = 'loading';
            noResults.style.gridColumn = '1 / -1';
            noResults.innerHTML = '<i class="fas fa-search"></i><p>没有找到匹配的整合包</p>';
            container.appendChild(noResults);
        }
    });
}