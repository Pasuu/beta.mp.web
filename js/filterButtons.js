
function generateFilterButtons(modpacks) {
    const filtersContainer = document.querySelector('.filters');
    const versions = new Set();
    const tags = new Set();


    Object.values(modpacks).forEach(pack => {

        const version = pack.gversion.split('-')[0];
        versions.add(version);
        const packTags = pack.link.tags.split(',').map(tag => tag.trim());
        packTags.forEach(tag => tags.add(tag));
    });

    Array.from(versions).sort().reverse().forEach(version => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.setAttribute('data-filter', version);
        btn.textContent = version;
        filtersContainer.appendChild(btn);
    });

    Array.from(tags).sort().forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.setAttribute('data-filter', tag);
        btn.textContent = tag;
        filtersContainer.appendChild(btn);
    });

    setupFilters();
}