// src/pages/BlogPost.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./PublicPages.css";
// If you installed react-markdown:
import ReactMarkdown from "react-markdown";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/blog/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        if (alive) setPost(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  if (loading) return <div className="public-page"><div className="public-container"><p style={{ padding: "2rem 0" }}>Loading…</p></div></div>;
  if (!post) return <div className="public-page"><div className="public-container"><p style={{ padding: "2rem 0" }}>Post not found.</p></div></div>;

  const date = new Date(post.publishedAt || post.createdAt).toLocaleDateString();
  const tags = (post.tags || post.Tags || "")
    .split(",").map(s => s.trim()).filter(Boolean);

  return (
    <div className="public-page">
      <div className="public-container">
        <div className="section-header">
          <h1 className="hero-title" style={{ textTransform: "none" }}>{post.title}</h1>
        </div>

        <div className="blog-article">
          <div className="blog-article-meta">
            <span>{date}</span>
            {post.author && <span>· {post.author}</span>}
            {tags.length > 0 && <span>· {tags.join(", ")}</span>}
          </div>

          {post.coverImageUrl && (
            <div className="blog-hero-media">
              <img src={post.coverImageUrl} alt="" />
            </div>
          )}

          <div className="blog-article-content">
            {/* If storing Markdown */}
            <ReactMarkdown>{post.content || ""}</ReactMarkdown>

            {/* If you stored HTML instead, use this instead of ReactMarkdown:
            <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
            */}
          </div>

          <div style={{ marginTop: "2rem" }}>
            <Link to="/" className="blog-back-link">← back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
