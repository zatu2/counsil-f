"use client";

import React, { useState } from "react";

const ROLE_MAP: Record<number, { title: string; desc: string; emoji: string }> = {
  1: { title: "リーダー", desc: "チームをまとめ、全体の進行を管理します", emoji: "🧭" },
  2: { title: "書記", desc: "会議の議事録を取り、記録を管理します", emoji: "📝" },
  3: { title: "タイムキーパー", desc: "時間配分を管理し、進行を促します", emoji: "⏱️" },
  4: { title: "ファシリテーター", desc: "意見が出やすい環境を作ります", emoji: "🤝" },
  5: { title: "発表者", desc: "結果や提案をまとめて発表します", emoji: "📣" },
  6: { title: "サポート", desc: "補助的な作業や準備を担当します", emoji: "🛠️" },
};

export default function Page() {
  const [num, setNum] = useState<string>("");
  const [role, setRole] = useState<{ title: string; desc: string; emoji: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const API_URL = "https://2hmeq6lj0l.execute-api.ap-northeast-1.amazonaws.com/";

  async function showRole() {
    setRole(null);
    setError(null);
    setAllowed(null);
    const n = Number(num);
    if (!Number.isInteger(n) || n < 1 || n > 6) {
      setError("1〜6 の数字を入力してください。");
      return;
    }

    setChecking(true);
    try {
      const res = await fetch(API_URL, { method: "GET" });
      // try to parse JSON first
      let ok = null as boolean | null;
      try {
        const data = await res.json();
        if (typeof data === "boolean") ok = data;
        else if (typeof data === "object" && data !== null) {
          // try to find a boolean value in object
          const vals = Object.values(data);
          const b = vals.find((v) => typeof v === "boolean");
          if (typeof b === "boolean") ok = b;
        }
      } catch {
        // not JSON, try text
        const txt = await res.text();
        if (txt.trim().toLowerCase() === "true") ok = true;
        else if (txt.trim().toLowerCase() === "false") ok = false;
      }

      if (ok === null) {
        setError("APIの応答が想定外でした。管理者に確認してください。");
        setAllowed(null);
      } else if (ok === true) {
        setAllowed(true);
        setRole(ROLE_MAP[n]);
      } else {
        setAllowed(false);
        setRole(null);
      }
    } catch (err: unknown) {
      // network/CORS 等のエラー
      const msg = err instanceof Error ? err.message : String(err);
      setError("APIへ接続できませんでした。CORSやネットワーク設定を確認してください。\n(" + msg + ")");
      setAllowed(null);
    } finally {
      setChecking(false);
    }
  }

  async function retryCheck() {
    // 再取得は現在の入力に基づいて行う
    setError(null);
    setAllowed(null);
    await showRole();
  }

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg,#f7fbff,#ffffff)",
    padding: 24,
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 760,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 8px 24px rgba(16,24,40,0.08)",
    padding: 28,
  };

  const inputStyle: React.CSSProperties = {
    width: 180,
    fontSize: 28,
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid #e6e9ee",
    textAlign: "center" as const,
    background: "#ffffff",
    color: "#111827",
    // slight inset to separate from background
    boxShadow: "inset 0 -1px 0 rgba(16,24,40,0.03)",
    // ensure number input text is bold enough for readability
    fontWeight: 600,
  };

  const primaryBtn: React.CSSProperties = {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: 10,
    fontSize: 16,
    cursor: "pointer",
  };

  const clearBtn: React.CSSProperties = {
    background: "transparent",
    color: "#374151",
    border: "1px solid #e6e9ee",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 16,
    cursor: "pointer",
  };

  return (
    <main style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em", color: "#374151" }}>番号で役割を表示</h1>
            <p style={{ marginTop: 6, color: "#6b7280" }}>1〜6 の番号を入力すると、その番号に対応した役割を大きく表示します。</p>
          </div>
          <div style={{ textAlign: "right", color: "#9ca3af", fontSize: 13 }}>使いやすく、見やすい UI</div>
        </div>

        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 12 }}>
          <label htmlFor="num" style={{ fontSize: 14, color: "#374151" }}>番号</label>
          <input
            id="num"
            type="number"
            min={1}
            max={6}
            value={num}
            onChange={(e) => setNum(e.target.value)}
            placeholder="1〜6"
            aria-label="番号入力"
            style={inputStyle}
          />

          <div style={{ display: "flex", gap: 10, marginLeft: 8 }}>
            <button onClick={showRole} style={{ ...primaryBtn, opacity: checking ? 0.7 : 1 }} aria-label="表示" disabled={checking}>
              {checking ? "確認中..." : "表示"}
            </button>
            <button
              onClick={() => {
                setNum("");
                setRole(null);
                setError(null);
                setAllowed(null);
              }}
              style={clearBtn}
              aria-label="クリア"
            >
              クリア
            </button>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 18, color: "#dc2626", fontWeight: 600 }} role="alert">
            {error}
          </div>
        )}

        {role && allowed === true && (
          <section
            style={{
              marginTop: 22,
              padding: 20,
              borderRadius: 12,
              background: "linear-gradient(90deg,#f8fafc,#ffffff)",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ fontSize: 44 }}>{role.emoji}</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 24, color: "#111827", fontWeight: 700 }}>{role.title}</h2>
              <p style={{ marginTop: 8, color: "#111827", fontSize: 18, lineHeight: 1.6, fontWeight: 500 }}>{role.desc}</p>
            </div>
          </section>
        )}

        {allowed === false && (
          <section
            style={{
              marginTop: 22,
              padding: 20,
              borderRadius: 12,
              background: "#fff7ed",
              border: "1px solid #fde3c6",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 20, color: "#92400e", fontWeight: 700 }}>まだ公表されていません</h2>
              <p style={{ marginTop: 8, color: "#92400e", fontSize: 15 }}>この番号の役割はまだ公開されていません。</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={retryCheck} style={primaryBtn} disabled={checking}>
                {checking ? "確認中..." : "再取得"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}