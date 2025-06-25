// js/upload.js
import { put } from 'https://esm.sh/@vercel/blob';

export function initUpload(BLOB_TOKEN) {
    if (!BLOB_TOKEN) {
        console.error('未找到有效的Blob令牌');
        return;
    }

    // 获取DOM元素
    const uploadIcon = document.getElementById('upload-icon');
    const uploadModal = document.getElementById('upload-modal');
    const closeBtn = document.querySelector('.close-btn');
    const fileInput = document.getElementById('file-input');
    const fileDropArea = document.getElementById('file-drop-area');
    const startUploadBtn = document.getElementById('start-upload-btn');
    const cancelUploadBtn = document.getElementById('cancel-upload-btn');
    const fileNameDisplay = document.getElementById('file-name');
    const fileSizeDisplay = document.getElementById('file-size');
    const selectedFileInfo = document.getElementById('selected-file-info');
    const uploadProgress = document.getElementById('upload-progress');
    const progressText = document.getElementById('progress-text');
    const uploadResult = document.getElementById('upload-result');
    const selectFileBtn = document.querySelector('.select-file-btn');
    
    let selectedFile = null;
    
    // 打开模态框
    uploadIcon.addEventListener('click', () => {
        uploadModal.style.display = 'block';
    });
    
    // 关闭模态框
    closeBtn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
        resetUploadForm();
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            uploadModal.style.display = 'none';
            resetUploadForm();
        }
    });
    
    // 取消上传
    cancelUploadBtn.addEventListener('click', () => {
        resetUploadForm();
    });
    
    // 重置表单
    function resetUploadForm() {
        fileInput.value = '';
        selectedFile = null;
        selectedFileInfo.style.display = 'none';
        startUploadBtn.disabled = true;
        uploadProgress.style.width = '0%';
        progressText.textContent = '0%';
        uploadResult.innerHTML = '';
        fileDropArea.classList.remove('dragover');
    }
    
    // 选择文件按钮点击事件
    selectFileBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 文件选择处理
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });
    
    // 拖放功能
    fileDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropArea.classList.add('dragover');
    });
    
    fileDropArea.addEventListener('dragleave', () => {
        fileDropArea.classList.remove('dragover');
    });
    
    fileDropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });
    
    // 处理文件选择
    function handleFileSelection(file) {
        // 验证文件类型
        const validExtensions = ['.zip', '.rar', '.7z'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            showUploadResult('error', '不支持的文件类型！请上传ZIP、RAR或7Z格式的压缩文件。');
            return;
        }
        
        // 验证文件大小 (免费版限制4.5MB)
        if (file.size > 4.5 * 1024 * 1024) {
            showUploadResult('error', '文件太大！最大支持4.5MB');
            return;
        }
        
        selectedFile = file;
        fileNameDisplay.textContent = file.name;
        fileSizeDisplay.textContent = formatFileSize(file.size);
        selectedFileInfo.style.display = 'block';
        startUploadBtn.disabled = false;
    }
    
    // 开始上传
    startUploadBtn.addEventListener('click', async () => {
        if (!selectedFile) return;
        
        try {
            // 重置UI
            uploadProgress.style.width = '0%';
            progressText.textContent = '0%';
            uploadResult.innerHTML = '';
            startUploadBtn.disabled = true;
            startUploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上传中...';
            
            // 使用 Vercel Blob SDK 上传
            const blob = await put(selectedFile.name, selectedFile, {
                access: 'public',
                token: BLOB_TOKEN,
                onProgress: (event) => {
                    const percent = Math.round((event.loaded / selectedFile.size) * 100);
                    uploadProgress.style.width = `${percent}%`;
                    progressText.textContent = `${percent}%`;
                }
            });
            
            // 上传成功
            showUploadResult('success', `汉化包上传成功！<br>下载链接: <a href="${blob.url}" target="_blank">${blob.url}</a>`);
            startUploadBtn.innerHTML = '<i class="fas fa-check"></i> 上传完成';
        } catch (error) {
            console.error('上传失败:', error);
            showUploadResult('error', `上传失败: ${error.message}`);
            startUploadBtn.disabled = false;
            startUploadBtn.innerHTML = '<i class="fas fa-upload"></i> 开始上传';
        }
    });
    
    // 显示上传结果
    function showUploadResult(type, message) {
        uploadResult.innerHTML = `<div class="result-${type}"><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}</div>`;
    }
    
    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
}