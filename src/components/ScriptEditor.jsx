import { Clock3, FileText } from "lucide-react";

export default function ScriptEditor({
  script,
  onChange,
  wordCount,
  duration,
}) {
  return (
    <section className="panel editor-panel">
      <div className="panel-heading">
        <div>
          <h2>Script editor</h2>
          <p>Write or paste the words you want to read.</p>
        </div>
        <FileText size={20} className="muted-icon" />
      </div>

      <label className="field-label" htmlFor="script-title">
        Script title
      </label>
      <input
        id="script-title"
        className="text-input title-input"
        value={script.title}
        onChange={(event) => onChange({ ...script, title: event.target.value })}
        placeholder="Give your script a title"
      />

      <label className="field-label" htmlFor="script-content">
        Your content
      </label>
      <textarea
        id="script-content"
        className="script-textarea"
        value={script.content}
        onChange={(event) =>
          onChange({ ...script, content: event.target.value })
        }
        placeholder="Start writing your speech here..."
        spellCheck="true"
      />

      <div className="editor-footer">
        <span>{wordCount} words</span>
        <span className="editor-duration">
          <Clock3 size={14} />
          Approx. {duration} min
        </span>
      </div>
    </section>
  );
}
