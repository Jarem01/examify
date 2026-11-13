import type { StudySet } from './types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fileName(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'study-set';
}

/** Tab-separated, which the importer reads back directly. */
export function setToTsv(set: StudySet): string {
  return set.terms
    .map((term) => `${term.term.replace(/\t/g, ' ')}\t${term.definition.replace(/\t/g, ' ')}`)
    .join('\n');
}

export function downloadSet(set: StudySet): void {
  const blob = new Blob([setToTsv(set)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName(set.title)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printSet(set: StudySet): void {
  const rows = set.terms
    .map(
      (term, index) =>
        `<tr><td class="n">${index + 1}</td><td>${escapeHtml(term.term)}</td><td>${escapeHtml(
          term.definition,
        )}</td></tr>`,
    )
    .join('');
  const win = window.open('', '_blank', 'width=840,height=920');
  if (!win) return;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(
    set.title,
  )}</title><style>
    body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #10102b; margin: 32px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    p.meta { color: #55556e; margin: 0 0 20px; font-size: 13px; }
    table { border-collapse: collapse; width: 100%; font-size: 13px; }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #dcdce6; vertical-align: top; }
    th { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #55556e; }
    td.n { color: #8a8aa3; width: 34px; }
  </style></head><body>
    <h1>${escapeHtml(set.title)}</h1>
    <p class="meta">${set.terms.length} terms${set.description ? ` · ${escapeHtml(set.description)}` : ''}</p>
    <table><thead><tr><th>#</th><th>Term</th><th>Definition</th></tr></thead><tbody>${rows}</tbody></table>
  </body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

