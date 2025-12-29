<template>
  <div class="search-bar">
    <div class="search-container">
      <el-icon class="search-icon" :size="18">
        <svg
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
        >
          <path
            d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6c3.2 3.2 8.4 3.2 11.6 0l43.6-43.5c3.2-3.3 3.2-8.5 0-11.7zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116 65.6-158.4C296 211.3 352.2 188 412 188s116 23.3 158.4 65.6C612.7 296 636 352.2 636 412s-23.3 116-65.6 158.4z"
            fill="#999"
          ></path>
        </svg>
      </el-icon>
      <el-input
        v-model="searchText"
        placeholder="搜索歌曲、歌手、专辑"
        class="search-input"
        clearable
        @input="handleInput"
        @change="handleSearch"
        @keyup.enter="handleSearch"
        @clear="handleClear"
      ></el-input>
    </div>
    <div class="search-options">
      <el-select
        v-model="searchType"
        size="small"
        @change="handleSearch"
        placeholder="搜索类型"
        class="search-type-select"
      >
        <el-option label="全部" value="all"></el-option>
        <el-option label="歌曲" value="song"></el-option>
        <el-option label="歌手" value="artist"></el-option>
        <el-option label="专辑" value="album"></el-option>
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "all",
  },
});

const emit = defineEmits(["update:modelValue", "search", "clear", "change-type"]);

const searchText = ref(props.modelValue);
const searchType = ref(props.type);

// 监听外部传入的值变化
watch(
  () => props.modelValue,
  (newValue) => {
    searchText.value = newValue;
  }
);

watch(
  () => props.type,
  (newType) => {
    searchType.value = newType;
  }
);

// 输入时更新 v-model
const handleInput = () => {
  emit("update:modelValue", searchText.value);
};

// 执行搜索
const handleSearch = () => {
  emit("search", {
    text: searchText.value,
    type: searchType.value,
  });
  emit("change-type", searchType.value);
};

// 清空搜索
const handleClear = () => {
  searchText.value = "";
  emit("clear");
  emit("update:modelValue", "");
};
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.search-input {
  padding-left: 38px;
  width: 100%;
}

.search-input .el-input__inner {
  border-radius: 20px;
  height: 40px;
}

.search-options {
  display: flex;
  align-items: center;
}

.search-type-select {
  min-width: 120px;
}

.search-type-select .el-input__inner {
  border-radius: 20px;
  height: 40px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: none;
  }

  .search-options {
    justify-content: flex-end;
    margin-top: 10px;
  }
}
</style>
