import axios from 'axios';

// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:7070', // 你的后端服务地址
  timeout: 10000,
});

// 请求拦截器：在每个请求发送前自动添加 Authorization 头
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // 从 localStorage 或 sessionStorage 获取 token
    if (token) {
      // 如果有 token，则将其添加到请求头中
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器：可以处理 token 过期或其他响应
apiClient.interceptors.response.use(
  (response) => {
    // 对响应数据做些什么
    return response;
  },
  (error) => {
    // 如果请求失败，处理 token 失效等问题
    if (error.response && error.response.status === 401) {
      // Token 失效处理，例如跳转到登录页面
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;
