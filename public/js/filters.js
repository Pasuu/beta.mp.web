// filters.js (完整替换)
let activeFilter = 'all';

function setupFilters() {
    const filtersContainer = document.querySelector('.filters');
    
    filtersContainer.addEventListener('click', function(e) {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        const filter = btn.getAttribute('data-filter');
        const allBtns = filtersContainer.querySelectorAll('.filter-btn');
        
        allBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = filter;
        
        applyFilters();
    });
}

function applyFilters() {
    const container = document.getElementById('modpacksContainer');
    const cards = container.querySelectorAll('.modpack-card');
    let hasVisibleCards = false;

    // 移除旧的无结果提示
    const oldNoResults = container.querySelector('.no-results');
    if (oldNoResults) oldNoResults.remove();

    cards.forEach(card => {
        let shouldShow = true;
        
        if (activeFilter === 'all') {
            shouldShow = true;
        } else if (activeFilter === 'download') {
            const hasDownload = card.querySelector('.download-available') !== null;
            shouldShow = hasDownload;
        } else if (activeFilter.startsWith('version:')) {
            const versionValue = activeFilter.split(':')[1];
            const versionEl = card.querySelector('.version');
            shouldShow = versionEl && versionEl.textContent.includes(versionValue);
        } else if (activeFilter.startsWith('tag:')) {
            const tagValue = activeFilter.split(':')[1];
            const tagsText = card.querySelector('.modpack-tags').textContent;
            shouldShow = tagsText.includes(tagValue);
        }
        
        card.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) hasVisibleCards = true;
    });

    // 显示无结果提示
    if (!hasVisibleCards) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = '<i class="fas fa-search"></i><p>没有找到匹配的整合包</p>';
        container.appendChild(noResults);
    }
}