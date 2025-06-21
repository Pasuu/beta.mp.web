let activeFilters = new Set();

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            if (filter === 'all') {
                activeFilters.clear();
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            } else if (filter === 'download') {
                activeFilters.clear();
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            } 
            else {
                document.querySelector('.filter-btn[data-filter="all"]').classList.remove('active');
                document.querySelector('.filter-btn[data-filter="download"]').classList.remove('active');
                
                this.classList.toggle('active');
                
                if (this.classList.contains('active')) {
                    activeFilters.add(filter);
                } else {
                    activeFilters.delete(filter);
                }
            }
            
            applyFilters();
        });
    });
}

function applyFilters() {
    const cards = document.querySelectorAll('.modpack-card');
    
    cards.forEach(card => {
        let shouldShow = true;
        
        if (activeFilters.has('all')) {
            shouldShow = true;
        } 
        else if (activeFilters.has('download')) {
            const isDownload = card.querySelector('.download-available') || 
                              card.querySelector('a[download]');
            shouldShow = isDownload ? true : false;
        } 
        else if (activeFilters.size > 0) {
            shouldShow = false;
            const tags = card.querySelector('.modpack-tags').textContent;
            const version = card.querySelector('.version').textContent;
            
            let matchesAll = true;
            for (const filter of activeFilters) {
                if (filter.startsWith('version:')) {
                    const versionValue = filter.split(':')[1];
                    if (!version.includes(versionValue)) {
                        matchesAll = false;
                        break;
                    }
                } 
                else if (filter.startsWith('tag:')) {
                    const tagValue = filter.split(':')[1];
                    if (!tags.includes(tagValue)) {
                        matchesAll = false;
                        break;
                    }
                }
            }
            
            shouldShow = matchesAll;
        }
        
        card.style.display = shouldShow ? 'block' : 'none';
    });
}