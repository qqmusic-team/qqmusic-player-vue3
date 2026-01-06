import {defineStore} from "pinia";
import {useLogin, useLoginStatus} from "@/utils/api";
import type {UserProfile} from "@/models/user";
import {isCookieExpired, getCookie, setCookie} from "@/utils/http";

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
        }
    },
    actions: {
        async login(phone: string, password: string) {
            const res = await useLogin(phone, password)
            if (res.code == 200) {
                this.token = res.token
                this.cookie = res.cookie
                document.cookie = res.cookie
                localStorage.setItem("USER-TOKEN", this.token)
                localStorage.setItem("USER-COOKIE", this.cookie)
                // 使用新的setCookie函数保存Cookie
                setCookie(res.cookie)
                await this.checkLogin()
                // 启动定期检查定时器
                this.startLoginCheckTimer()
            }
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
            this.showLogin = true

            // 清除本地存储
            localStorage.removeItem("USER-TOKEN")
            localStorage.removeItem("USER-COOKIE")

            // 清除Cookie
            document.cookie = ''
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
        }
    }
})
