function setupSearch(modpacks) {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const cards = document.querySelectorAll('.modpack-card');
        
        cards.forEach(card => {
            const name = card.querySelector('.modpack-name').textContent.toLowerCase();
            const tags = card.querySelector('.modpack-tags').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || tags.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}