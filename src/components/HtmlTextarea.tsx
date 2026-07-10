import { useRef, useState } from 'react';

type Tag = 'strong' | 'em' | 'br' | 'li';

interface Props {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export default function HtmlTextarea({ value, onChange, rows = 3, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  function wrapSelection(open: string, close: string) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);
    const next = value.substring(0, start) + open + selected + close + value.substring(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + open.length, end + open.length);
    });
  }

  function insertAtCursor(text: string) {
    const el = ref.current;
    if (!el) return;
    const pos = el.selectionStart;
    onChange(value.substring(0, pos) + text + value.substring(pos));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos + text.length, pos + text.length);
    });
  }

  function handleTag(tag: Tag) {
    if (tag === 'strong') wrapSelection('<strong>', '</strong>');
    else if (tag === 'em') wrapSelection('<em>', '</em>');
    else if (tag === 'br') insertAtCursor('<br>');
    else if (tag === 'li') insertAtCursor('<li> ');
  }

  return (
    <div className="html-editor">
      <div className="html-toolbar">
        <button type="button" className="ht-btn" onClick={() => handleTag('strong')} title="Negrita">
          <strong>B</strong>
        </button>
        <button type="button" className="ht-btn ht-italic" onClick={() => handleTag('em')} title="Cursiva">
          <em>I</em>
        </button>
        <button type="button" className="ht-btn" onClick={() => handleTag('br')} title="Salto de línea">
          ↵
        </button>
        <button type="button" className="ht-btn" onClick={() => handleTag('li')} title="Viñeta">
          •
        </button>
        <button type="button" className="ht-help-btn" onClick={() => setShowHelp(!showHelp)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          ¿Cómo usar?
        </button>
      </div>

      {showHelp && (
        <div className="html-help">
          <div className="html-help-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Guía rápida de formato
          </div>
          <div className="html-help-grid">
            {[
              { tag: 'strong' as Tag, icon: <strong>B</strong>, label: 'Negrita', code: '<strong>texto</strong>', tip: 'Resalta palabras clave. Ej: <strong>0% rechazos</strong>' },
              { tag: 'em' as Tag, icon: <em>I</em>, label: 'Cursiva', code: '<em>texto</em>', tip: 'Itálica sutil. Ej: <em>desde el primer diseño</em>' },
              { tag: 'br' as Tag, icon: <>↵</>, label: 'Salto de línea', code: '<br>', tip: 'Baja a la siguiente línea. No necesita cierre.' },
              { tag: 'li' as Tag, icon: <>•</>, label: 'Viñeta / Lista', code: '<li>texto</li>', tip: 'Ítem de lista. Ej: <li>Diseño BIM</li>' },
            ].map(({ tag, icon, label, code, tip }) => (
              <div key={tag} className="html-help-row">
                <button type="button" className="ht-demo" onClick={() => handleTag(tag)}>{icon}</button>
                <div>
                  <span className="hh-label">{label}</span>
                  <code>{code}</code>
                  <p>{tip}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="html-help-tip">
            <strong>Tip:</strong> Selecciona el texto que quieres formatear y pulsa un botón — el código se inserta automáticamente.
          </div>
        </div>
      )}

      <textarea
        ref={ref}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="html-textarea"
      />
    </div>
  );
}
