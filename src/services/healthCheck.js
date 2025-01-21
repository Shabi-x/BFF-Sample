// 健康检查机制
class HealthyLoadBalancer {
  constructor(services) {
    this.services = services.map(url => ({
      url,
      healthy: true,
      failureCount: 0
    }));
  }

  async checkHealth(service) {
    try {
      await axios.get(`${service.url}/health`);
      service.healthy = true;
      service.failureCount = 0;
      return true;
    } catch (error) {
      service.failureCount++;
      service.healthy = service.failureCount < 3;
      return false;
    }
  }

  getHealthyServices() {
    return this.services.filter(service => service.healthy);
  }

  async request(path) {
    const healthyServices = this.getHealthyServices();
    
    if (healthyServices.length === 0) {
      // 尝试重新检查所有服务
      await Promise.all(this.services.map(service => this.checkHealth(service)));
      throw new Error('No healthy services available');
    }

    const service = healthyServices[Math.floor(Math.random() * healthyServices.length)];

    try {
      const response = await axios.get(`${service.url}${path}`);
      return response.data;
    } catch (error) {
      await this.checkHealth(service);
      throw error;
    }
  }
}