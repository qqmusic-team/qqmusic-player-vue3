<template>
  <el-dialog
    v-model="dialogVisible"
    title="网络请求失败"
    width="500px"
    :before-close="handleClose"
    :show-close="false"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    center
    align-center
  >
    <div class="error-content">
      <div class="error-icon-wrapper">
        <el-icon class="error-icon" :size="80" color="#1abc9c">
          <WarningFilled />
        </el-icon>
      </div>

      <div class="error-message">
        <p class="error-main-text">{{ errorMessage || "请求失败，请稍后重试" }}</p>

        <el-alert type="info" :closable="false" show-icon class="login-hint">
          <template #title> 需要登录的解决方法请看"301需要登录解决方法.md" </template>
        </el-alert>

        <div v-if="errorDetails" class="error-details-wrapper">
          <div class="error-details">
            <el-descriptions :column="1" border size="small" direction="vertical">
              <el-descriptions-item v-for="(value, key) in errorDetails" :key="key" :label="key">
                <code class="error-detail-value">{{ formatErrorValue(value) }}</code>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleRetry" :loading="retrying" :disabled="retrying">
          {{ retrying ? "重试中..." : "重试" }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { WarningFilled } from "@element-plus/icons-vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: "",
  },
  errorDetails: {
    type: Object,
    default: null,
  },
  statusCode: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["close", "retry"]);

const retrying = ref(false);

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) {
      handleClose();
    }
  },
});

const formatErrorValue = (value) => {
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const handleClose = () => {
  emit("close");
};

const handleRetry = async () => {
  if (retrying.value) return;

  retrying.value = true;
  try {
    await emit("retry");
  } finally {
    setTimeout(() => {
      retrying.value = false;
    }, 500);
  }
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
);
</script>

<style scoped>
.error-content {
  text-align: center;
  padding: 20px 0;
}

.error-icon-wrapper {
  margin-bottom: 20px;
}

.error-icon {
  display: inline-block;
}

.error-message {
  text-align: center;
}

.error-main-text {
  margin: 0 0 15px;
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

.login-hint {
  margin-bottom: 15px;
  text-align: left;
}

.error-details-wrapper {
  margin-top: 15px;
  text-align: left;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.error-details-wrapper::-webkit-scrollbar {
  width: 6px;
}

.error-details-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.error-details-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.error-details-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.error-details {
  padding: 0;
}

.error-detail-value {
  font-family: "Courier New", monospace;
  font-size: 12px;
  word-break: break-all;
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  max-width: 100%;
  overflow-x: auto;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

@media (max-width: 768px) {
  .dialog-footer {
    flex-direction: column;
  }

  .dialog-footer .el-button {
    width: 100%;
  }
}
</style>
