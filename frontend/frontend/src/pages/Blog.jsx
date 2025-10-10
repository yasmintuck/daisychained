// src/pages/Blog.jsx
import { useEffect, useMemo, useState } from "react";
import "./PublicPages.css";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/blog?publishedOnly=true`);
        const data = await res.json();
        if (alive) setPosts(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const allTags = useMemo(() => {
    const set = new Set();
    posts.forEach(p => (p?.Tags || p?.tags || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return posts.filter(p => {
      const matchesQ =
        !term ||
        p.title?.toLowerCase().includes(term) ||
        p.excerpt?.toLowerCase().includes(term) ||
        (p.author || "").toLowerCase().includes(term);

      const pTags = (p.tags || p.Tags || "")
        .split(",")
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

      const matchesTag = !tag || pTags.includes(tag.toLowerCase());
      return matchesQ && matchesTag;
    });
  }, [posts, q, tag]);

  return (
    <div className="public-page">
      <div className="public-nav-divider" />

      <section className="public-hero">
        <div className="public-container">
          <div className="public-hero-grid">
            <h1 className="hero-title">
              <span className="h1-line1"></span><br />
              <span>blog</span>
            </h1>

            <div className="public-search">
              <label htmlFor="blog-search" className="sr-only">Search posts</label>
              <div className="public-search-wrap">
                <input
                  id="blog-search"
                  type="search"
                  className="public-search-input public-search-input--underline"
                  placeholder="search posts…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Escape") setQ(""); }}
                  autoComplete="off"
                />
                {q.length ? (
                  <button
                    type="button"
                    className="public-search-action"
                    aria-label="Clear search"
                    onClick={() => setQ("")}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M6 6L18 18M18 6L6 18" stroke="#808285" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : (
                  <span className="public-search-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7.5" stroke="#808285" strokeWidth="2" />
                      <path d="M20 20L16.65 16.65" stroke="#808285" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ===== TAGS BAR (sits just under hero, above posts) ===== */}
      <div className="public-container">
        {allTags.length > 0 && (
          <div className="blog-tags-toolbar">
            <button
              className={`tag-chip ${tag === "" ? "active" : ""}`}
              onClick={() => setTag("")}
            >
              All tags
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                className={`tag-chip ${tag === t ? "active" : ""}`}
                onClick={() => setTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p style={{ padding: "2rem 0", color: "#231F20" }}>Loading…</p>
        ) : filtered.length ? (
          <div className="blog-grid">
            {filtered.map((p) => (
              <a key={p.slug} className="blog-card" href={`/blog/${p.slug}`}>
                {p.coverImageUrl && (
                  <div className="blog-card-media">
                    <img src={p.coverImageUrl} alt="" />
                  </div>
                )}
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span>{new Date(p.publishedAt).toLocaleDateString()}</span>
                    {p.author && <span>· {p.author}</span>}
                  </div>
                  <h3 className="blog-card-title">{p.title}</h3>
                  {p.excerpt && <p className="blog-card-excerpt">{p.excerpt}</p>}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p style={{ padding: "2rem 0", color: "#231F20" }}>No posts found.</p>
        )}
      </div>
    </div>
  );
}
