// 加权轮询负载均衡

class WeightedLoadBalancer {
  constructor(services) {
    this.services = services.map(service => ({
      url: service.url,
      weight: service.weight,
      currentWeight: service.weight
    }));
  }

  getNextService() {
    let totalWeight = 0;
    let maxWeightService = null;

    for (let service of this.services) {
      service.currentWeight += service.weight;
      totalWeight += service.weight;

      if (!maxWeightService || service.currentWeight > maxWeightService.currentWeight) {
        maxWeightService = service;
      }
    }

    maxWeightService.currentWeight -= totalWeight;
    return maxWeightService.url;
  }

  async request(path) {
    const serviceUrl = this.getNextService();
    try {
      const response = await axios.get(`${serviceUrl}${path}`);
      return response.data;
    } catch (error) {
      console.error(`Request to ${serviceUrl} failed`);
      return null;
    }
  }
}

// 使用示例
// const weightedServiceDiscovery = new WeightedLoadBalancer([
//   { url: 'http://high-performance-service:3000', weight: 3 },
//   { url: 'http://medium-service:3000', weight: 2 },
//   { url: 'http://low-performance-service:3000', weight: 1 }
// ]);