const USE_SPLIT_FILES = false; // 设为true启用拆分文件加载

window.onload = function() {
  const container = document.getElementById('modpacksContainer');
  container.innerHTML = `
    <div class="loading">
      <i class="fas fa-spinner"></i>
      <p>正在加载整合包数据...</p>
    </div>
  `;

  // 评论功能切换
  const icon = document.getElementById('comment-icon');
  const lvContainer = document.getElementById('lv-container');

  icon.addEventListener('click', () => {
    if (lvContainer.style.display === 'none' || lvContainer.style.display === '') {
      lvContainer.style.display = 'block';
    } else {
      lvContainer.style.display = 'none';
    }
  });

  // 主加载函数
  const loadData = () => {
if (USE_SPLIT_FILES) {
  // 从索引文件加载文件列表
  fetch('modpacks/index.json')
    .then(response => {
      if (!response.ok) throw new Error('索引文件加载失败');
      return response.json();
    })
    .then(index => {
      // 并行加载所有整合包文件
      const promises = index.files.map(file => 
        fetch(`modpacks/${file}`)
          .then(r => r.json())
          .catch(e => {
            console.error(`加载 ${file} 失败:`, e);
            return null;
          })
      );
      
      return Promise.all(promises);
    })
    .then(modpacksArray => {
      // 过滤掉加载失败的项目
      const validPacks = modpacksArray.filter(pack => pack !== null);
      
      // 组合数据
      const combined = {};
      validPacks.forEach(pack => {
        // 从文件名提取原始名称
        const name = pack.name || 
                    file.replace('.json', '')
                         .replace(/_/g, ' ')
                         .replace(/\b\w/g, c => c.toUpperCase());
        combined[name] = pack;
      });
      
      initializeApp(combined);
    })
    .catch(error => {
      console.error('加载拆分文件失败:', error);
      loadFallback();
    });
} else {
      // 单文件加载模式
      fetch('modpacks.json')
        .then(response => {
          if (!response.ok) throw new Error('网络响应异常');
          return response.json();
        })
        .then(data => initializeApp(data))
        .catch(error => {
          console.error('加载整合包数据失败:', error);
          showError(error);
        });
    }
  };

  // 错误处理
  const showError = (error) => {
    container.innerHTML = `
      <div class="loading">
        <i class="fas fa-exclamation-triangle"></i>
        <p>加载整合包数据失败，请刷新页面重试</p>
        <p>${error.message}</p>
      </div>
    `;
  };

  // 回退加载
  const loadFallback = () => {
    fetch('modpacks.json')
      .then(response => response.json())
      .then(data => initializeApp(data))
      .catch(finalError => {
        console.error('回退加载失败:', finalError);
        showError(finalError);
      });
  };

  // 启动加载流程
  loadData();
};