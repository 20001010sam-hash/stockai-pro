import { useState, useEffect, useRef, useCallback } from "react";

function getTW() {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Taipei",
    })
  );
}

function twStr() {
  return getTW().toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function isTWOpen() {
  const d = getTW();
  const day = d.getDay();
  const m = d.getHours() * 60 + d.getMinutes();
  return day >= 1 && day <= 5 && m >= 540 && m <= 810;
}

function isUSOpen() {
  const d = getTW();
  const day = d.getDay();
  const m = d.getHours() * 60 + d.getMinutes();
  return day >= 1 && day <= 5 && (m >= 1290 || m <= 240);
}

function marketStatus() {
  const d = getTW();
  const day = d.getDay();
  const m = d.getHours() * 60 + d.getMinutes();

  if (day === 0 || day === 6) {
    return {
      label: "週末休市",
      color: "#64748b",
    };
  }

  if (m >= 540 && m <= 810) {
    return {
      label: "🟢 台股交易中",
      color: "#34d399",
    };
  }

  if (m >= 1290 || m <= 240) {
    return {
      label: "🔵 美股交易中",
      color: "#60a5fa",
    };
  }

  return {
    label: "休市",
    color: "#64748b",
  };
}

const TW_STOCKS = [
  {
    symbol: "2330",
    name: "台積電",
    sector: "半導體",
    pe: 28.4,
    grossMargin: "53%",
  },
  {
    symbol: "2317",
    name: "鴻海",
    sector: "電子",
    pe: 12.1,
    grossMargin: "6.2%",
  },
  {
    symbol: "2454",
    name: "聯發科",
    sector: "IC設計",
    pe: 22.8,
    grossMargin: "47%",
  },
  {
    symbol: "2382",
    name: "廣達",
    sector: "AI伺服器",
    pe: 18.5,
    grossMargin: "5.8%",
  },
  {
    symbol: "2308",
    name: "台達電",
    sector: "電源",
    pe: 30.1,
    grossMargin: "28%",
  },
].map((s) => ({
  ...s,
  price: 0,
  change: 0,
  pct: 0,
}));

const US_STOCKS = [
  {
    symbol: "AAPL",
    name: "Apple",
    sector: "科技",
    pe: 29.4,
    grossMargin: "46%",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    sector: "AI晶片",
    pe: 68.2,
    grossMargin: "75%",
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    sector: "電動車",
    pe: 52.3,
    grossMargin: "18%",
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    sector: "雲端",
    pe: 35.1,
    grossMargin: "70%",
  },
].map((s) => ({
  ...s,
  price: 0,
  change: 0,
  pct: 0,
}));

function StarBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();

    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.5 + 0.2,
    }));

    let frame;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bg = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );

      bg.addColorStop(0, "#020617");
      bg.addColorStop(1, "#050816");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((s) => {
        ctx.beginPath();

        ctx.fillStyle = "rgba(255,255,255,0.7)";

        ctx.arc(
          s.x * canvas.width,
          s.y * canvas.height,
          s.r,
          0,
          Math.PI * 2
        );

        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

function Sparkline({ positive }) {
  const color = positive ? "#34d399" : "#f87171";

  return (
    <svg width="70" height="26" viewBox="0 0 100 100">
      <polyline
        points="0,60 20,45 40,55 60,30 80,40 100,20"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}function StockRow({ stock, tw, onAI }) {
  const positive = stock.pct >= 0;
  const color = positive ? "#34d399" : "#f87171";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 100px",
        gap: 10,
        padding: "14px 18px",
        borderBottom: "1px solid rgba(255,255,255,.05)",
        alignItems: "center",
        background:
          Math.abs(stock.pct) >= 5
            ? positive
              ? "rgba(52,211,153,.05)"
              : "rgba(248,113,113,.05)"
            : "transparent",
      }}
    >
      <div>
        <div
          style={{
            fontWeight: 800,
            color: "#e8f4f8",
            fontSize: 14,
          }}
        >
          {tw ? "🇹🇼" : "🇺🇸"} {stock.symbol}
        </div>

        <div
          style={{
            fontSize: 11,
            color: "#6b8fad",
            marginTop: 2,
          }}
        >
          {stock.name} · {stock.sector}
        </div>
      </div>

      <div
        style={{
          fontWeight: 800,
          color: "#fff",
          fontFamily: "monospace",
        }}
      >
        {stock.price > 0
          ? `${tw ? "NT$" : "$"}${stock.price.toLocaleString()}`
          : "載入中"}
      </div>

      <div
        style={{
          color,
          fontWeight: 700,
        }}
      >
        {stock.change > 0 ? "+" : ""}
        {stock.change}
      </div>

      <div
        style={{
          color,
          fontWeight: 700,
        }}
      >
        {stock.pct > 0 ? "+" : ""}
        {stock.pct.toFixed(2)}%
      </div>

      <Sparkline positive={positive} />

      <button
        onClick={() => onAI(stock)}
        style={{
          border: "1px solid rgba(52,211,153,.3)",
          background: "rgba(52,211,153,.08)",
          color: "#34d399",
          padding: "8px 12px",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        🤖 AI
      </button>
    </div>
  );
}

function AIModal({ stock, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.8)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 700,
          background:
            "linear-gradient(135deg,#081120,#0f172a)",
          borderRadius: 20,
          border: "1px solid rgba(52,211,153,.2)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom:
              "1px solid rgba(255,255,255,.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#fff",
              }}
            >
              🤖 {stock.symbol} AI 分析
            </div>

            <div
              style={{
                marginTop: 4,
                color: "#6b8fad",
                fontSize: 12,
              }}
            >
              {stock.name}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "none",
              background: "rgba(255,255,255,.06)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 18,
            }}
          >
            {[
              ["市場情緒", "偏多"],
              ["技術面", "多頭排列"],
              ["風險", "中等"],
              ["策略", "可分批布局"],
            ].map(([a, b]) => (
              <div
                key={a}
                style={{
                  background: "rgba(255,255,255,.03)",
                  border:
                    "1px solid rgba(255,255,255,.06)",
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#6b8fad",
                    marginBottom: 6,
                  }}
                >
                  {a}
                </div>

                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#34d399",
                  }}
                >
                  {b}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "rgba(0,0,0,.35)",
              border:
                "1px solid rgba(52,211,153,.12)",
              borderRadius: 16,
              padding: 18,
              lineHeight: 1.9,
              color: "#bbd4e8",
              fontSize: 14,
            }}
          >
            AI 判斷目前 {stock.symbol} 整體趨勢仍偏強，
            若後續成交量持續放大，
            有機會延續多頭走勢。

            短線需注意高檔震盪與消息面影響，
            建議採取分批進場與風險控管策略。
          </div>
        </div>
      </div>
    </div>
  );
}export default function App() {
  const [tab, setTab] = useState("market");
  const [marketTab, setMarketTab] = useState("tw");
  const [clock, setClock] = useState(twStr());
  const [status, setStatus] = useState(marketStatus());
  const [twStocks, setTwStocks] = useState(TW_STOCKS);
  const [usStocks, setUsStocks] = useState(US_STOCKS);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(twStr());
      setStatus(marketStatus());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stocks = marketTab === "tw" ? twStocks : usStocks;

  const filteredStocks = stocks.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.symbol.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q)
    );
  });

  const updateDemoData = () => {
    const randomize = (arr) =>
      arr.map((s) => {
        const base =
          s.symbol === "2330"
            ? 980
            : s.symbol === "2317"
            ? 180
            : s.symbol === "2454"
            ? 1280
            : s.symbol === "2382"
            ? 290
            : s.symbol === "2308"
            ? 360
            : s.symbol === "NVDA"
            ? 920
            : s.symbol === "TSLA"
            ? 180
            : s.symbol === "MSFT"
            ? 420
            : s.symbol === "AAPL"
            ? 190
            : 100;

        const pct = Math.round((Math.random() * 6 - 3) * 100) / 100;
        const price = Math.round(base * (1 + pct / 100) * 100) / 100;
        const change = Math.round((price - base) * 100) / 100;

        return {
          ...s,
          price,
          change,
          pct,
        };
      });

    setTwStocks(randomize(TW_STOCKS));
    setUsStocks(randomize(US_STOCKS));
  };

  useEffect(() => {
    updateDemoData();
  }, []);

  const cardStyle = {
    background: "rgba(5,14,32,.75)",
    border: "1px solid rgba(255,255,255,.07)",
    borderRadius: 18,
    backdropFilter: "blur(16px)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "#bbd4e8",
        fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
        position: "relative",
      }}
    >
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          button {
            font-family: inherit;
          }

          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(14px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 768px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
            }

            .market-grid {
              grid-template-columns: 1fr 1fr !important;
            }

            .stock-table {
              overflow-x: auto;
            }

            .stock-row {
              min-width: 760px;
            }

            .top-nav {
              overflow-x: auto;
            }
          }
        `}
      </style>

      <StarBackground />

      <header
        style={{
          ...cardStyle,
          borderRadius: 0,
          height: 60,
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderLeft: "none",
          borderRight: "none",
          borderTop: "none",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "#34d399",
          }}
        >
          ▲ StockAI Pro
        </div>

        <nav
          className="top-nav"
          style={{
            display: "flex",
            gap: 6,
          }}
        >
          {[
            ["market", "行情"],
            ["sentiment", "情緒"],
            ["news", "新聞"],
            ["pro", "訂閱"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                background:
                  tab === key
                    ? "rgba(52,211,153,.14)"
                    : "transparent",
                color: tab === key ? "#34d399" : "#6b8fad",
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: status.color,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {status.label}
          </div>

          <div
            style={{
              fontSize: 10,
              color: "#36536f",
              fontFamily: "monospace",
            }}
          >
            {clock}
          </div>
        </div>
      </header>

      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1180,
          margin: "0 auto",
          padding: "24px 18px 60px",
          animation: "fadeUp .4s ease",
        }}
      >
        {tab === "market" && (
          <>
            <section
              className="hero-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr .8fr",
                gap: 18,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  ...cardStyle,
                  padding: 26,
                  background:
                    "linear-gradient(135deg,rgba(5,14,32,.92),rgba(2,8,20,.72))",
                  border: "1px solid rgba(52,211,153,.16)",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: "rgba(52,211,153,.1)",
                    color: "#34d399",
                    fontSize: 12,
                    fontWeight: 900,
                    marginBottom: 14,
                  }}
                >
                  AI 股票分析平台
                </div>

                <h1
                  style={{
                    fontSize: 38,
                    lineHeight: 1.22,
                    color: "#e8f4f8",
                    margin: "0 0 12px",
                    fontWeight: 950,
                  }}
                >
                  用 AI 幫你整理
                  <br />
                  台股、美股的投資訊號
                </h1>

                <p
                  style={{
                    color: "#6b8fad",
                    fontSize: 15,
                    lineHeight: 1.8,
                    marginBottom: 20,
                  }}
                >
                  即時行情、新聞摘要、技術面、基本面、風險評估與多空判斷，一次整理給你。
                  打開網站就能快速掌握市場重點。
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => setTab("market")}
                    style={{
                      padding: "11px 18px",
                      borderRadius: 12,
                      border: "1px solid rgba(52,211,153,.45)",
                      background: "rgba(52,211,153,.14)",
                      color: "#34d399",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    🔍 開始分析股票
                  </button>

                  <button
                    onClick={() => setTab("sentiment")}
                    style={{
                      padding: "11px 18px",
                      borderRadius: 12,
                      border: "1px solid rgba(96,165,250,.35)",
                      background: "rgba(96,165,250,.1)",
                      color: "#60a5fa",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    📊 查看市場情緒
                  </button>
                </div>
              </div>

              <div
                style={{
                  ...cardStyle,
                  padding: 22,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "#6b8fad",
                    marginBottom: 8,
                  }}
                >
                  今日 AI 市場雷達
                </div>

                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#fff",
                    marginBottom: 16,
                  }}
                >
                  熱門觀察
                </div>

                {[
                  ["2330 台積電", "AI 需求仍是主軸", "+2.18%"],
                  ["NVDA 輝達", "資金動能強", "+1.45%"],
                  ["TSLA 特斯拉", "短線震盪", "-0.82%"],
                ].map(([name, text, pct]) => {
                  const positive = pct.startsWith("+");

                  return (
                    <div
                      key={name}
                      style={{
                        background: "rgba(0,0,0,.28)",
                        border: "1px solid rgba(255,255,255,.06)",
                        borderRadius: 14,
                        padding: 14,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <strong style={{ color: "#e8f4f8" }}>
                          {name}
                        </strong>

                        <span
                          style={{
                            color: positive ? "#34d399" : "#f87171",
                            fontWeight: 800,
                          }}
                        >
                          {pct}
                        </span>
                      </div>

                      <div
                        style={{
                          color: "#6b8fad",
                          fontSize: 12,
                        }}
                      >
                        {text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section
              className="market-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 12,
                marginBottom: 18,
              }}
            >
              {[
                ["AI 分析", "8項維度", "#34d399"],
                ["台股追蹤", "熱門標的", "#60a5fa"],
                ["美股分析", "科技龍頭", "#fbbf24"],
                ["風險控管", "停損提醒", "#f87171"],
              ].map(([a, b, c]) => (
                <div
                  key={a}
                  style={{
                    ...cardStyle,
                    padding: 18,
                    borderLeft: `3px solid ${c}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b8fad",
                      marginBottom: 6,
                    }}
                  >
                    {a}
                  </div>

                  <div
                    style={{
                      fontSize: 20,
                      color: c,
                      fontWeight: 900,
                    }}
                  >
                    {b}
                  </div>
                </div>
              ))}
            </section>

            <section
              style={{
                ...cardStyle,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 12,
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setMarketTab("tw")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "1px solid rgba(52,211,153,.3)",
                    background:
                      marketTab === "tw"
                        ? "rgba(52,211,153,.12)"
                        : "transparent",
                    color:
                      marketTab === "tw" ? "#34d399" : "#6b8fad",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  🇹🇼 台股
                </button>

                <button
                  onClick={() => setMarketTab("us")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "1px solid rgba(96,165,250,.3)",
                    background:
                      marketTab === "us"
                        ? "rgba(96,165,250,.12)"
                        : "transparent",
                    color:
                      marketTab === "us" ? "#60a5fa" : "#6b8fad",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  🇺🇸 美股
                </button>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜尋股票代號或名稱..."
                  style={{
                    flex: 1,
                    minWidth: 180,
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,.08)",
                    background: "rgba(0,0,0,.28)",
                    color: "#fff",
                    outline: "none",
                  }}
                />

                <button
                  onClick={updateDemoData}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 10,
                    border: "1px solid rgba(52,211,153,.3)",
                    background: "rgba(52,211,153,.08)",
                    color: "#34d399",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  🔄 更新行情
                </button>
              </div>

              <div className="stock-table">
                <div
                  className="stock-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "2fr 1fr 1fr 1fr 80px 100px",
                    gap: 10,
                    padding: "10px 18px",
                    color: "#6b8fad",
                    fontSize: 11,
                    fontWeight: 800,
                    borderBottom: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <div>公司</div>
                  <div>現價</div>
                  <div>漲跌</div>
                  <div>%</div>
                  <div>趨勢</div>
                  <div></div>
                </div>

                {filteredStocks.map((stock) => (
                  <div className="stock-row" key={stock.symbol}>
                    <StockRow
                      stock={stock}
                      tw={marketTab === "tw"}
                      onAI={setSelected}
                    />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === "sentiment" && (
          <section style={{ ...cardStyle, padding: 24 }}>
            <h1 style={{ color: "#fff", marginTop: 0 }}>
              市場情緒儀表板
            </h1>

            <p style={{ color: "#6b8fad", lineHeight: 1.8 }}>
              這裡之後可以接上 CNN Fear & Greed、VIX、台股加權指數、
              匯率與 AI 情緒評分。
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 14,
                marginTop: 18,
              }}
            >
              {[
                ["市場情緒", "偏貪婪", "#fbbf24"],
                ["VIX 波動", "低波動", "#34d399"],
                ["AI 判斷", "短線偏多", "#60a5fa"],
              ].map(([a, b, c]) => (
                <div
                  key={a}
                  style={{
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 14,
                    padding: 18,
                  }}
                >
                  <div style={{ color: "#6b8fad", fontSize: 12 }}>
                    {a}
                  </div>

                  <div
                    style={{
                      color: c,
                      fontSize: 24,
                      fontWeight: 900,
                      marginTop: 8,
                    }}
                  >
                    {b}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "news" && (
          <section style={{ ...cardStyle, padding: 24 }}>
            <h1 style={{ color: "#fff", marginTop: 0 }}>
              今日 AI 財經新聞
            </h1>

            {[
              ["AI 概念股仍是市場焦點", "利多"],
              ["美債殖利率變化影響科技股估值", "觀察"],
              ["台股短線留意高檔震盪", "中性"],
            ].map(([title, tag]) => (
              <div
                key={title}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: "rgba(0,0,0,.25)",
                  border: "1px solid rgba(255,255,255,.06)",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    color:
                      tag === "利多"
                        ? "#34d399"
                        : tag === "中性"
                        ? "#60a5fa"
                        : "#fbbf24",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 6,
                  }}
                >
                  {tag}
                </div>

                <div style={{ color: "#e8f4f8", fontWeight: 800 }}>
                  {title}
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === "pro" && (
          <section style={{ ...cardStyle, padding: 24 }}>
            <h1 style={{ color: "#fff", marginTop: 0 }}>
              StockAI Pro 訂閱方案
            </h1>

            <p style={{ color: "#6b8fad", lineHeight: 1.8 }}>
              之後可以做成免費版每日 3 次分析，Pro 版開放無限 AI 分析、
              即時新聞、收藏清單與通知功能。
            </p>

            <div
              style={{
                marginTop: 18,
                padding: 20,
                borderRadius: 16,
                background: "rgba(52,211,153,.08)",
                border: "1px solid rgba(52,211,153,.2)",
              }}
            >
              <div style={{ color: "#34d399", fontWeight: 900 }}>
                Pro 月費建議
              </div>

              <div
                style={{
                  color: "#fff",
                  fontSize: 34,
                  fontWeight: 950,
                  marginTop: 8,
                }}
              >
                NT$199 / 月
              </div>

              <div style={{ color: "#6b8fad", marginTop: 8 }}>
                適合先測市場接受度。
              </div>
            </div>
          </section>
        )}
      </main>

      {selected && (
        <AIModal stock={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
