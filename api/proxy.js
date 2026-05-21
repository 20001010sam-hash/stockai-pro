module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { type } = req.query;

    // 台股 - 證交所官方API
    if (type === 'tw') {
      const r = await fetch('https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_2330.tw|tse_2317.tw|tse_2454.tw|tse_2382.tw|tse_2308.tw|tse_2412.tw|tse_2881.tw|tse_3008.tw|tse_6669.tw|tse_2376.tw&json=1&delay=0', {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://mis.twse.com.tw' }
      });
      const d = await r.json();
      return res.status(200).json(d);
    }

    // 加權指數
    if (type === 'twii') {
      const r = await fetch('https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_t00.tw&json=1&delay=0', {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://mis.twse.com.tw' }
      });
      const d = await r.json();
      return res.status(200).json(d);
    }

    // AI 分析 (POST)
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({error:'No API key'});
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      };
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers, body: JSON.stringify(body)
      });
      const text = await r.text();
      res.setHeader('Content-Type', 'application/json');
      return res.status(r.status).send(text);
    }

    return res.status(400).json({error:'Bad request'});
  } catch(e) {
    return res.status(500).json({error: e.message});
  }
};
