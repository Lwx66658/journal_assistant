/**
 * API 适配层 - 支持 localStorage（离线）和 Cloudflare Workers API（在线）
 */

// 检测是否在 Cloudflare Workers 环境中运行
const isCloudflareEnv = typeof window !== 'undefined' && window.location.hostname !== '';
const API_BASE = isCloudflareEnv ? '/api' : '';
const USE_API = true; // 设置为 false 使用纯 localStorage 模式

class StorageAdapter {
  constructor(useAPI = USE_API) {
    this.useAPI = useAPI && isCloudflareEnv;
    this.currentUser = null;
  }

  /**
   * 用户登录
   */
  async login(username, password) {
    if (this.useAPI) {
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (result.success) {
          this.currentUser = result.user;
          localStorage.setItem('kanxing_user', JSON.stringify(result.user));
          return result.user;
        }
        throw new Error(result.message || '登录失败');
      } catch (error) {
        console.warn('API 登录失败，使用本地验证', error);
        return this._localLogin(username, password);
      }
    }
    return this._localLogin(username, password);
  }

  _localLogin(username, password) {
    const users = {
      admin: { password: '123456', role: 'admin', email: 'admin@kanxing.cn' },
      linmo: { password: '123456', role: 'employee', name: '林默', employeeId: 1 },
      zhouxiao: { password: '123456', role: 'employee', name: '周晓', employeeId: 2 },
      chenxu: { password: '123456', role: 'employee', name: '陈叙', employeeId: 3 },
      xuyan: { password: '123456', role: 'employee', name: '许言', employeeId: 4 },
      tangtang: { password: '123456', role: 'employee', name: '唐棠', employeeId: 5 }
    };
    const user = users[username];
    if (user && user.password === password) {
      this.currentUser = { username, ...user };
      localStorage.setItem('kanxing_user', JSON.stringify(this.currentUser));
      return this.currentUser;
    }
    throw new Error('用户名或密码错误');
  }

  /**
   * 获取所有书刊
   */
  async getPublications() {
    if (this.useAPI) {
      try {
        const response = await fetch(`${API_BASE}/publications`);
        if (response.ok) {
          const data = await response.json();
          // 同步到 localStorage 作为缓存
          localStorage.setItem('kanxing_publications', JSON.stringify(data));
          return data;
        }
      } catch (error) {
        console.warn('API 获取失败，使用本地缓存', error);
      }
    }
    // 降级到 localStorage
    return JSON.parse(localStorage.getItem('kanxing_publications') || 'null') || [];
  }

  /**
   * 保存所有书刊
   */
  async savePublications(publications) {
    // 先保存到 localStorage
    localStorage.setItem('kanxing_publications', JSON.stringify(publications));

    if (this.useAPI) {
      try {
        const response = await fetch(`${API_BASE}/publications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(publications)
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn('API 保存失败，仅保存到本地', error);
      }
    }
    return { success: true, local: true };
  }

  /**
   * 获取单个书刊
   */
  async getPublication(id) {
    if (this.useAPI) {
      try {
        const response = await fetch(`${API_BASE}/publications/${id}`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn('API 获取失败，使用本地数据', error);
      }
    }
    const publications = JSON.parse(localStorage.getItem('kanxing_publications') || '[]');
    return publications.find(p => p.id === id);
  }

  /**
   * 更新单个书刊
   */
  async updatePublication(id, updates) {
    // 先更新本地
    const publications = JSON.parse(localStorage.getItem('kanxing_publications') || '[]');
    const index = publications.findIndex(p => p.id === id);
    if (index !== -1) {
      publications[index] = { ...publications[index], ...updates };
      localStorage.setItem('kanxing_publications', JSON.stringify(publications));
    }

    if (this.useAPI) {
      try {
        const response = await fetch(`${API_BASE}/publications/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn('API 更新失败，仅更新本地', error);
      }
    }
    return { success: true, local: true };
  }

  /**
   * 删除书刊
   */
  async deletePublication(id) {
    // 先删除本地
    const publications = JSON.parse(localStorage.getItem('kanxing_publications') || '[]');
    const filtered = publications.filter(p => p.id !== id);
    localStorage.setItem('kanxing_publications', JSON.stringify(filtered));

    if (this.useAPI) {
      try {
        const response = await fetch(`${API_BASE}/publications/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn('API 删除失败，仅删除本地', error);
      }
    }
    return { success: true, local: true };
  }

  /**
   * 获取员工列表
   */
  async getEmployees() {
    if (this.useAPI) {
      try {
        const response = await fetch(`${API_BASE}/employees`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn('API 获取失败，使用本地数据', error);
      }
    }
    return [
      { id: 1, username: 'linmo', name: '林默', role: '责任编辑', avatar: '林', color: 'purple' },
      { id: 2, username: 'zhouxiao', name: '周晓', role: '文字编辑', avatar: '周', color: 'blue' },
      { id: 3, username: 'chenxu', name: '陈叙', role: '设计编辑', avatar: '陈', color: 'green' },
      { id: 4, username: 'xuyan', name: '许言', role: '审校编辑', avatar: '许', color: 'rose' },
      { id: 5, username: 'tangtang', name: '唐棠', role: '文字编辑', avatar: '唐', color: 'orange' }
    ];
  }

  /**
   * 检查 API 连接状态
   */
  async checkAPIStatus() {
    if (!this.useAPI) return { online: false, mode: 'localStorage' };
    try {
      const response = await fetch(`${API_BASE}/employees`, { method: 'HEAD' });
      return { online: response.ok, mode: 'API' };
    } catch {
      return { online: false, mode: 'localStorage (fallback)' };
    }
  }
}

// 导出单例
const storageAdapter = new StorageAdapter();

// 使示例：替换 app.js 中的直接 localStorage 调用
// publications = await storageAdapter.getPublications();
// await storageAdapter.savePublications(publications);
