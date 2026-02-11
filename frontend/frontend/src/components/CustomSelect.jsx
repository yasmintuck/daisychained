import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

export default function CustomSelect({ name, options, placeholder, required }){
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);

  useEffect(()=>{
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(()=>{
    if (!open) setActiveIndex(-1);
  }, [open]);

  const toggle = () => setOpen(o => !o);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(i => Math.min(i + 1, options.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(i => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
  };

  const onOptionClick = (opt) => {
    setSelected(opt.value);
    setOpen(false);
  };

  const selectedLabel = options.find(o=>o.value===selected)?.label || '';

  return (
    <div className="custom-select" ref={rootRef}>
      <button type="button" className={`custom-select-toggle ${!selected? 'placeholder' : ''}`} aria-haspopup="listbox" aria-expanded={open} onClick={toggle} onKeyDown={onKeyDown}>
        <span className="custom-select-value">{selectedLabel || placeholder}</span>
        <span className="custom-select-arrow">▾</span>
      </button>

      {open && (
        <ul className="custom-select-options" role="listbox">
          {options.map((opt, idx) => (
            <li key={opt.value} role="option" aria-selected={opt.value===selected} className="custom-select-option" onClick={()=>onOptionClick(opt)}>
              {opt.label}
            </li>
          ))}
        </ul>
      )}

      <input type="hidden" name={name} value={selected} required={required} />
    </div>
  );
}
