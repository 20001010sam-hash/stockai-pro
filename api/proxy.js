module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { type, symbol } = req.query;
    const FKEY = process.env.FINNHUB_API_KEY;

    if (type === 'tw') {
      const r = await fetch('https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_2330.tw|tse_2317.tw|tse_2454.tw|tse_2382.tw|tse_2308.tw|tse_2412.tw|tse_2881.tw|tse_3008.tw|tse_6669.tw|tse_2376.tw&json=1&delay=0', {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://mis.twse.com.tw' }
      });
      return res.status(200).json(await r.json());
    }

    if (type === 'twii') {
      const r = await fetch('https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_t00.tw&json=1&delay=0', {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://mis.twse.com.tw' }
      });
      return res.status(200).json(await r.json());
    }

    if (type === 'search' && symbol) {
      const sym = symbol.trim();
      const urls = [
        `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${sym}.tw&json=1&delay=0`,
        `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=otc_${sym}.tw&json=1&delay=0`,
      ];
      for (const url of urls) {
        const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://mis.twse.com.tw' } });
        const d = await r.json();
        if (d.msgArray && d.msgArray.length > 0 && d.msgArray[0].c) {
          return res.status(200).json(d);
        }
      }
      return res.status(200).json({ msgArray: [], error: 'not found' });
    }

    if (type === 'us' && symbol) {
      if (!FKEY) return res.status(500).json({error:'No Finnhub key'});
      const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FKEY}`);
      const d = await r.json();
      return res.status(200).json(d);
    }

    if (type === 'us_batch') {
      if (!FKEY) return res.status(500).json({error:'No Finnhub key'});
      const syms = ['AAPL','MSFT','NVDA','TSLA','AMZN','GOOG','META','F','NOK','PLUG'];
      const results = {};
      await Promise.all(syms.map(async s => {
        try {
          const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${s}&token=${FKEY}`);
          const d = await r.json();
          if (d.c) results[s] = {
            price: Math.round(d.c * 100) / 100,
            change: Math.round(d.d * 100) / 100,
            pct: Math.round(d.dp * 100) / 100
          };
        } catch {}
      }));
      return res.status(200).json(results);
    }

    if (type === 'indices') {
      const syms = [
        ['^SPX','sp500'],['^NDX','nasdaq'],['^DJI','dow'],
        ['^SOX','sox'],['^N225','nikkei'],['USDTWD=X','usdtwd'],['GC=F','gold']
      ];
      const results = {};
      await Promise.all(syms.map(async ([s, key]) => {
        try {
          const r = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?interval=1d&range=1d`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'application/json' }
          });
          const d = await r.json();
          const meta = d?.chart?.result?.[0]?.meta;
          if (meta) {
            const price = meta.regularMarketPrice || 0;
            const prev = meta.previousClose || price;
            results[key] = {
              price: Math.round(price * 100) / 100,
              change: Math.round((price - prev) * 100) / 100,
              pct: prev > 0 ? Math.round((price - prev) / prev * 10000) / 100 : 0
            };
          }
        } catch {}
      }));
      return res.status(200).json(results);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({error:'No API key'});
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body)
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
