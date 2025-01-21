const axios = require("axios");
const FormData = require('form-data');

/**
 * 数据聚合
 * 实现请求转发、并行请求和数据转换功能
 */
async function fetchData(url1, url2) {
  try {
    const [response1, response2] = await Promise.all([
      axios.get(url1),
      axios.get(url2),
    ]);
    const data1 = response1.data;
    const data2 = response2.data;

    const aggregatedData = {
      data1,
      data2,
    };

    return aggregatedData;
  } catch (error) {
    console.error(error);
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
module.exports = { fetchData, fetchDataMixed };
