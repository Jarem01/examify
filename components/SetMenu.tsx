'use client';

import { useEffect, useRef, useState } from 'react';

interface SetMenuProps {
  onEdit: () => void;
  onCopy: () => void;
  onPrint: () => void;
  onCombine: () => void;
  onExport: () => void;
  onDelete: () => void;
  title: string;
}

function Glyph({ path }: { path: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  edit: 'M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z',
  copy: 'M9 9h9v12H9zM6 15H4V3h11v2',
  print: 'M7 8V3h10v5M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z',
  combine: 'M4 6h7v7H4zM13 11h7v7h-7zM11 9l3 3',
  export: 'M12 3v12M8 11l4 4 4-4M4 19h16',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
};

export default function SetMenu({
  onEdit,
  onCopy,
  onPrint,
  onCombine,
  onExport,
  onDelete,
  title,
}: SetMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setConfirming(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const run = (action: () => void) => {
    setOpen(false);
    setConfirming(false);
    action();
  };

  return (
    <div className="menu-wrap" ref={wrap}>
      <button
        type="button"
        className="btn btn-secondary"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More options for this set"
        title="More"
        onClick={() => {
          setOpen((value) => !value);
          setConfirming(false);
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>···</span>
      </button>

      {open ? (
        <div className="menu" role="menu" aria-label={`Options for ${title}`}>
          <button type="button" role="menuitem" onClick={() => run(onEdit)}>
            <Glyph path={ICONS.edit} /> Edit
          </button>
          <button type="button" role="menuitem" onClick={() => run(onCopy)}>
            <Glyph path={ICONS.copy} /> Make a copy
          </button>
          <button type="button" role="menuitem" onClick={() => run(onPrint)}>
            <Glyph path={ICONS.print} /> Print
          </button>
          <button type="button" role="menuitem" onClick={() => run(onCombine)}>
            <Glyph path={ICONS.combine} /> Combine
          </button>
          <button type="button" role="menuitem" onClick={() => run(onExport)}>
            <Glyph path={ICONS.export} /> Export
          </button>
          <div className="menu-sep" />
          {confirming ? (
            <div className="menu-confirm">
              <p>Delete this set? This can’t be undone.</p>
              <div className="row" style={{ gap: 8 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => run(onDelete)}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <button type="button" role="menuitem" className="danger" onClick={() => setConfirming(true)}>
              <Glyph path={ICONS.trash} /> Delete
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
