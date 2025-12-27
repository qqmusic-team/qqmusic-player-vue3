<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>个人中心</h1>
      <p class="subtitle">管理您的个人信息和设置</p>
    </div>

    <div class="profile-content">
      <div v-if="isLoading" class="loading-placeholder">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else class="profile-info">
        <div class="user-avatar">
          <svg
            t="1766749986779"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="5607"
            width="100"
            height="100"
          >
            <path
              d="M725.333333 721.066667l-38.4-38.4H379.733333l-38.4 38.4V768h384v-46.933333z m85.333334-38.4v170.666666H256v-170.666666h4.266667l85.333333-85.333334h375.466667l89.6 85.333334z m-85.333334-320c0 106.666667-85.333333 192-192 192S341.333333 469.333333 341.333333 362.666667 426.666667 170.666667 533.333333 170.666667 725.333333 256 725.333333 362.666667z m-85.333333 0C640 302.933333 593.066667 256 533.333333 256S426.666667 302.933333 426.666667 362.666667s46.933333 106.666667 106.666666 106.666666S640 422.4 640 362.666667z"
              fill="#1890ff"
              p-id="5608"
            ></path>
          </svg>
        </div>

        <div class="user-info">
          <h2>欢迎访问个人中心</h2>
          <p>此页面由其他开发人员负责实现具体功能</p>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isLoading = ref(true);

// 模拟加载数据
const fetchUserData = async () => {
  try {
    // 模拟网络请求延迟
    await new Promise((resolve) => setTimeout(resolve, 800));
    // 在实际应用中，这里会从API获取用户数据
  } catch (error) {
    console.error("获取用户数据失败:", error);
  } finally {
    isLoading.value = false;
  }
};

// 返回首页
const navigateBack = () => {
  router.push({ name: "home" });
};

onMounted(() => {
  console.log("个人中心页面已挂载");
  fetchUserData();
});

onUnmounted(() => {
  console.log("个人中心页面已卸载");
});
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
  padding-top: 60px;
}

.profile-header h1 {
  font-size: 32px;
  margin-bottom: 12px;
  color: #333;
}

.subtitle {
  font-size: 16px;
  color: #666;
}

.profile-content {
  max-width: 600px;
  margin: 0 auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 40px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.user-avatar {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.user-info {
  text-align: center;
}

.user-info h2 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
}

.user-info p {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.back-button {
  padding: 8px 24px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #40a9ff;
}

.back-button:active {
  background-color: #096dd9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }

  .profile-header {
    padding-top: 40px;
    margin-bottom: 30px;
  }

  .profile-header h1 {
    font-size: 28px;
  }

  .profile-content {
    padding: 30px 20px;
    margin: 0 10px;
  }

  .user-info h2 {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .profile-header h1 {
    font-size: 24px;
  }

  .profile-content {
    padding: 20px 16px;
  }

  .user-info h2 {
    font-size: 18px;
  }

  .user-info p {
    font-size: 14px;
  }
}
</style>
