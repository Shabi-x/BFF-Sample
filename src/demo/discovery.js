// 简单加权选择

class UserBFFService {
  constructor() {
    this.userServices = [
      {
        url: "http://user-service-1:3000",
        weight: 3, // 高性能服务
      },
      {
        url: "http://user-service-2:3000",
        weight: 1, // 备用服务
      },
    ];
  }

  async getUserProfile(userId) {
    try {
      // 选择服务
      const serviceUrl = this.selectServiceByWeight();

      // 获取用户信息
      const [profile, orders, preferences] = await Promise.all([
        axios.get(`${serviceUrl}/profile/${userId}`),
        axios.get(`${serviceUrl}/orders/${userId}`),
        axios.get(`${serviceUrl}/preferences/${userId}`),
      ]);

      return {
        userId,
        name: profile.data.name,
        recentOrders: orders.data.slice(0, 3),
        preferences: preferences.data,
      };
    } catch (error) {
      console.error("User profile fetch failed", error);
      return this.fallbackUserProfile(userId);
    }
  }

  selectServiceByWeight() {
    // 简单加权选择
    const totalWeight = this.userServices.reduce(
      (sum, service) => sum + service.weight,
      0
    );
    const randomValue = Math.random() * totalWeight;

    let currentWeight = 0;
    for (let service of this.userServices) {
      currentWeight += service.weight;
      if (randomValue <= currentWeight) {
        return service.url;
      }
    }

    return this.userServices[0].url;
  }

  fallbackUserProfile(userId) {
    return {
      userId,
      name: "用户信息不可用",
      recentOrders: [],
      preferences: {},
    };
  }
}
