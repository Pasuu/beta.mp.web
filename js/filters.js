function setupFilters(modpacks) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按钮的active类
            filterBtns.forEach(b => b.classList.remove('active'));
            // 为当前按钮添加active类
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            const cards = document.querySelectorAll('.modpack-card');
            
            cards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                    return;
                }
                
                if (filter === 'download') {
                    const isDownload = card.querySelector('.download-available');
                    card.style.display = isDownload ? 'block' : 'none';
                    return;
                }
                
                const tags = card.querySelector('.modpack-tags').textContent.toLowerCase();
                card.style.display = tags.includes(filter.toLowerCase()) ? 'block' : 'none';
            });
        });
    });
}