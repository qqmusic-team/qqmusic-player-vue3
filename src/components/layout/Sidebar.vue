<template>
  <aside class="sidebar">
    <div class="logo">在线音乐</div>
    <nav>
      <div
        class="item"
        :class="{ active: activeItem === '推荐' }"
        @click="navigateTo('recommend', '推荐')"
      >
        <svg t="1766748799560" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1623" width="200" height="200"><path d="M512 224c75.296 0 143.808 28.896 195.136 76.16 80.224-17.92 138.88-11.168 163.2 30.912 25.472 44.16-4.544 107.136-70.4 173.6L800 512a288 288 0 0 1-438.848 245.376c-89.6 23.264-158.336 17.536-183.648-26.304-24.064-41.664-1.28-95.456 53.568-155.456A288 288 0 0 1 512 224z m217.28 342.72l-5.152 4.032-16.512 12.416c-5.632 4.16-11.36 8.288-17.184 12.384l-17.76 12.288a1240 1240 0 0 1-56.768 36.16l-19.968 11.776-20.16 11.424a1240 1240 0 0 1-59.744 31.072l-19.52 9.28c-6.496 2.976-12.928 5.856-19.296 8.64l-19.04 8.096-7.744 3.136a224.096 224.096 0 0 0 278.848-160.672zM256.48 645.088c-20.256 27.104-27.712 46.848-23.584 54.016 4.224 7.296 27.36 11.04 65.088 5.76a289.856 289.856 0 0 1-41.504-59.776zM512 288a224 224 0 0 0-139.648 399.136c58.112-18.304 124.928-48.32 191.584-86.784 65.984-38.08 124.864-80.48 169.664-121.312A224.096 224.096 0 0 0 512 288z m246.496 68.256l-3.904 0.448a286.72 286.72 0 0 1 31.616 67.008c24.32-30.752 32.96-53.248 28.704-60.64-3.968-6.848-24-10.432-56.416-6.816z" fill="#000000" p-id="1624"></path></svg>推荐
      </div>

      <div
        class="item"
        :class="{ active: activeItem === '音乐馆' }"
        @click="navigateTo('musicHall', '音乐馆')"
      >
        <svg t="1766748870757" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1779" width="200" height="200"><path d="M863.04 252.224l0.704 6.752 0.256 6.816V672a128 128 0 1 1-63.968-110.848L800 388.896l-384 54.848V736a128 128 0 0 1-121.6 127.84L288 864a128 128 0 1 1 64.032-238.848L352 311.52a96 96 0 0 1 76.8-94.08l5.632-0.96 320-45.728a96 96 0 0 1 108.608 81.472zM288 672a64 64 0 1 0 0 128 64 64 0 0 0 0-128z m448-64a64 64 0 1 0 0 128 64 64 0 0 0 0-128z m31.2-374.208l-3.712 0.32-320 45.728a32 32 0 0 0-27.296 28.032L416 311.52v67.584l384-54.848V265.792a32 32 0 0 0-32.8-32z" fill="#000000" p-id="1780"></path></svg>音乐馆
      </div>
      <div
        class="item"
        :class="{ active: activeItem === '精选评论' }"
        @click="navigateTo('comments', '精选评论')"
      >
        <svg t="1766749144316" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1311" width="200" height="200"><path d="M512 160c194.4 0 352 157.6 352 352s-157.6 352-352 352c-43.392 0-85.696-7.872-125.344-22.976l-12.288-4.992-83.488 23.84a96 96 0 0 1-116.96-60.544l-1.728-5.376a96 96 0 0 1 2.432-60.096l23.456-62.56-3.904-7.808a350.368 350.368 0 0 1-33.952-139.264L160 512C160 317.6 317.6 160 512 160z m0 64a288 288 0 0 0-288 288c0 50.24 12.864 98.56 36.992 141.312l7.36 12.992-33.792 90.048a32 32 0 0 0 38.752 41.984l106.176-30.272 10.816 5.056c37.76 17.6 79.04 26.88 121.696 26.88a288 288 0 0 0 0-576z m-52.384 356.8c11.936 16.96 31.264 27.2 52.384 27.2a63.68 63.68 0 0 0 51.68-26.24 32 32 0 1 1 51.616 37.824A127.68 127.68 0 0 1 512 672a127.872 127.872 0 0 1-104.704-54.336 32 32 0 1 1 52.32-36.864z" fill="#000000" p-id="1312"></path></svg>精选评论
      </div>
    </nav>
    <div class="logo" id="myMusic">我的音乐</div>
    <nav>
      <div
        class="item"
        :class="{ active: activeItem === '我喜欢' }"
        @click="navigateTo('favorites', '我喜欢')"
      >
        <svg t="1766749246585" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1621" width="200" height="200"><path d="M832 736a96 96 0 0 1-192 0v-96a96 96 0 0 1 128-90.528V480a256 256 0 0 0-511.872-8L256 480v69.44A96 96 0 0 1 384 640v96a96 96 0 0 1-192 0v-256C192 303.264 335.264 160 512 160c173.76 0 315.136 138.464 319.872 311.04L832 480zM288 608a32 32 0 0 0-32 32v96a32 32 0 0 0 64 0v-96a32 32 0 0 0-32-32z m448 0a32 32 0 0 0-32 32v96a32 32 0 0 0 64 0v-96a32 32 0 0 0-32-32z" fill="#000000" p-id="1622"></path></svg>我喜欢
      </div>
      <div
        class="item"
        :class="{ active: activeItem === '本地歌曲' }"
        @click="navigateTo('localMusic', '本地歌曲')"
      >
        <svg t="1766749302602" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1777" width="200" height="200"><path d="M512 160a32 32 0 0 1 0 64 288 288 0 1 0 288 288 286.496 286.496 0 0 0-38.144-143.328 32 32 0 0 1 55.488-31.904A350.496 350.496 0 0 1 864 512c0 194.4-157.6 352-352 352S160 706.4 160 512 317.6 160 512 160z m160 0a96 96 0 0 1 96 96 32 32 0 0 1-63.776 3.744L704 256a32 32 0 0 0-63.776-3.744L640 256v256a128 128 0 1 1-63.968-110.848L576 256a96 96 0 0 1 96-96z m-160 288a64 64 0 1 0 0 128 64 64 0 0 0 0-128z" fill="#000000" p-id="1778"></path></svg>本地歌曲
      </div>
      <div
        class="item"
        :class="{ active: activeItem === '下载歌曲' }"
        @click="navigateTo('downloads', '下载歌曲')"
      >
        <svg t="1766748922774" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1933" width="200" height="200"><path d="M768 768a32 32 0 0 1 0 64H256a32 32 0 0 1 0-64h512zM512 192a32 32 0 0 1 32 32v345.504l128.64-128.608a32 32 0 0 1 42.496-2.496l2.784 2.496a32 32 0 0 1 2.496 42.464l-2.496 2.784-181.024 181.024a32 32 0 0 1-42.464 2.496l-2.784-2.496-181.024-181.024a32 32 0 0 1 42.464-47.744l2.784 2.496L480 565.024V224a32 32 0 0 1 32-32z" fill="#000000" p-id="1934"></path></svg>下载歌曲
      </div>
       <div
        class="item"
        :class="{ active: activeItem === '最近播放' }"
        @click="navigateTo('recentPlay', '最近播放')"
      >
        <svg t="1766749199681" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1467" width="200" height="200"><path d="M736 352a32 32 0 0 1 31.264 25.088c4.384 18.816 9.792 32.256 15.232 39.712l2.336 3.008c0.8 0.896 1.088 1.024 1.28 1.024 46.624 0 65.76 39.68 65.088 101.024a32 32 0 0 1-64-0.704c0.192-16.32-1.344-28.16-3.776-34.944l-0.608-1.504-1.92-0.032a65.088 65.088 0 0 1-12.896-2.24V736c0 57.824-66.816 96-144 96S480 793.824 480 736s66.816-96 144-96c29.184 0 56.864 5.44 80.032 15.36L704 384.704c0-1.408 0.032-2.816 0.192-4.224L704 384a32 32 0 0 1 32-32zM416 704a32 32 0 0 1 0 64H224a32 32 0 0 1 0-64h192z m208 0c-46.528 0-80 19.136-80 32s33.472 32 80 32 80-19.136 80-32-33.472-32-80-32zM544 448a32 32 0 0 1 0 64H224a32 32 0 0 1 0-64h320z m256-256a32 32 0 0 1 0 64H224a32 32 0 1 1 0-64h576z" fill="#000000" p-id="1468"></path></svg>最近播放
      </div>
    </nav>
  </aside>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  name: "AppSidebar",
  setup() {
    const router = useRouter();
    return {
      router,
    };
  },
  data() {
    return {
      activeItem: "推荐", // 默认激活第一个选项
    };
  },
  methods: {
    navigateTo(path, itemText) {
      this.activeItem = itemText;
      this.router.push(`/${path}`);
    },
    updateActiveItem() {
      const currentPath = this.$route.path;
      const pathMap = {
        "/recommend": "推荐",
        "/musicHall": "音乐馆",
        "/comments": "精选评论",
        "/favorites": "我喜欢",
        "/localMusic": "本地歌曲",
        "/downloads": "下载歌曲",
        "/recentPlay": "最近播放",
      };
      if (pathMap[currentPath]) {
        this.activeItem = pathMap[currentPath];
      }
    },
  },
  mounted() {
    // 初始化时根据当前路由设置激活状态
    this.updateActiveItem();

    // 监听路由变化
    this.$router.afterEach(() => {
      this.updateActiveItem();
    });
  },
  beforeUnmount() {
    // 清理监听器
    this.$router.afterHooks = [];
  },
};
</script>

<style scoped>
.icon {
  width: 25px;
  height: 25px;
  margin-bottom: 4px;
  vertical-align: middle;

}
#myMusic {
  margin-top: 20px;
}
.sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #eee;
  padding: 16px;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.title {
  font-size: 12px;
  color: #999;
  margin: 12px 0;
}

.item {
  height: 36px;
  line-height: 36px;
  padding: 0 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.item:hover {
  background: #f2f2f2;
}

.item.active {
  background: #e5f7f1;
  color: #1abc9c;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(26, 188, 156, 0.15);
}

.item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: #1abc9c;
  border-radius: 0 4px 4px 0;
}
</style>


















