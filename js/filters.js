let activeFilter = null;

function setupFilters() {
    const filtersContainer = document.querySelector('.filters');

    filtersContainer.addEventListener('click', function (e) {
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
    const cards = document.querySelectorAll('.modpack-card');

    cards.forEach(card => {
        let shouldShow = true;

        if (activeFilter === 'all') {
            shouldShow = true;
        } else if (activeFilter === 'download') {
            const isDownload = card.querySelector('.download-available') ||
                               card.querySelector('a[download]');
            shouldShow = !!isDownload;
        } else if (activeFilter?.startsWith('version:')) {
            const versionValue = activeFilter.split(':')[1];
            const version = card.querySelector('.version')?.textContent || '';
            shouldShow = version.includes(versionValue);
        } else if (activeFilter?.startsWith('tag:')) {
            const tagValue = activeFilter.split(':')[1];
            const tags = card.querySelector('.modpack-tags')?.textContent || '';
            shouldShow = tags.includes(tagValue);
        }

        card.style.display = shouldShow ? 'block' : 'none';
    });
}
