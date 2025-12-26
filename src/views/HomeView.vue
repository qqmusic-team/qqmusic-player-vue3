<script setup>
import { ElContainer, ElAside, ElHeader, ElMain, ElFooter } from "element-plus";
import { Location, Menu as IconMenu, Document, Setting } from "@element-plus/icons-vue";

// 添加缺失的方法定义
const handleOpen = (key, keyPath) => {
  console.log(key, keyPath);
};

const handleClose = (key, keyPath) => {
  console.log(key, keyPath);
};
</script>

<template>
  <div class="common-layout">
    <!-- 使用flex布局的容器 -->
    <el-container class="flex-container">
      <!-- 侧边栏 - 固定宽度，不压缩 -->
      <el-aside width="200px" class="sidebar-container">
        <!-- 侧边栏内容容器 - 使用弹性布局 -->
        <div class="sidebar-content">
          <!-- 弹性布局的菜单容器 -->
          <div class="menu-wrapper">
            <el-menu
              default-active="2"
              class="el-menu-vertical-demo"
              @open="handleOpen"
              @close="handleClose"
            >
              <el-sub-menu index="1">
                <template #title>
                  <!-- 标题区域使用flex布局确保图标和文本正确对齐 -->
                  <div class="menu-title-item">
                    <el-icon class="menu-icon"><Location /></el-icon>
                    <span class="menu-text">Navigator One</span>
                  </div>
                </template>
                <el-menu-item-group title="Group One">
                  <el-menu-item index="1-1">
                    <span class="menu-text">item one</span>
                  </el-menu-item>
                  <el-menu-item index="1-2">
                    <span class="menu-text">item two</span>
                  </el-menu-item>
                </el-menu-item-group>
                <el-menu-item-group title="Group Two">
                  <el-menu-item index="1-3">
                    <span class="menu-text">item three</span>
                  </el-menu-item>
                </el-menu-item-group>
                <el-sub-menu index="1-4">
                  <template #title>
                    <span class="menu-text">item four</span>
                  </template>
                  <el-menu-item index="1-4-1">
                    <span class="menu-text">item one</span>
                  </el-menu-item>
                </el-sub-menu>
              </el-sub-menu>
              <el-menu-item index="2">
                <!-- 菜单项使用flex布局确保图标和文本正确对齐 -->
                <div class="menu-title-item">
                  <el-icon class="menu-icon"><IconMenu /></el-icon>
                  <span class="menu-text">Navigator Two</span>
                </div>
              </el-menu-item>
              <el-menu-item index="3" disabled>
                <!-- 菜单项使用flex布局确保图标和文本正确对齐 -->
                <div class="menu-title-item">
                  <el-icon class="menu-icon"><Document /></el-icon>
                  <span class="menu-text">Navigator Three</span>
                </div>
              </el-menu-item>
              <el-menu-item index="4">
                <!-- 菜单项使用flex布局确保图标和文本正确对齐 -->
                <div class="menu-title-item">
                  <el-icon class="menu-icon"><Setting /></el-icon>
                  <span class="menu-text">Navigator Four</span>
                </div>
              </el-menu-item>
            </el-menu>
          </div>
        </div>
      </el-aside>
      <!-- 主内容区域 - 自动伸缩 -->
      <el-container class="main-container">
        <el-header>Header</el-header>
        <el-main>Main</el-main>
        <el-footer>Footer</el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
/* 使用CSS变量统一管理响应式值 */
:root {
  /* 侧边栏宽度 */
  --sidebar-width-desktop: 200px;
  --sidebar-width-tablet: 180px;
  --sidebar-width-mobile: 160px;
  --sidebar-width-small: 140px;

  /* 文本大小 */
  --text-size-desktop: 15px;
  --text-size-tablet: 14px;
  --text-size-mobile: 13px;
  --text-size-small: 12px;

  /* 行高 */
  --line-height-desktop: 36px;
  --line-height-tablet: 32px;
  --line-height-mobile: 30px;
  --line-height-small: 28px;

  /* 图标与文本间距 */
  --icon-margin-desktop: 8px;
  --icon-margin-tablet: 6px;
  --icon-margin-mobile: 4px;
  --icon-margin-small: 3px;
}

/* 弹性容器布局 - 确保整体布局稳定 */
.flex-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
}

/* 主内容区域 - 自动伸缩以填充剩余空间 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 允许内容区域在需要时收缩 */
}

/* 侧边栏容器样式，确保正确高度和溢出处理 */
.sidebar-container {
  height: 100%;
  /* 使用CSS变量定义宽度 */
  width: var(--sidebar-width-desktop);
  min-width: var(--sidebar-width-desktop);
  max-width: var(--sidebar-width-desktop);

  /* 使用flex布局确保内容正常显示 */
  display: flex;
  flex-direction: column;
  /* 移除滚动条但保持内容可滚动 */
  overflow-y: auto;
  overflow-x: hidden; /* 禁止水平滚动 */
  background-color: #fff;

  /* 隐藏滚动条 - WebKit 浏览器 (Chrome, Safari, Edge) */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  /* 增强侧边栏边框样式 */
  border-right: 2px solid #e0e0e0; /* 增加边框宽度，使用柔和的灰色 */
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.05); /* 添加轻微阴影增强立体感 */

  /* 确保侧边栏不压缩 */
  flex-shrink: 0;
}

/* 隐藏滚动条 - WebKit 浏览器 */
.sidebar-container::-webkit-scrollbar {
  display: none;
}

/* 侧边栏内容样式，确保充分利用空间 */
.sidebar-content {
  height: 100%;
  padding: 10px;
  /* 使用flex布局确保子元素正确排列 */
  display: flex;
  flex-direction: column;
}

/* 菜单包装器 - 确保菜单稳定显示 */
.menu-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* 确保菜单不会被压缩 */
  min-width: 0;
}

/* 确保菜单在侧边栏中完整显示 */
.el-menu-vertical-demo {
  height: auto;
  min-height: 100%;
  /* 移除Element Plus默认边框，使用自定义边框 */
  border-right: none;
  /* 确保菜单不会压缩 */
  flex-shrink: 0;
}

/* 菜单标题项 - 使用flex布局确保图标和文本对齐 */
.menu-title-item {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}

/* 菜单图标样式 */
.menu-icon {
  flex-shrink: 0; /* 确保图标不会被压缩 */
  margin-right: var(--icon-margin-desktop);
  position: relative;
  left: 0;
  /* 固定图标宽度，确保所有图标对齐一致 */
  width: 18px;
  text-align: center;
}

/* 菜单文本样式 - 确保文本不会溢出 */
.menu-text {
  flex: 1; /* 允许文本占用剩余空间 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  left: 0;
  display: inline-block;
}

/* 优化侧边栏文本样式 - 提高清晰度 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title),
:deep(.el-menu-item-group__title) {
  /* 使用CSS变量控制字体大小 */
  font-size: var(--text-size-desktop);

  /* 使用CSS变量控制行高 */
  line-height: var(--line-height-desktop);

  /* 增强颜色对比度 */
  color: #303133;

  /* 增加悬停效果 */
  transition: all 0.3s ease;

  /* 确保菜单项内容使用flex布局 */
  display: flex;
  align-items: center;

  /* 确保文本在菜单项中正确定位 */
  position: relative;
  z-index: 1;

  /* 确保不会出现水平滚动条 */
  overflow-x: hidden;
}

/* 增强子菜单标题样式 */
:deep(.el-sub-menu__title) {
  font-weight: 500;
  /* 确保子菜单标题不会被压缩 */
  flex-shrink: 0;
}

/* 增强分组标题样式 */
:deep(.el-menu-item-group__title) {
  font-size: calc(var(--text-size-desktop) - 1px);
  color: #909399;
  padding: 8px 0 8px 20px;
  display: block;
}

/* 增强菜单项悬停效果 */
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  color: #409eff;
  background-color: #ecf5ff;
}

/* 激活状态样式增强 */
:deep(.el-menu-item.is-active) {
  color: #409eff;
  font-weight: 500;
  /* 添加激活状态下的左侧边框指示器 */
  border-left: 3px solid #409eff;
}

/* 确保禁用状态有足够对比度 */
:deep(.el-menu-item.is-disabled) {
  color: #c0c4cc;
}

/* 标题样式优化 */
h5.mb-2 {
  font-size: calc(var(--text-size-desktop) + 1px);
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0; /* 为标题添加下划线 */

  /* 确保标题文本完整显示 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 子菜单激活状态增强 */
:deep(.el-sub-menu.is-active) {
  :deep(.el-sub-menu__title) {
    color: #409eff;
    font-weight: 500;
  }
}

/* 响应式样式 - 平板设备 */
@media screen and (max-width: 1023px) and (min-width: 768px) {
  /* 调整侧边栏宽度 */
  .sidebar-container {
    width: var(--sidebar-width-tablet);
    min-width: var(--sidebar-width-tablet);
    max-width: var(--sidebar-width-tablet);
    border-right-width: 1.5px;
    box-shadow: 1px 0 4px rgba(0, 0, 0, 0.04);
  }

  /* 调整激活状态的左侧边框指示器 */
  :deep(.el-menu-item.is-active) {
    border-left-width: 2px;
  }

  /* 调整文本大小和行高 */
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    font-size: var(--text-size-tablet);
    line-height: var(--line-height-tablet);
  }

  /* 调整图标大小和间距 */
  .menu-icon {
    margin-right: var(--icon-margin-tablet);
    font-size: calc(var(--text-size-tablet) - 1px);
    width: 16px;
  }

  /* 调整分组标题 */
  :deep(.el-menu-item-group__title) {
    font-size: calc(var(--text-size-tablet) - 1px);
    padding-left: 18px;
  }

  /* 调整主标题 */
  h5.mb-2 {
    font-size: var(--text-size-tablet);
    margin-bottom: 14px;
  }
}

/* 响应式样式 - 移动设备 */
@media screen and (max-width: 767px) and (min-width: 481px) {
  /* 调整侧边栏宽度 */
  .sidebar-container {
    width: var(--sidebar-width-mobile);
    min-width: var(--sidebar-width-mobile);
    max-width: var(--sidebar-width-mobile);
    border-right-width: 1px;
    box-shadow: 1px 0 2px rgba(0, 0, 0, 0.03);
  }

  /* 调整文本大小和行高 */
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    font-size: var(--text-size-mobile);
    line-height: var(--line-height-mobile);
  }

  /* 调整图标大小和间距 */
  .menu-icon {
    margin-right: var(--icon-margin-mobile);
    font-size: var(--text-size-mobile);
    width: 14px;
  }

  /* 减少子菜单项的缩进 */
  :deep(.el-sub-menu__title) {
    padding-left: 16px !important;
  }
  :deep(.el-menu-item) {
    padding-left: 36px !important;
  }

  /* 调整分组标题 */
  :deep(.el-menu-item-group__title) {
    font-size: calc(var(--text-size-mobile) - 1px);
    padding-left: 16px;
  }

  /* 调整主标题 */
  h5.mb-2 {
    font-size: calc(var(--text-size-mobile) + 1px);
    margin-bottom: 12px;
  }
}

/* 响应式样式 - 极端小屏幕 */
@media screen and (max-width: 480px) {
  /* 调整侧边栏宽度 */
  .sidebar-container {
    width: var(--sidebar-width-small);
    min-width: var(--sidebar-width-small);
    max-width: var(--sidebar-width-small);
    border-right-width: 1px;
    box-shadow: none;
  }

  /* 调整文本大小和行高 */
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    font-size: var(--text-size-small);
    line-height: var(--line-height-small);
  }

  /* 调整图标大小和间距 */
  .menu-icon {
    margin-right: var(--icon-margin-small);
    font-size: calc(var(--text-size-small) - 1px);
    width: 12px;
  }

  /* 进一步减少缩进 */
  :deep(.el-sub-menu__title) {
    padding-left: 12px !important;
  }
  :deep(.el-menu-item) {
    padding-left: 28px !important;
  }

  /* 调整分组标题 */
  :deep(.el-menu-item-group__title) {
    font-size: calc(var(--text-size-small) - 1px);
    padding-left: 12px;
  }

  /* 调整主标题 */
  h5.mb-2 {
    font-size: var(--text-size-small);
    margin-bottom: 10px;
    padding-bottom: 6px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .sidebar-container {
    background-color: #1a1a1a;
    border-right-color: #333;
    box-shadow: 2px 0 6px rgba(0, 0, 0, 0.3);
  }

  h5.mb-2 {
    color: #e0e0e0;
    border-bottom-color: #333;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    color: #e0e0e0;
  }

  :deep(.el-menu-item:hover),
  :deep(.el-sub-menu__title:hover) {
    background-color: rgba(64, 158, 255, 0.1);
  }

  :deep(.el-menu-item.is-disabled) {
    color: #666;
  }
}
</style>
