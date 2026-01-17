import {defineStore} from "pinia";
import {useLoginStatus} from "@/utils/api";
import type {UserProfile} from "@/models/user";
import {isCookieExpired, getCookie, setCookie, removeCookie} from "@/utils/http";

const DEFAULT_AVATAR_URL =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23f0f0f0'/%3E%3Ctext x='60' y='60' font-size='40' text-anchor='middle' dy='.3em' fill='%23999'%3E%E2%99%AB%3C/text%3E%3C/svg%3E";

export const useUserStore = defineStore("user", {
    state: () => {
        return {
            token: '',
            cookie: '',
            showLogin: false,
            profile: {} as UserProfile,
            loginCheckTimer: null as number | null,
            lastCheckTime: 0
        }
    },
    getters: {
        isLogin: state => {
            return state.profile?.userId > 0
        },
        displayName: state => {
            const nickname = state.profile?.nickname
            const userName = state.profile?.userName
            return nickname || userName || "用户"
        },
        avatarUrl: state => {
            const url = state.profile?.avatarUrl
            return url || DEFAULT_AVATAR_URL
        }
    },
    actions: {

        setUserProfile(profile: Partial<UserProfile>) {
            this.profile = {
                ...(this.profile || ({} as UserProfile)),
                ...(profile || {}),
            } as UserProfile
        },
        setUserAvatar(avatarUrl: string) {
            this.setUserProfile({avatarUrl})
        },
        setUserNickname(nickname: string) {
            this.setUserProfile({nickname})
        },
        async checkLogin() {
            try {
                const {data} = await useLoginStatus()
                if (data.code === 200) {
                    this.profile = data.profile
                    this.showLogin = false
                    this.lastCheckTime = new Date().getTime()

                    // 检查Cookie是否需要续期
                    const cookie = getCookie()
                    if (cookie && isCookieExpired()) {
                        // 续期Cookie
                        setCookie(cookie)
                    }
                }
            } catch (error) {
                console.error('登录状态检查失败:', error)
                // 如果检查失败，可能是Cookie过期或失效
                this.handleLoginFailure()
            }
        },
        // 启动定期登录状态检查定时器（每30分钟检查一次）
        startLoginCheckTimer() {
            // 先停止现有的定时器
            this.stopLoginCheckTimer()

            // 每30分钟检查一次登录状态
            this.loginCheckTimer = window.setInterval(async () => {
                await this.checkLogin()
            }, 30 * 60 * 1000)
        },
        // 停止定期登录状态检查定时器
        stopLoginCheckTimer() {
            if (this.loginCheckTimer) {
                clearInterval(this.loginCheckTimer)
                this.loginCheckTimer = null
            }
        },
        // 处理登录失败情况
        handleLoginFailure() {
            // 清除用户信息
            this.token = ''
            this.cookie = ''
            this.profile = {} as UserProfile
            // this.showLogin = true

            // 清除所有相关Cookie
            removeCookie()
        },
        // 初始化用户状态
        initUserStatus() {
            // 检查是否有保存的Cookie
            const savedCookie = getCookie()
            if (savedCookie) {
                // 如果有Cookie，检查登录状态
                this.checkLogin()
                // 启动定期检查定时器
                this.startLoginCheckTimer()
            }
        },
        // 登出功能
        logout() {
            // 清除用户信息
            this.token = ''
            this.cookie = ''
            this.profile = {} as UserProfile
            // 清除所有相关Cookie
            removeCookie()
            // 停止定期检查定时器
            this.stopLoginCheckTimer()
        }
    }
})
