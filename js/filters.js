let activeFilters = new Set();

function setupFilters() {
    const filtersContainer = document.querySelector('.filters');

 
    filtersContainer.addEventListener('click', function (e) {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        const filter = btn.getAttribute('data-filter');
        const allBtns = filtersContainer.querySelectorAll('.filter-btn');

        if (filter === 'all' || filter === 'download') {
            activeFilters.clear();
            allBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        } else {
 
            filtersContainer.querySelector('.filter-btn[data-filter="all"]')?.classList.remove('active');
            filtersContainer.querySelector('.filter-btn[data-filter="download"]')?.classList.remove('active');


            btn.classList.toggle('active');

            if (btn.classList.contains('active')) {
                activeFilters.add(filter);
            } else {
                activeFilters.delete(filter);
            }
        }

        applyFilters();
    });
}

function applyFilters() {
    const cards = document.querySelectorAll('.modpack-card');

    cards.forEach(card => {
        let shouldShow = true;

        if (activeFilters.has('all')) {
            shouldShow = true;
        } else if (activeFilters.has('download')) {
            const isDownload = card.querySelector('.download-available') || 
                               card.querySelector('a[download]');
            shouldShow = isDownload ? true : false;
        } else if (activeFilters.size > 0) {
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
                } else if (filter.startsWith('tag:')) {
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
