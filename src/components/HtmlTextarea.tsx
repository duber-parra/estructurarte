import { useState, useRef } from 'react';

interface HtmlTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

export default function HtmlTextarea({ value, onChange, placeholder, rows = 4, label }: HtmlTextareaProps) {
  const [showHelp, setShowHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertTag(openTag: string, closeTag: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = openTag + selectedText + closeTag;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    // Reposition cursor after state update
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length + selectedText.length + closeTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  }

  return (
    <div className="html-textarea-container" style={{ marginBottom: '1.25rem' }}>
      {label && <label style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
        <span>{label}</span>
      </label>}

      {/* Toolbar */}
      <div className="html-toolbar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg4)',
        border: '1px solid var(--border)',
        borderBottom: 'none',
        borderTopLeftRadius: 'var(--r)',
        borderTopRightRadius: 'var(--r)',
        padding: '0.4rem 0.6rem',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={() => insertTag('<strong>', '</strong>')}
            title="Negrita"
            className="toolbar-btn"
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.78rem'
            }}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertTag('<em>', '</em>')}
            title="Cursiva"
            className="toolbar-btn"
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontStyle: 'italic',
              fontSize: '0.78rem'
            }}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertTag('<br />', '')}
            title="Salto de Línea"
            className="toolbar-btn"
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.78rem'
            }}
          >
            ↵
          </button>
          <button
            type="button"
            onClick={() => insertTag('<li>', '</li>')}
            title="Viñeta / Lista"
            className="toolbar-btn"
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.78rem'
            }}
          >
            •
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="help-toggle-btn"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '600'
          }}
        >
          {showHelp ? '✕ Cerrar Ayuda' : '¿Cómo usar?'}
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          marginTop: 0
        }}
      />

      {/* Didactic Help Panel */}
      {showHelp && (
        <div className="html-help-panel" style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r)',
          padding: '1rem',
          marginTop: '0.5rem',
          fontSize: '0.78rem',
          lineHeight: '1.5',
          color: 'var(--dim)'
        }}>
          <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '0.8rem', fontFamily: 'var(--FM)' }}>Guía de Formato Rápido</h4>
          <p style={{ marginBottom: '0.8rem' }}>Usa los botones superiores seleccionando primero un texto, o haz clic directamente para insertar la etiqueta:</p>
          <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li>
              <strong style={{ color: 'var(--text)' }}>Botón B (Negrita):</strong> Inserta <code>&lt;strong&gt;texto&lt;/strong&gt;</code>. Resalta palabras clave.
              <br /><span style={{ opacity: 0.8 }}>Resultado: <strong>Texto destacado</strong></span>
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Botón I (Cursiva):</strong> Inserta <code>&lt;em&gt;texto&lt;/em&gt;</code>. Ideal para aclaraciones o énfasis.
              <br /><span style={{ opacity: 0.8 }}>Resultado: <em>Texto inclinado</em></span>
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Botón ↵ (Salto de línea):</strong> Inserta <code>&lt;br /&gt;</code>. Pasa el texto a la siguiente línea.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Botón • (Lista / Viñeta):</strong> Inserta <code>&lt;li&gt;elemento&lt;/li&gt;</code>. Úsalo para crear listas de beneficios.
            </li>
          </ul>
          <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border)', fontSize: '0.7rem' }}>
            💡 <strong style={{ color: 'var(--text)' }}>Tip:</strong> Puedes combinar etiquetas, ej: <code>&lt;strong&gt;&lt;em&gt;texto&lt;/em&gt;&lt;/strong&gt;</code>.
          </div>
        </div>
      )}
    </div>
  );
}
