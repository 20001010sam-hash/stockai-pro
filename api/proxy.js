module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { type, symbols } = req.query;

    if (type === 'quote') {
      const syms = symbols || 'AAPL,MSFT,NVDA,TSLA,AMZN,GOOG,META,F,NOK,PLUG,2330.TW,2317.TW,2454.TW,2382.TW,2308.TW,2412.TW,2881.TW,3008.TW,6669.TW,2376.TW,%5ETWII,%5EGSPC,%5EIXIC,%5EDJI,SOX,^N225,USDTWD=X,GC=F';
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${syms}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,shortName`;
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const data = await r.json();
      return res.status(200).json(data);
    }

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
