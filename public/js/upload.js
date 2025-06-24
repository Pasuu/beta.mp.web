// upload.js
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const uploadBtn = document.querySelector('.upload-btn');
    const uploadStatus = document.getElementById('upload-status');
    
    // 添加拖拽上传功能
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.dataTransfer.items.length > 0) {
            uploadBtn.classList.add('drag-over');
        }
    });
    
    document.addEventListener('dragleave', () => {
        uploadBtn.classList.remove('drag-over');
    });
    
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBtn.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleFileUpload(fileInput.files[0]);
        }
    });
    
    // 点击按钮触发文件选择
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 文件选择变化时处理上传
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // 处理文件上传
    async function handleFileUpload(file) {
        // 检查文件大小 (最大4.5MB)
        if (file.size > 4.5 * 1024 * 1024) {
            showUploadStatus('文件大小超过4.5MB限制', 'error');
            return;
        }
        
        // 检查文件类型
        const validTypes = ['application/zip', 'application/x-rar-compressed', 
                           'application/x-7z-compressed', 'application/octet-stream'];
        if (!validTypes.includes(file.type)) {
            showUploadStatus('仅支持ZIP、RAR、7Z格式', 'error');
            return;
        }
        
        try {
            // 显示上传中状态
            showUploadStatus(`上传中: ${file.name}...`, 'loading');
            
            // 准备表单数据
            const formData = new FormData();
            formData.append('file', file);
            
            // 发送到API端点
            const response = await fetch('/api/blob', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`上传失败: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // 显示成功状态
            showUploadStatus(
                `上传成功! 文件URL: <a href="${result.url}" target="_blank">点击查看</a>`,
                'success'
            );
            
            // 3秒后清除状态
            setTimeout(() => {
                uploadStatus.innerHTML = '';
                uploadStatus.className = '';
            }, 5000);
            
            // 重置文件输入
            fileInput.value = '';
            
        } catch (error) {
            console.error('上传错误:', error);
            showUploadStatus(`上传失败: ${error.message}`, 'error');
        }
    }
    
    // 显示上传状态
    function showUploadStatus(message, type) {
        uploadStatus.innerHTML = `
            <div class="status-content">
                <i class="fas ${getIconClass(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        uploadStatus.className = `upload-status ${type}`;
    }
    
    // 获取状态图标
    function getIconClass(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-times-circle';
            case 'loading': return 'fa-spinner fa-spin';
            default: return 'fa-info-circle';
        }
    }
});