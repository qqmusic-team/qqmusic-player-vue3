import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
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
    },
    {
      path: "/comments",
      name: "comments",
      component: () => import("../views/CommentsView.vue"),
    },
    {
      path: "/favorites",
      name: "favorites",
      component: () => import("../views/FavoritesView.vue"),
    },
    {
      path: "/localMusic",
      name: "localMusic",
      component: () => import("../views/LocalMusicView.vue"),
    },
    {
      path: "/downloads",
      name: "downloads",
      component: () => import("../views/DownloadsView.vue"),
    },
    {
      path: "/recentPlay",
      name: "recentPlay",
      component: () => import("../views/RecentPlayView.vue"),
    },
    {
      path: "/featured",
      name: "featured",
      component: () => import("../views/FeaturedView.vue"),
    },
    {
      path: "/radio",
      name: "radio",
      component: () => import("../views/RadioView.vue"),
    },
    {
      path: "/ranking",
      name: "ranking",
      component: () => import("../views/RankingView.vue"),
    },
  ],
});

export default router;
