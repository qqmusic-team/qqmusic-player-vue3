import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  routes: [
    // 普通页面 - HomeView 通过动态组件加载
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/recommend",
      name: "recommend",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/localMusic",
      name: "localMusic",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/favorites",
      name: "favorites",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/comments",
      name: "comments",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/downloads",
      name: "downloads",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/recentPlay",
      name: "recentPlay",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/HomeView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/playlist/:id",
      name: "playlistDetail",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/artist/:id",
      name: "artistDetail",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/radio/:id",
      name: "radioDetail",
      component: () => import("../views/HomeView.vue"),
    },
    // 视频播放页
    {
      path: "/video/:id",
      name: "videoDetail",
      component: () => import("../views/HomeView.vue"),
    },
    // 音乐馆 - 使用嵌套路由，MusicHallView 有自己的 router-view
    {
      path: "/musicHall",
      name: "musicHall",
      component: () => import("../views/HomeView.vue"),
      // 这里不能直接嵌套，因为 HomeView 是动态加载组件的
      // MusicHallView 需要从 HomeView 内部加载
    },
    {
      path: "/musicHall/picked",
      name: "musicHallPicked",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/musicHall/topList",
      name: "musicHallTopList",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/musicHall/artist",
      name: "musicHallArtist",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/musicHall/category",
      name: "musicHallCategory",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/musicHall/radio",
      name: "musicHallRadio",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/musicHall/digitalAlbum",
      name: "musicHallDigitalAlbum",
      component: () => import("../views/HomeView.vue"),
    },
  ],
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const isLoggedIn = true;
    if (isLoggedIn) {
      next();
    } else {
      next();
      console.log("需要登录才能访问个人中心");
    }
  } else {
    next();
  }
});

export default router;
