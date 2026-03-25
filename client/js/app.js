const { createApp, ref, reactive, computed, onMounted, watch } = Vue;

// API 基础配置
const API_BASE = '/api';

// 主应用组件
const App = {
    setup() {
        // ========== 状态定义 ==========
        const modpacks = ref([]);
        const loading = ref(true);
        const error = ref(null);
        const stats = reactive({
            total: 0,
            downloadable: 0,
            versions: 0,
            teams: 0
        });
        
        // 筛选状态
        const searchQuery = ref('');
        const activeFilter = ref('all');
        const filterOptions = reactive({
            versions: [],
            tags: []
        });
        
        // 分页状态
        const currentPage = ref(1);
        const pageSize = ref(50);
        const totalPages = ref(1);
        const loadingMore = ref(false);
        
        // 上传模态框状态
        const uploadModalVisible = ref(false);
        const selectedFile = ref(null);
        const uploadProgress = ref(0);
        const uploading = ref(false);
        const uploadResult = ref(null);
        
        // 评论框状态
        const commentVisible = ref(false);
        
        // ========== 数据获取函数 ==========
        const fetchModpacks = async (reset = true) => {
            if (reset) {
                loading.value = true;
                currentPage.value = 1;
            } else {
                loadingMore.value = true;
            }
            
            try {
                const params = new URLSearchParams();
                params.append('page', currentPage.value);
                params.append('limit', pageSize.value);
                
                if (searchQuery.value) {
                    params.append('search', searchQuery.value);
                }
                
                if (activeFilter.value === 'download') {
                    params.append('download', 'true');
                } else if (activeFilter.value.startsWith('version:')) {
                    params.append('version', activeFilter.value.split(':')[1]);
                } else if (activeFilter.value.startsWith('tag:')) {
                    params.append('tag', activeFilter.value.split(':')[1]);
                }
                
                const response = await axios.get(`${API_BASE}/modpacks?${params}`);
                
                // 处理标签字符串为数组
                const processedData = response.data.data.map(item => ({
                    ...item,
                    tags_list: item.tags ? item.tags.split(',').map(t => t.trim()) : []
                }));
                
                if (reset) {
                    modpacks.value = processedData;
                } else {
                    modpacks.value = [...modpacks.value, ...processedData];
                }
                
                totalPages.value = response.data.totalPages;
            } catch (err) {
                console.error('获取数据失败:', err);
                error.value = err.message;
            } finally {
                loading.value = false;
                loadingMore.value = false;
            }
        };
        
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API_BASE}/modpacks/stats/summary`);
                Object.assign(stats, response.data);
            } catch (err) {
                console.error('获取统计失败:', err);
            }
        };
        
        const fetchFilterOptions = async () => {
            try {
                const response = await axios.get(`${API_BASE}/modpacks/filters/options`);
                filterOptions.versions = response.data.versions;
                filterOptions.tags = response.data.tags;
            } catch (err) {
                console.error('获取筛选选项失败:', err);
            }
        };
        
        // ========== 筛选和搜索函数 ==========
        const setFilter = (filter) => {
            activeFilter.value = filter;
            fetchModpacks(true);
        };
        
        const handleSearch = () => {
            fetchModpacks(true);
        };
        
        // ========== 滚动加载 ==========
        const loadMore = () => {
            if (currentPage.value < totalPages.value && !loadingMore.value) {
                currentPage.value++;
                fetchModpacks(false);
            }
        };
        
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            
            if (scrollTop + clientHeight >= scrollHeight - 300) {
                loadMore();
            }
        };
        
        // ========== 图片处理 ==========
        const getImageUrl = (originalUrl) => {
            if (!originalUrl) return '/img/default-modpack.png';
            if (originalUrl.startsWith('/') || originalUrl.startsWith('data:')) {
                return originalUrl;
            }
            return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
        };
        
        const handleImageError = (event) => {
            event.target.src = '/img/default-modpack.png';
        };
        
        // ========== 上传功能 ==========
        const handleFileSelect = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const validExtensions = ['.zip', '.rar', '.7z'];
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            
            if (!validExtensions.includes(ext)) {
                uploadResult.value = { 
                    type: 'error', 
                    message: '不支持的文件类型！请上传ZIP、RAR或7Z格式的压缩文件。' 
                };
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) {
                uploadResult.value = { 
                    type: 'error', 
                    message: '文件太大！最大支持10MB' 
                };
                return;
            }
            
            selectedFile.value = file;
            uploadResult.value = null;
        };
        
const startUpload = async () => {
    if (!selectedFile.value) return;
    
    uploading.value = true;
    uploadProgress.value = 0;
    uploadResult.value = null;
    
    try {
        // 使用 FormData 发送文件
        const formData = new FormData();
        formData.append('file', selectedFile.value);
        
        const response = await axios.post(`${API_BASE}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                uploadProgress.value = percent;
            }
        });
        
        uploadResult.value = {
            type: 'success',
            message: `上传成功！文件地址: ${response.data.url}`
        };
        
        // 保存上传的 URL 以便提交表单使用
        window.uploadedFileUrl = response.data.url;
        
        setTimeout(() => {
            resetUploadForm();
        }, 3000);
    } catch (err) {
        console.error('上传失败:', err);
        let errorMessage = '上传失败';
        if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
        } else if (err.response?.data?.details) {
            errorMessage = err.response.data.details;
        } else if (err.message) {
            errorMessage = err.message;
        }
        
        uploadResult.value = {
            type: 'error',
            message: errorMessage
        };
    } finally {
        uploading.value = false;
    }
};
        
        const resetUploadForm = () => {
            selectedFile.value = null;
            uploadProgress.value = 0;
            uploadResult.value = null;
            const fileInput = document.getElementById('file-input');
            if (fileInput) fileInput.value = '';
        };
        
        const openUploadModal = () => {
            uploadModalVisible.value = true;
            resetUploadForm();
        };
        
        const closeUploadModal = () => {
            uploadModalVisible.value = false;
            resetUploadForm();
        };
        
        // ========== 评论功能 ==========
        const toggleComment = () => {
            commentVisible.value = !commentVisible.value;
        };
        
        // ========== 工具函数 ==========
        const formatFileSize = (bytes) => {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / 1048576).toFixed(1) + ' MB';
        };
        
        // ========== 监听器 ==========
        let searchTimeout;
        watch(searchQuery, () => {
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch();
            }, 300);
        });
        
        // ========== 生命周期 ==========
        onMounted(() => {
            fetchModpacks();
            fetchStats();
            fetchFilterOptions();
            window.addEventListener('scroll', handleScroll);
        });
        
        // ========== 计算属性 ==========
        const hasMore = computed(() => currentPage.value < totalPages.value);
        
        // ========== 返回所有响应式数据和方法 ==========
        return {
            modpacks,
            loading,
            error,
            stats,
            searchQuery,
            activeFilter,
            filterOptions,
            currentPage,
            totalPages,
            loadingMore,
            hasMore,
            uploadModalVisible,
            selectedFile,
            uploadProgress,
            uploading,
            uploadResult,
            commentVisible,
            setFilter,
            handleSearch,
            loadMore,
            openUploadModal,
            closeUploadModal,
            handleFileSelect,
            startUpload,
            resetUploadForm,
            toggleComment,
            getImageUrl,
            handleImageError,
            formatFileSize
        };
    },
    template: `
        <div>
            <header>
                <div class="header-content">
                    <div class="header-row">
                        <div class="logo">
                            <i class="fas fa-cubes logo-icon"></i>
                            <div class="logo-text">
                                <h1>Minecraft 整合包汉化</h1>
                                <p>未经授权,不许转发</p>
                            </div>
                        </div>
                        
                        <div class="controls">
                            <div class="search-container">
                                <i class="fas fa-search search-icon"></i>
                                <input type="text" v-model="searchQuery" placeholder="搜索包名称、标签或版本...">
                            </div>
                            
                            <div class="nav-buttons">
                                <a href="/" class="nav-btn">
                                    <i class="fas fa-home"></i> 首页
                                </a>
                                <a href="/submit.html" class="nav-btn">
                                    <i class="fas fa-plus-circle"></i> 提交汉化
                                </a>
                                <a href="/my-submissions.html" class="nav-btn">
                                    <i class="fas fa-history"></i> 我的提交
                                </a>
                            </div>
                            
                            <div class="filters">
                                <button class="filter-btn" :class="{ active: activeFilter === 'all' }" @click="setFilter('all')">全部</button>
                                <button class="filter-btn" :class="{ active: activeFilter === 'download' }" @click="setFilter('download')">可下载</button>
                                
                                <template v-for="version in filterOptions.versions" :key="version">
                                    <button class="filter-btn" :class="{ active: activeFilter === 'version:' + version }" @click="setFilter('version:' + version)">
                                        {{ version }}
                                    </button>
                                </template>
                                
                                <template v-for="tag in filterOptions.tags" :key="tag">
                                    <button class="filter-btn" :class="{ active: activeFilter === 'tag:' + tag }" @click="setFilter('tag:' + tag)">
                                        {{ tag }}
                                    </button>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <main>
                <!-- 统计卡片 -->
                <div class="stats">
                    <div class="stat-card">
                        <h3>{{ stats.total }}</h3>
                        <p>汉化包总数</p>
                    </div>
                    <div class="stat-card">
                        <h3>{{ stats.downloadable }}</h3>
                        <p>可下载资源</p>
                    </div>
                    <div class="stat-card">
                        <h3>{{ stats.teams }}</h3>
                        <p>汉化作者</p>
                    </div>
                    <div class="stat-card">
                        <h3>{{ stats.versions }}</h3>
                        <p>不同版本</p>
                    </div>
                </div>
            
                
                <!-- 加载状态 -->
                <div v-if="loading" class="loading">
                    <i class="fas fa-spinner"></i>
                    <p>正在加载整合包数据...</p>
                </div>
                
                <div v-else-if="error" class="loading">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>加载失败: {{ error }}</p>
                </div>
                
                <!-- 整合包网格 -->
                <div v-else class="modpacks-grid">
                    <div v-for="pack in modpacks" :key="pack.id" class="modpack-card">
                        <div class="card-header">
                            <img 
                                :src="getImageUrl(pack.img)" 
                                :alt="pack.name" 
                                class="modpack-img" 
                                loading="lazy"
                                @error="handleImageError"
                            >
                            <h3 class="modpack-name">{{ pack.name }}</h3>
                        </div>
                        <div class="card-content">
                            <div class="modpack-meta">
                                <span class="version">{{ pack.gversion }}</span>
                                <span class="team">{{ pack.i18team }}</span>
                            </div>
                            
                            <div class="i18n-version">
                                <span>汉化版本:</span>
                                <span>{{ pack.i18version }}</span>
                            </div>
                            
                            <div class="modpack-tags">
                                <span v-for="tag in pack.tags_list" :key="tag" class="tag">{{ tag }}</span>
                            </div>
                            
                            <div v-if="pack.isdownload" class="download-available">
                                <i class="fas fa-download"></i> 可下载资源
                            </div>
                            <div v-else class="download-not-available">
                                <i class="fas fa-times-circle"></i> 无下载资源
                            </div>
                            
                            <div class="modpack-links" v-if="pack.link">
                                <a v-if="pack.link.curseforge" :href="'https://www.curseforge.com/minecraft/modpacks/' + pack.link.curseforge" class="link-btn" target="_blank">
                                    <img src="/img/curseforge.svg" alt="CurseForge" class="icon"> CurseForge
                                </a>
                                <a v-if="pack.link.ftb" :href="'https://www.feed-the-beast.com/modpacks/' + pack.link.ftb" class="link-btn" target="_blank">
                                    <img src="/img/ftb.svg" alt="FTB" class="icon"> FTB
                                </a>
                                <a v-if="pack.link.mcmod" :href="'https://www.mcmod.cn/modpack/' + pack.link.mcmod + '.html'" class="link-btn" target="_blank">
                                    <img src="/img/mcmod.svg" alt="MC百科" class="icon"> MC百科
                                </a>
                                <a v-if="pack.link.github" :href="'https://github.com/' + pack.link.github" class="link-btn" target="_blank">
                                    <i class="fab fa-github icon"></i> GitHub
                                </a>
                                <a v-if="pack.link.bilibili" :href="'https://space.bilibili.com/' + pack.link.bilibili" class="link-btn" target="_blank">
                                    <img src="/img/bilibili-line-blue.svg" alt="B站主页" class="icon"> B站主页
                                </a>
                                <a v-if="pack.link.bilibilidwvideo" :href="'https://www.bilibili.com/video/' + pack.link.bilibilidwvideo" class="link-btn" target="_blank">
                                    <img src="/img/bilibili-line-red.svg" alt="B站视频" class="icon"> B站视频
                                </a>
                                <a v-if="pack.link.download" :href="pack.link.download" class="link-btn" download>
                                    <i class="fas fa-download"></i> 下载
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 加载更多指示器 -->
                <div v-if="!loading && hasMore && !loadingMore" class="lazy-load-indicator">
                    <i class="fas fa-spinner"></i> 滚动加载更多...
                </div>
                
                <div v-if="loadingMore" class="lazy-load-indicator">
                    <i class="fas fa-spinner"></i> 正在加载更多整合包...
                </div>
                
                <!-- 无结果提示 -->
                <div v-if="!loading && modpacks.length === 0" class="no-results">
                    <i class="fas fa-search"></i>
                    <p>没有找到匹配的整合包</p>
                </div>
                
                <!-- 评论区 -->
                <div id="lv-container" v-show="commentVisible" data-id="city" data-uid="MTAyMC81ODc5NS8zNTI1Nw==">
                    <script type="text/javascript">
                        (function(d, s) {
                            var j, e = d.getElementsByTagName(s)[0];
                            if (typeof LivereTower === 'function') { return; }
                            j = d.createElement(s);
                            j.src = 'https://cdn-city.livere.com/js/embed.dist.js';
                            j.async = true;
                            e.parentNode.insertBefore(j, e);
                        })(document, 'script');
                    </script>
                    <noscript>为正常使用来必力评论功能请激活JavaScript</noscript>
                </div>
                
                <!-- 评论按钮 -->
                <div id="comment-icon" @click="toggleComment" :title="commentVisible ? '关闭评论' : '打开评论'">
                    <i class="fa fa-comments"></i>
                </div>
                
                <!-- 上传按钮 -->
                <div id="upload-icon" @click="openUploadModal" title="上传整合包">
                    <i class="fa fa-cloud-upload-alt"></i>
                </div>
            </main>
            
            <footer>
                <p>Copyright © 2025 Pasuu by Modpack.top</p>
            </footer>
            
            <!-- 上传模态框 -->
            <div v-if="uploadModalVisible" class="modal" @click.self="closeUploadModal">
                <div class="modal-content">
                    <span class="close-btn" @click="closeUploadModal">&times;</span>
                    <h2><i class="fas fa-file-archive"></i> 上传汉化包</h2>
                    <p class="modal-subtitle">请上传压缩格式的汉化包文件 (.zip, .rar, .7z)</p>
                    
                    <div class="upload-area" @dragover.prevent @drop.prevent="handleFileSelect">
                        <div class="upload-icon">
                            <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <p>拖放文件到此处 或</p>
                        <button class="select-file-btn" @click="$refs.fileInput.click()">选择文件</button>
                        <input type="file" ref="fileInput" id="file-input" accept=".zip,.rar,.7z" style="display: none" @change="handleFileSelect">
                        <p class="file-type-hint">支持格式: ZIP, RAR, 7Z (最大10MB)</p>
                    </div>
                    
                    <div v-if="selectedFile" class="file-info">
                        <p><i class="fas fa-file-archive"></i> <span>{{ selectedFile.name }}</span></p>
                        <p><i class="fas fa-weight-hanging"></i> <span>{{ formatFileSize(selectedFile.size) }}</span></p>
                    </div>
                    
                    <div class="progress-container" v-if="uploading">
                        <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
                        <div class="progress-text">{{ uploadProgress }}%</div>
                    </div>
                    
                    <div class="modal-actions">
                        <button id="start-upload-btn" @click="startUpload" :disabled="!selectedFile || uploading">
                            <i :class="uploading ? 'fas fa-spinner fa-spin' : 'fas fa-upload'"></i>
                            {{ uploading ? '上传中...' : '开始上传' }}
                        </button>
                        <button id="cancel-upload-btn" class="cancel-btn" @click="closeUploadModal">
                            <i class="fas fa-times"></i> 取消
                        </button>
                    </div>
                    
                    <div v-if="uploadResult" class="upload-result">
                        <div :class="'result-' + uploadResult.type">
                            <i :class="uploadResult.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
                            {{ uploadResult.message }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

// 创建应用
const app = createApp({
    components: { App },
    template: '<app />'
});

app.mount('#app');