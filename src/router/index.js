import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/localMusic",
      name: "localMusic",
      component: () => import("../views/LocalMusicView.vue"),
    },
    {
      path: "/recommend",
      name: "recommend",
      component: () => import("../views/RecommendView.vue"),
    },
    {
      path: "/musicHall",
      name: "musicHall",
      component: () => import("../views/MusicHallView.vue"),
      children: [
        {
          path: "",
          name: "musicHallDefault",
          component: () => import("../components/musichallview/Picked.vue"),
        },
        {
          path: "picked",
          name: "musicHallPicked",
          component: () => import("../components/musichallview/Picked.vue"),
        },
        {
          path: "topList",
          name: "musicHallTopList",
          component: () => import("../components/musichallview/TopList.vue"),
        },
        {
          path: "artist",
          name: "musicHallArtist",
          component: () => import("../components/musichallview/Artist.vue"),
        },
        {
          path: "category",
          name: "musicHallCategory",
          component: () => import("../components/musichallview/Category.vue"),
        },
        {
          path: "radio",
          name: "musicHallRadio",
          component: () => import("../components/musichallview/Radio.vue"),
        },
        {
          path: "digitalAlbum",
          name: "musicHallDigitalAlbum",
          component: () => import("../components/musichallview/DigitalAlbum.vue"),
        },
      ],
    },

    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/playlist/:id",
      name: "playlistDetail",
      component: () => import("../views/PlaylistDetailView.vue"),
    },
  ],
});

// 全局路由守卫 - 处理权限验证
router.beforeEach((to, from, next) => {
  // 检查是否需要权限
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // 这里可以添加实际的权限检查逻辑，比如检查用户是否登录
    // 暂时模拟已登录状态，允许访问
    const isLoggedIn = true; // 实际应用中应该从store或localStorage获取

    if (isLoggedIn) {
      next();
    } else {
      // 可以跳转到登录页，或者显示登录弹窗
      // 暂时继续允许访问个人中心页面，因为具体实现由其他开发人员负责
      next();
      // 或者添加提示信息
      console.log("需要登录才能访问个人中心");
    }
  } else {
    next();
  }
});

export default router;
