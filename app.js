const koa = require("koa");
const app = new koa();
const { fetchData, fetchDataMixed } = require("./aggregator");
require("dotenv").config();

app.use(async (ctx) => {
  try {
    const url1 = process.env.MAKEUPBRANCH_URL;
    const url2 = process.env.MAKEUPBRANCH_URL;
    
    console.log('Attempting to fetch data from:', url1, url2);
    
    // const aggregatedData = await fetchDataMixed(url1, url2, {
    //   branch: "v1",
    //   similarity: 0.8,
    // });
    const aggregatedData = await fetchData(url1, url2);
    
    console.log('Fetch successful:', aggregatedData);
    ctx.body = aggregatedData;
  } catch (error) {
    console.error('Request processing error:', error);
    ctx.status = 500;
    ctx.body = { 
      error: 'Internal Server Error',
      details: error.message 
    };
  }
});

const server = app.listen(3000, () => {
  console.log("Server started successfully");
  console.log("Listening on http://localhost:3000");
});

// 添加服务器错误处理
server.on('error', (err) => {
  console.error('Server error:', err);
});

// 处理未捕获的Promise reject
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});