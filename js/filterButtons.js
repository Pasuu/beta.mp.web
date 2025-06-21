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
        btn.setAttribute('data-filter', `version:${version}`);
        btn.textContent = version;
        filtersContainer.appendChild(btn);
    });

    Array.from(tags).sort().forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.setAttribute('data-filter', `tag:${tag}`);
        btn.textContent = tag;
        filtersContainer.appendChild(btn);
    });

    const toggleBtn = document.getElementById('toggleFilters');
    toggleBtn.addEventListener('click', function() {
        filtersContainer.classList.toggle('expanded');
        
        const icon = this.querySelector('i');
        if (filtersContainer.classList.contains('expanded')) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            this.innerHTML = '<i class="fas fa-chevron-up"></i> 收起';
        } else {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            this.innerHTML = '<i class="fas fa-chevron-down"></i> 更多';
        }
    });

    setupFilters();
}