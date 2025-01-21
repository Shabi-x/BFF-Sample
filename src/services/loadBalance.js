// # 负载均衡核心逻辑
const axios = require('axios');

class LoadBalancer {
  constructor(services) {
    this.services = services;
    this.currentIndex = 0;
  }

  // 轮询策略
  getNextService() {
    const service = this.services[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.services.length;
    return service;
  }

  async request(path) {
    const service = this.getNextService();
    try {
      const response = await axios.get(`${service}${path}`);
      return response.data;
    } catch (error) {
      console.error(`Request to ${service} failed`, error);
      // 可以实现重试或故障转移
      return this.fallbackRequest(path);
    }
  }

  // 故障转移
  async fallbackRequest(path) {
    for (let service of this.services) {
      try {
        const response = await axios.get(`${service}${path}`);
        return response.data;
      } catch (error) {
        console.error(`Fallback request to ${service} failed`);
      }
    }
    throw new Error('All services are down');
  }
}

// // 使用示例
// const serviceDiscovery = new LoadBalancer([
//   'http://service1:3000',
//   'http://service2:3000',
//   'http://service3:3000'
// ]);

// async function fetchData() {
//   try {
//     const data = await serviceDiscovery.request('/users');
//     return data;
//   } catch (error) {
//     console.error('Data fetch failed', error);
//   }
// }