import { defineSource } from '@nuxtjs/cloudflare';
import { Session } from 'node-fetch-session';

// 全局会话管理
const session = new Session({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
  }
});

export const hotstock = defineSource(async () => {
  try {
    // 初始化 Cookie
    if (!session.cookie) {
      await session.get('https://xueqiu.com/hq');
    }
    
    // 请求数据（带重试）
    const url = "https://stock.xueqiu.com/v5/stock/hot_stock/list.json?size=30&_type=10&type=10";
    const res = await session.get(url);
    
    // 数据清洗
    const validItems = res.data.items
      .filter(item => !item.ad && Math.abs(item.percent) < 20)
      .map(item => ({
        id: item.code,
        url: `https://xueqiu.com/s/${item.code}`,
        title: `${item.name} (${item.exchange})`,
        extra: { 
          percent: item.percent,
          trend: item.percent >= 0 ? '↑' : '↓' 
        }
      }));
      
    return validItems;
  } catch (error) {
    console.error('数据获取失败:', error);
    return [];  // 返回空数组防止前端崩溃
  }
});
