import { useState, useRef, useEffect } from 'react';

interface HtmlTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

export default function HtmlTextarea({ value, onChange, placeholder, rows = 4, label }: HtmlTextareaProps) {
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [showHelp, setShowHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync value to editable div only when not focused or when switching mode to avoid cursor reset
  useEffect(() => {
    if (editableRef.current && !isFocused) {
      editableRef.current.innerHTML = value || '';
    }
  }, [value, isFocused, mode]);

  function handleEditableInput(e: React.FormEvent<HTMLDivElement>) {
    const html = e.currentTarget.innerHTML;
    // Keep raw value in sync
    onChange(html === '<br>' ? '' : html);
  }

  function executeCommand(command: string, arg: string = '') {
    document.execCommand(command, false, arg);
    if (editableRef.current) {
      onChange(editableRef.current.innerHTML);
    }
  }

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

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length + selectedText.length + closeTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  }

  return (
    <div className="html-textarea-container" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        {label && <label style={{ margin: 0 }}>{label}</label>}
        
        {/* Editor Mode Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg4)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '2px',
          gap: '2px'
        }}>
          <button
            type="button"
            onClick={() => setMode('visual')}
            style={{
              background: mode === 'visual' ? 'var(--accent)' : 'transparent',
              color: mode === 'visual' ? '#000' : 'var(--dim)',
              border: 'none',
              borderRadius: '4px',
              padding: '0.2rem 0.6rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.15s ease'
            }}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode('code')}
            style={{
              background: mode === 'code' ? 'var(--accent)' : 'transparent',
              color: mode === 'code' ? '#000' : 'var(--dim)',
              border: 'none',
              borderRadius: '4px',
              padding: '0.2rem 0.6rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.15s ease'
            }}
          >
            Código HTML
          </button>
        </div>
      </div>

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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => mode === 'visual' ? executeCommand('bold') : insertTag('<strong>', '</strong>')}
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => mode === 'visual' ? executeCommand('italic') : insertTag('<em>', '</em>')}
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => mode === 'visual' ? executeCommand('insertHTML', '<br>') : insertTag('<br />', '')}
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => mode === 'visual' ? executeCommand('insertUnorderedList') : insertTag('<li>', '</li>')}
            title="Lista / Viñeta"
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

      {/* Editor Content Area */}
      {mode === 'visual' ? (
        <div
          ref={editableRef}
          contentEditable
          onInput={handleEditableInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-placeholder={placeholder}
          className="html-editor-editable"
          style={{
            minHeight: `${rows * 26}px`,
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        />
      ) : (
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
      )}

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
          <p style={{ marginBottom: '0.8rem' }}>Usa los botones superiores seleccionando primero un texto para aplicar el formato:</p>
          <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li>
              <strong style={{ color: 'var(--text)' }}>Botón B (Negrita):</strong> Hace que el texto seleccionado sea más grueso.
              <br /><span style={{ opacity: 0.8 }}>Ejemplo: <strong>Texto destacado</strong></span>
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Botón I (Cursiva):</strong> Inclina el texto seleccionado para dar énfasis.
              <br /><span style={{ opacity: 0.8 }}>Ejemplo: <em>Texto inclinado</em></span>
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Botón ↵ (Salto de línea):</strong> Pasa el texto al siguiente renglón.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Botón • (Lista / Viñeta):</strong> Crea una lista ordenada por puntos para enumerar beneficios o elementos.
            </li>
          </ul>
          <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border)', fontSize: '0.7rem' }}>
            💡 <strong style={{ color: 'var(--text)' }}>Tip:</strong> En el modo **Visual**, verás directamente el formato aplicado ocultando los códigos HTML. En el modo **Código HTML** puedes ver y editar las etiquetas en texto plano si lo deseas.
          </div>
        </div>
      )}
    </div>
  );
}
