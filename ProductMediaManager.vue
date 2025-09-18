<template>
  <div class="product-media-manager">
    <h2>商品媒体管理</h2>
    
    <!-- 标签页 -->
    <div class="tabs">
      <button 
        @click="activeTab = 'upload'" 
        :class="{ active: activeTab === 'upload' }"
      >
        上传文件
      </button>
      <button 
        @click="activeTab = 'stock'" 
        :class="{ active: activeTab === 'stock' }"
      >
        免费图库
      </button>
      <button 
        @click="activeTab = 'external'" 
        :class="{ active: activeTab === 'external' }"
      >
        外部链接
      </button>
      <button 
        @click="activeTab = 'manage'" 
        :class="{ active: activeTab === 'manage' }"
      >
        管理媒体
      </button>
    </div>

    <!-- 上传文件 -->
    <div v-if="activeTab === 'upload'" class="tab-content">
      <h3>上传本地文件</h3>
      <input 
        type="file" 
        @change="handleFileUpload" 
        multiple 
        accept="image/*,video/*"
      />
      <button @click="uploadFiles" :disabled="!selectedFiles.length">
        上传 ({{ selectedFiles.length }} 个文件)
      </button>
    </div>

    <!-- 免费图库 -->
    <div v-if="activeTab === 'stock'" class="tab-content">
      <h3>搜索免费图库</h3>
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          placeholder="输入搜索关键词..."
          @keyup.enter="searchStockPhotos"
        />
        <select v-model="stockSource">
          <option value="unsplash">Unsplash</option>
          <option value="pexels">Pexels</option>
          <option value="pixabay">Pixabay</option>
        </select>
        <button @click="searchStockPhotos">搜索</button>
      </div>
      
      <div class="stock-results">
        <div 
          v-for="photo in stockPhotos" 
          :key="photo.id" 
          class="stock-photo"
        >
          <img :src="photo.thumbnailUrl || photo.url" :alt="photo.description" />
          <div class="photo-info">
            <p>{{ photo.description }}</p>
            <small>作者: {{ photo.author }}</small>
            <button @click="addStockPhoto(photo)">添加到商品</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 外部链接 -->
    <div v-if="activeTab === 'external'" class="tab-content">
      <h3>添加外部媒体链接</h3>
      <input 
        v-model="externalUrl" 
        placeholder="输入图片或视频URL..."
      />
      <input 
        v-model="externalTitle" 
        placeholder="标题（可选）"
      />
      <input 
        v-model="externalAlt" 
        placeholder="替代文本（SEO优化）"
      />
      <button @click="addExternalMedia">添加外部媒体</button>
    </div>

    <!-- 管理媒体 -->
    <div v-if="activeTab === 'manage'" class="tab-content">
      <h3>当前商品媒体</h3>
      <div class="media-grid">
        <div 
          v-for="media in productMedia" 
          :key="media.id" 
          class="media-item"
          :class="{ primary: media.isPrimary }"
        >
          <img 
            v-if="media.mediaType === 'image'" 
            :src="media.mediaUrl" 
            :alt="media.alt"
          />
          <video 
            v-else 
            :src="media.mediaUrl" 
            controls
          />
          <div class="media-actions">
            <button @click="setAsPrimary(media)" v-if="!media.isPrimary">
              设为主图
            </button>
            <button @click="updateMedia(media)">编辑</button>
            <button @click="deleteMedia(media.id)" class="danger">删除</button>
          </div>
          <div class="media-info">
            <input 
              v-model="media.title" 
              placeholder="标题"
              @blur="updateMedia(media)"
            />
            <input 
              v-model="media.alt" 
              placeholder="替代文本"
              @blur="updateMedia(media)"
            />
            <small>来源: {{ media.source }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      正在处理...
    </div>

    <!-- 消息提示 -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductMediaManager',
  props: {
    productId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      activeTab: 'upload',
      selectedFiles: [],
      searchQuery: '',
      stockSource: 'unsplash',
      stockPhotos: [],
      externalUrl: '',
      externalTitle: '',
      externalAlt: '',
      productMedia: [],
      loading: false,
      message: '',
      messageType: 'info'
    }
  },
  mounted() {
    this.loadProductMedia()
  },
  methods: {
    // 加载商品媒体
    async loadProductMedia() {
      try {
        const response = await fetch(`/api/products/${this.productId}/media`)
        const data = await response.json()
        if (data.success) {
          this.productMedia = data.data
        }
      } catch (error) {
        this.showMessage('加载媒体失败', 'error')
      }
    },

    // 处理文件选择
    handleFileUpload(event) {
      this.selectedFiles = Array.from(event.target.files)
    },

    // 上传文件
    async uploadFiles() {
      if (!this.selectedFiles.length) return
      
      this.loading = true
      const formData = new FormData()
      
      this.selectedFiles.forEach(file => {
        formData.append('files', file)
      })
      
      try {
        const response = await fetch(`/api/products/${this.productId}/media/upload-multiple`, {
          method: 'POST',
          body: formData
        })
        const data = await response.json()
        
        if (data.success) {
          this.showMessage('文件上传成功', 'success')
          this.loadProductMedia()
          this.selectedFiles = []
        } else {
          this.showMessage(data.message, 'error')
        }
      } catch (error) {
        this.showMessage('上传失败', 'error')
      } finally {
        this.loading = false
      }
    },

    // 搜索免费图库
    async searchStockPhotos() {
      if (!this.searchQuery) return
      
      this.loading = true
      try {
        const response = await fetch(`/api/media/search-stock?query=${encodeURIComponent(this.searchQuery)}&source=${this.stockSource}`)
        const data = await response.json()
        
        if (data.success) {
          this.stockPhotos = data.data
        } else {
          this.showMessage(data.message, 'error')
        }
      } catch (error) {
        this.showMessage('搜索失败', 'error')
      } finally {
        this.loading = false
      }
    },

    // 添加图库图片
    async addStockPhoto(photo) {
      this.loading = true
      try {
        const response = await fetch(`/api/products/${this.productId}/media/from-stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: photo.url,
            thumbnailUrl: photo.thumbnailUrl,
            title: photo.description,
            alt: photo.description,
            author: photo.author,
            source: photo.source,
            license: photo.license,
            attribution: photo.attribution
          })
        })
        const data = await response.json()
        
        if (data.success) {
          this.showMessage('图片已添加', 'success')
          this.loadProductMedia()
        } else {
          this.showMessage(data.message, 'error')
        }
      } catch (error) {
        this.showMessage('添加失败', 'error')
      } finally {
        this.loading = false
      }
    },

    // 添加外部媒体
    async addExternalMedia() {
      if (!this.externalUrl) return
      
      this.loading = true
      try {
        const response = await fetch(`/api/products/${this.productId}/media/external`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: this.externalUrl,
            title: this.externalTitle,
            alt: this.externalAlt
          })
        })
        const data = await response.json()
        
        if (data.success) {
          this.showMessage('外部媒体已添加', 'success')
          this.loadProductMedia()
          this.externalUrl = ''
          this.externalTitle = ''
          this.externalAlt = ''
        } else {
          this.showMessage(data.message, 'error')
        }
      } catch (error) {
        this.showMessage('添加失败', 'error')
      } finally {
        this.loading = false
      }
    },

    // 设为主图
    async setAsPrimary(media) {
      this.loading = true
      try {
        const response = await fetch(`/api/media/${media.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPrimary: true })
        })
        const data = await response.json()
        
        if (data.success) {
          this.showMessage('已设为主图', 'success')
          this.loadProductMedia()
        } else {
          this.showMessage(data.message, 'error')
        }
      } catch (error) {
        this.showMessage('设置失败', 'error')
      } finally {
        this.loading = false
      }
    },

    // 更新媒体信息
    async updateMedia(media) {
      try {
        const response = await fetch(`/api/media/${media.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: media.title,
            alt: media.alt
          })
        })
        const data = await response.json()
        
        if (!data.success) {
          this.showMessage(data.message, 'error')
        }
      } catch (error) {
        this.showMessage('更新失败', 'error')
      }
    },

    // 删除媒体
    async deleteMedia(mediaId) {
      if (!confirm('确定要删除这个媒体吗？')) return
      
      this.loading = true
      try {
        const response = await fetch(`/api/media/${mediaId}`, {
          method: 'DELETE'
        })
        const data = await response.json()
        
        if (data.success) {
          this.showMessage('媒体已删除', 'success')
          this.loadProductMedia()
        } else {
          this.showMessage(data.message, 'error')
        }
      } catch (error) {
        this.showMessage('删除失败', 'error')
      } finally {
        this.loading = false
      }
    },

    // 显示消息
    showMessage(text, type = 'info') {
      this.message = text
      this.messageType = type
      setTimeout(() => {
        this.message = ''
      }, 3000)
    }
  }
}
</script>

<style scoped>
.product-media-manager {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.tabs button {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s;
}

.tabs button.active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

.tab-content {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-bar input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-bar select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.stock-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.stock-photo {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stock-photo img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.photo-info {
  padding: 10px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.media-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
}

.media-item.primary {
  border: 2px solid #409eff;
}

.media-item img,
.media-item video {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.media-actions {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #f5f5f5;
}

.media-actions button {
  flex: 1;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #409eff;
  color: white;
}

.media-actions button.danger {
  background: #f56c6c;
}

.media-info {
  padding: 10px;
}

.media-info input {
  width: 100%;
  padding: 5px;
  margin-bottom: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background: rgba(0,0,0,0.8);
  color: white;
  border-radius: 8px;
  z-index: 1000;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  z-index: 1000;
  animation: slideIn 0.3s;
}

.message.info {
  background: #909399;
  color: white;
}

.message.success {
  background: #67c23a;
  color: white;
}

.message.error {
  background: #f56c6c;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>