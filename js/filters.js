function setupFilters() {
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
                    const isDownload = card.querySelector('.download-available') || 
                                      card.querySelector('a[download]');
                    card.style.display = isDownload ? 'block' : 'none';
                    return;
                }
                
                const tags = card.querySelector('.modpack-tags').textContent;
                const version = card.querySelector('.version').textContent;
                
                if (tags.includes(filter) || version.includes(filter)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}