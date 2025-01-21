const axios = require("axios");
const axiosRetry = require('axios-retry').default;
const FormData = require("form-data");

const cacheNode = require("node-cache");
const cache = new cacheNode({ stdTTL: 60 });

axiosRetry(axios, {
  retries: 3, // 重试3次
  retryDelay: axiosRetry.exponentialDelay,  
  retryCondition: (error) => {
    console.log('Retry condition触发', error.message);
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) || 
      (error.response && error.response.status >= 500)
    );
  },
  onRetry: (retryCount, error) => {
    console.log(`第 ${retryCount} 次重试:`, error.message);
  }
});

/**
 * 数据聚合
 * 实现请求转发、并行请求和数据转换功能
 */
async function fetchDataWithCache(url1, url2) {


  const cacheKey = `${url1}-${url2}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.error(`This is Cache HIT for key: ${cacheKey}`);
    return cachedData;
  }else{
    console.log('fuck no cache');
  }

  try {
    const [response1, response2] = await Promise.all([
      axios.get(url1),
      axios.get(url2),
    ]);
    const AnyName = response1.data ;
    const NameWhichYouPrefer = response2.data;

    const aggregatedData = {
      AnyName,
      NameWhichYouPrefer,
    };
    cache.set(cacheKey, aggregatedData);
    return aggregatedData;
  } catch (error) {
    // console.error(error);
    // console.error('访问出错了');
  }
}

async function fetchDataMixed(url1, url2, postData) {
  try {
    const formData = new FormData();
    formData.append("branch", postData.branch || "");
    if (postData.similarity) {
      formData.append("similarity", postData.similarity);
    }
    const [getResponse, postResponse] = await Promise.all([
      axios.get(url1),
      axios.post(url2, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...formData.getHeaders(),
        },
      }),
    ]);
    return {
      getResponse: getResponse.data,
      postResponse: postResponse.data,
      aggregatedData: {
        getstatus: getResponse.status,
        poststatus: postResponse.status,
        totalRecords: getResponse.data.length + postResponse.data.length,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to fetch data",
      details: error,
    };
  }
}
module.exports = { fetchDataWithCache, fetchDataMixed };
