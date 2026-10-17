import { Settings2 } from "lucide-react";

export default function SettingsPanel({ settings, setSettings }) {
  function update(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="panel settings-panel">
      <div className="panel-heading">
        <div>
          <h2>Reading settings</h2>
          <p>Adjust the pace to suit your delivery.</p>
        </div>
        <Settings2 size={20} className="muted-icon" />
      </div>

      <div className="setting-row">
        <label htmlFor="duration">Target duration</label>
        <span className="setting-value">{settings.duration} min</span>
      </div>
      <input
        id="duration"
        type="range"
        min="1"
        max="30"
        step="1"
        value={settings.duration}
        onChange={(event) => update("duration", Number(event.target.value))}
      />

      <div className="setting-row">
        <label htmlFor="speed">Speed adjustment</label>
        <span className="setting-value">{settings.speed.toFixed(1)}×</span>
      </div>
      <input
        id="speed"
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        value={settings.speed}
        onChange={(event) => update("speed", Number(event.target.value))}
      />
      <p className="field-help">
        1× follows your estimated duration. Adjust to read faster or slower.
      </p>

      <div className="setting-row">
        <label htmlFor="font-size">Text size</label>
        <span className="setting-value">{settings.fontSize}px</span>
      </div>
      <input
        id="font-size"
        type="range"
        min="20"
        max="56"
        step="2"
        value={settings.fontSize}
        onChange={(event) => update("fontSize", Number(event.target.value))}
      />

      <div className="setting-row">
        <label htmlFor="line-height">Line spacing</label>
        <span className="setting-value">{settings.lineHeight.toFixed(1)}</span>
      </div>
      <input
        id="line-height"
        type="range"
        min="1.2"
        max="2.2"
        step="0.1"
        value={settings.lineHeight}
        onChange={(event) => update("lineHeight", Number(event.target.value))}
      />

      <label className="toggle-row">
        <span>
          <strong>Mirror text</strong>
          <small>For a physical teleprompter mirror</small>
        </span>
        <input
          type="checkbox"
          checked={settings.mirror}
          onChange={(event) => update("mirror", event.target.checked)}
        />
      </label>
    </section>
  );
}
