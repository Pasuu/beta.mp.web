window.onload = function() {
    // 显示加载状态
    const container = document.getElementById('modpacksContainer');
    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner"></i>
            <p>正在加载模组包数据...</p>
        </div>
    `;
    
    // 从外部JSON文件加载数据
    fetch('modpacks.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应异常');
            }
            return response.json();
        })
        .then(data => {
            // 成功加载数据后初始化应用
            initializeApp(data);
        })
        .catch(error => {
            // 处理错误情况
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