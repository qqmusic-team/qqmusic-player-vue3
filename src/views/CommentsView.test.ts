import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import CommentsView from './CommentsView.vue';

// 简化的 mock 类型定义
type MockFunction = ReturnType<typeof vi.fn>;

// 核心修复：正确实现 userStore mock（解决 this 指向问题）
vi.mock('@/stores/user', () => {
  // 用变量存储状态，避免 this 指向问题
  let showLoginState = false;

  return {
    useUserStore: vi.fn(() => ({
      get showLogin() {
        return showLoginState;
      },
      set showLogin(value: boolean) {
        showLoginState = value;
      },
      // 保留 _showLogin 避免组件报错（如果组件用到）
      _showLogin: false
    }))
  };
});

// Mock player store
vi.mock('@/stores/player', () => {
  return {
    usePlayerStore: vi.fn(() => ({
      song: { id: '186016', name: '晴天' }
    }))
  };
});

// 模拟 http 模块
vi.mock('@/utils/http', () => ({
  default: {
    get: vi.fn()
  },
  getCookie: vi.fn(() => 'MUSIC_U=test; __csrf=test;'),
  isCookieExpired: vi.fn(() => false),
  setCookie: vi.fn()
}));

// 延迟函数
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

describe('CommentsView.vue', () => {
  let userStore: {
    showLogin: boolean;
    _showLogin: boolean;
  };
  let wrapper: VueWrapper;
  let http: { get: MockFunction };
  let getCookie: MockFunction;
  let isCookieExpired: MockFunction;

  beforeEach(async () => {
    // 重置所有 mock
    vi.clearAllMocks();

    // 正确导入并类型转换
    const httpModule = (await import('@/utils/http')) as unknown as {
      default: { get: MockFunction };
      getCookie: MockFunction;
      isCookieExpired: MockFunction;
      setCookie: MockFunction;
    };

    const userStoreModule = (await import('@/stores/user')) as unknown as {
      useUserStore: () => {
        showLogin: boolean;
        _showLogin: boolean;
      };
    };

    // 赋值
    http = httpModule.default;
    getCookie = httpModule.getCookie;
    isCookieExpired = httpModule.isCookieExpired;
    userStore = userStoreModule.useUserStore();

    // 重置初始状态
    userStore.showLogin = false;
    vi.mocked(getCookie).mockReturnValue('MUSIC_U=test; __csrf=test;');
    vi.mocked(isCookieExpired).mockReturnValue(false);
    vi.mocked(http.get).mockResolvedValue({
      code: 200,
      hotComments: []
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('渲染页面基本结构', async () => {
    vi.mocked(http.get).mockResolvedValue({
      code: 200,
      hotComments: []
    });

    wrapper = mount(CommentsView);
    await delay();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.page-title').text()).toBe('精选评论《晴天》（评论歌曲与播放歌曲一致）');
    expect(wrapper.find('[data-testid="refresh-btn"]').text()).toBe('刷新评论');
    expect(wrapper.find('.empty-tip').exists()).toBe(true);
    expect(wrapper.find('[data-testid="refresh-btn"]').attributes('disabled')).toBe('false');
  });

  it('点击刷新按钮触发评论加载并渲染真实评论', async () => {
    const mockComments = {
      code: 200,
      hotComments: [
        {
          commentId: 123456,
          user: { avatarUrl: 'test.jpg', nickname: '测试用户' },
          content: '测试评论内容',
          likedCount: 100
        }
      ]
    };
    // 使用延迟的Promise来模拟异步请求
    vi.mocked(http.get).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve(mockComments), 100);
      });
    });

    wrapper = mount(CommentsView);
    await delay();
    await wrapper.vm.$nextTick();

    const refreshBtn = wrapper.find('[data-testid="refresh-btn"]');
    await refreshBtn.trigger('click');
    // 等待10毫秒，确保cv_isRefreshing变为true
    await new Promise(resolve => setTimeout(resolve, 10));
    await wrapper.vm.$nextTick();

    expect(refreshBtn.attributes('disabled')).toBe('true');
    expect(refreshBtn.text()).toBe('刷新中');

    await delay();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.comment-card').exists()).toBe(true);
    expect(wrapper.find('.nickname').text()).toBe('测试用户');
    expect(wrapper.find('.content-text').text()).toBe('测试评论内容');
    expect(wrapper.find('.like-count').text()).toBe('👍 100');

    expect(refreshBtn.attributes('disabled')).toBe('false');
    expect(refreshBtn.text()).toBe('刷新评论');
  });

  it('请求失败时显示空数据提示', async () => {
    vi.mocked(http.get).mockRejectedValue(new Error('请求失败'));

    wrapper = mount(CommentsView);
    await delay();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.empty-tip').exists()).toBe(true);
    expect(wrapper.findAll('.empty-tip p')[0].text()).toBe('暂无评论 😟');
    expect(wrapper.find('.comment-card').exists()).toBe(false);
  });

  it('无 Cookie 时自动打开登录弹窗', async () => {
    // 模拟无 Cookie
    vi.mocked(getCookie).mockReturnValue('');

    wrapper = mount(CommentsView);
    await delay(200); // 延长延迟，确保异步逻辑执行完成
    await wrapper.vm.$nextTick();

    // 验证登录弹窗触发
    expect(userStore.showLogin).toBe(true);
    expect(wrapper.find('.empty-tip').exists()).toBe(true);
  });

  it('Cookie 过期时自动打开登录弹窗', async () => {
    // 模拟 Cookie 过期
    vi.mocked(isCookieExpired).mockReturnValue(true);

    wrapper = mount(CommentsView);
    await delay(200); // 延长延迟
    await wrapper.vm.$nextTick();

    expect(userStore.showLogin).toBe(true);
  });

  it('接口返回无热门评论时显示空提示', async () => {
    vi.mocked(http.get).mockResolvedValue({
      code: 200,
      hotComments: []
    });

    wrapper = mount(CommentsView);
    await delay();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.empty-tip').exists()).toBe(true);
    expect(wrapper.find('.comment-card').exists()).toBe(false);
  });
});
