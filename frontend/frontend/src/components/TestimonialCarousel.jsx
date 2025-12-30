import { useEffect, useRef, useMemo, useState } from 'react';

export default function TestimonialCarousel({ testimonials = [], speed = 60 }) {
  const trackRef = useRef(null);
  const wrapperRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // duplicate items for seamless loop
  const items = useMemo(() => testimonials.concat(testimonials), [testimonials]);

  useEffect(() => {
    const w = wrapperRef.current;
    if (!w) return;
    const onMouseEnter = () => setPaused(true);
    const onMouseLeave = () => setPaused(false);
    const onFocusIn = () => setPaused(true);
    const onFocusOut = (e) => {
      if (!w.contains(e.relatedTarget)) setPaused(false);
    };
    w.addEventListener('mouseenter', onMouseEnter);
    w.addEventListener('mouseleave', onMouseLeave);
    w.addEventListener('focusin', onFocusIn);
    w.addEventListener('focusout', onFocusOut);
    return () => {
      w.removeEventListener('mouseenter', onMouseEnter);
      w.removeEventListener('mouseleave', onMouseLeave);
      w.removeEventListener('focusin', onFocusIn);
      w.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const [duration, setDuration] = useState(0);
  // We'll drive the smooth continuous motion with requestAnimationFrame to avoid
  // CSS animation restart seams. Compute the width of one set and advance an
  // offset in pixels each frame.
  const roRef = useRef(null);
  const rafRef = useRef(null);
  const offsetRef = useRef(0);
  const totalWidthRef = useRef(0);
  const lastTsRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const calc = () => {
      const track = trackRef.current;
      if (!track) return;
      // width of one set (we duplicated items array)
      const oneWidth = track.scrollWidth / 2;
      totalWidthRef.current = oneWidth || 0;
    };

    const waitForAssets = async () => {
      try {
        const track = trackRef.current;
        const imgs = track ? Array.from(track.querySelectorAll('img')) : [];
        await Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : new Promise((res) => img.addEventListener('load', res, { once: true })))));
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
      } catch (e) {
        // ignore
      }
      if (!mounted) return;
      calc();
      roRef.current = new ResizeObserver(calc);
      if (trackRef.current) roRef.current.observe(trackRef.current);
    };

    waitForAssets();

    return () => {
      mounted = false;
      if (roRef.current) roRef.current.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [items, speed]);

  // start animation only when the carousel is in the viewport
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => setInView(e.isIntersecting));
    }, { threshold: 0.15 });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  if (!testimonials || testimonials.length === 0) return null;

  // RAF-driven animation
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let running = true;
    lastTsRef.current = null;

    const step = (ts) => {
      if (!running) return;
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000; // seconds
      lastTsRef.current = ts;
      // advance offset
      const speedPx = speed; // pixels per second
      offsetRef.current += speedPx * dt;
      const total = totalWidthRef.current || 0;
      if (total > 0) {
        // wrap offset to [0, total)
        if (offsetRef.current >= total) offsetRef.current -= total;
        // apply transform
        track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    const start = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
      rafRef.current = requestAnimationFrame(step);
    };

    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };

    // start only when visible and not paused
    if (inView && !paused) start();
    else stop();

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paused, speed, inView]);

  return (
    <div className="tc-wrapper reveal" ref={wrapperRef} role="region" aria-label="What our customers say">
      <div
        className={`tc-track`}
        ref={trackRef}
      >
        {items.map((t, i) => (
          <div className="tc-item" key={i} tabIndex={i < testimonials.length ? 0 : -1} aria-hidden={i >= testimonials.length}>
            <div className="testimonial-card">
              <div className="testimonial-who">{t.who || t.a}</div>
              <blockquote>“{t.quote || t.q}”</blockquote>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
