window.onload = function() {
  const container = document.getElementById('modpacksContainer');
    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner"></i>
            <p>正在加载模组包数据...</p>
        </div>
    `;
    
    fetch('modpacks.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应异常');
            }
            return response.json();
        })
        .then(data => {
            initializeApp(data);
        })
        .catch(error => {
            console.error('加载模组包数据失败:', error);
            container.innerHTML = `
                <div class="loading">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>加载模组包数据失败，请刷新页面重试</p>
                    <p>${error.message}</p>
                </div>
            `;
        });
};

// 评论
const icon = document.getElementById('comment-icon');
const lvContainer = document.getElementById('lv-container');

icon.addEventListener('click', () => {
  if (lvContainer.style.display === 'none' || lvContainer.style.display === '') {
    lvContainer.style.display = 'block';
  } else {
    lvContainer.style.display = 'none';
  }
});