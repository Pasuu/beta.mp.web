function generateModpackCards(modpacks) {
    const container = document.getElementById('modpacksContainer');
    container.innerHTML = '';
    
    Object.entries(modpacks).forEach(([name, data]) => {
        const tags = data.link.tags.split(',').map(tag => tag.trim());
        const tagElements = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        let downloadHTML = '';
        if (data.isdownload && data.link.download) {
          downloadHTML = `
            <a href="down/${data.link.download}" class="link-btn download-btn" download>
              <i class="fas fa-download"></i> 下载
            </a>`;
        } else if (data.isdownload) {
          downloadHTML = `<div class="download-available"><i class="fas fa-download"></i> 可下载资源</div>`;
        } else {
          downloadHTML = `<div class="download-not-available"><i class="fas fa-times-circle"></i> 无下载资源</div>`;
        }
        
        const card = document.createElement('div');
        card.className = 'modpack-card';
        card.innerHTML = `
            <div class="card-header">
                <img src="${data.img}" alt="${name}" class="modpack-img" onerror="this.src='https://via.placeholder.com/400x180/2c3e50/ffffff?text=Modpack+Image'">
                <h3 class="modpack-name">${name}</h3>
            </div>
            <div class="card-content">
                <div class="modpack-meta">
                    <span class="version">${data.gversion}</span>
                    <span class="team">${data.i18team}</span>
                </div>
                
                <div class="modpack-tags">
                    ${tagElements}
                </div>
                
                ${downloadBtn}
                
                <div class="modpack-links">
                    ${downloadBtn.includes('link-btn') ? downloadBtn : ''}
                    
                    ${data.link.curseforge ? 
                        `<a href="https://www.curseforge.com/minecraft/modpacks/${data.link.curseforge}" class="link-btn" target="_blank">
                            <i class="fab fa-cuttlefish"></i> CurseForge
                        </a>` : ''
                    }
                    
                    ${data.link.mcmod ? 
                        `<a href="https://www.mcmod.cn/modpack/${data.link.mcmod}.html" class="link-btn" target="_blank">
                            <i class="fas fa-book"></i> MC百科
                        </a>` : ''
                    }
                    
                    ${data.link.github ? 
                        `<a href="https://github.com/${data.link.github}" class="link-btn" target="_blank">
                            <i class="fab fa-github"></i> GitHub
                        </a>` : ''
                    }
                    
                    ${data.link.bilibili ? 
                        `<a href="https://space.bilibili.com/${data.link.bilibili}" class="link-btn" target="_blank">
                            <i class="fab fa-bilibili"></i> B站
                        </a>` : ''
                    }
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}