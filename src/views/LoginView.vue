<template>
  <div class="login-container" v-if="userStore.showLogin">
    <div class="login-overlay" @click="closeLogin"></div>
    <div class="login-box">
      <div class="login-header">
        <h2>登录账号</h2>
        <button class="close-btn" @click="closeLogin">&times;</button>
      </div>
      <div class="login-content">
        <!-- 登录方式选项卡 -->
        <div class="login-tabs">
          <!-- <button
            class="tab-btn"
            :class="{ active: loginType === 'phone' }"
            @click="loginType = 'phone'"
          >
            手机号登录
          </button> -->
          <button
            class="tab-btn"
            :class="{ active: loginType === 'cookie' }"
            @click="loginType = 'cookie'"
          >
            Cookie登录
          </button>
        </div>

        <!-- 手机号登录表单 -->
        <form @submit.prevent="handleLogin" v-if="loginType === 'phone'">
          <!-- <div class="form-group">
            <label for="phone">手机号</label>
            <input
              type="text"
              id="phone"
              v-model="phone"
              placeholder="请输入手机号"
              required
              maxlength="11"
            >
          </div> -->
          <!-- <div class="form-group">
            <label for="password">密码</label>
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="请输入密码"
              required
            >
          </div> -->
          <div class="form-group">
            <button type="submit" class="login-btn" :disabled="isLoading">
              {{ isLoading ? '登录中...' : '登录' }}
            </button>
          </div>
        </form>

        <!-- Cookie登录表单 -->
        <form @submit.prevent="handleCookieLogin" v-else>
          <div class="form-group">
            <label for="cookie">Cookie</label>
            <textarea
              id="cookie"
              v-model="cookie"
              placeholder="请输入Cookie字符串"
              required
              rows="5"
            ></textarea>
            <div class="form-hint">获取方式：登录网易云音乐后，在浏览器开发者工具中获取Cookie</div>
          </div>
          <div class="form-group">
            <button type="submit" class="login-btn" :disabled="isLoading">
              {{ isLoading ? '登录中...' : '使用Cookie登录' }}
            </button>
          </div>
        </form>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { setCookie } from '@/utils/http';

const userStore = useUserStore();
const router = useRouter();

const loginType = ref('phone'); // 'phone' 或 'cookie'
const phone = ref('');
const password = ref('');
const cookie = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const closeLogin = () => {
  userStore.showLogin = false;
  resetForm();
};

const resetForm = () => {
  loginType.value = 'phone';
  phone.value = '';
  password.value = '';
  cookie.value = '';
  errorMessage.value = '';
};

const handleLogin = async () => {
  if (!phone.value || !password.value) {
    errorMessage.value = '请输入手机号和密码';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await userStore.login(phone.value, password.value);
    if (userStore.isLogin) {
      resetForm();
      await router.push({ name: 'profile' });
    } else {
      errorMessage.value = '登录失败，请检查账号密码';
    }
  } catch (error) {
    console.error('登录错误:', error);
    errorMessage.value = '登录失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

const handleCookieLogin = async () => {
  if (!cookie.value.trim()) {
    errorMessage.value = '请输入Cookie字符串';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // 使用Cookie登录
    setCookie(cookie.value);
    await userStore.checkLogin();

    if (userStore.isLogin) {
      resetForm();
      await router.push({ name: 'profile' });
    } else {
      errorMessage.value = 'Cookie登录失败，请检查Cookie是否有效';
    }
  } catch (error) {
    console.error('Cookie登录错误:', error);
    errorMessage.value = 'Cookie登录失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.login-box {
  position: relative;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.login-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.login-content {
  padding: 24px;
}

/* 登录选项卡样式 */
.login-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: #1890ff;
}

.tab-btn.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.form-group {
  margin-bottom: 20px;
}

/* Textarea样式 */
textarea {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
}

textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 表单提示信息 */
.form-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.form-group input {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.login-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.login-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #fff2f0;
  color: #ff4d4f;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

@media (max-width: 480px) {
  .login-box {
    width: 95%;
    margin: 20px;
  }

  .login-header,
  .login-content {
    padding: 16px;
  }
}
</style>
