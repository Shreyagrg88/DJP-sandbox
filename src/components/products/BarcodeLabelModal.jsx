import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import BarcodeLabel from "./BarcodeLabel";
import { getProductIdentifier, validateBarcodeValue } from "../../utils/barcode";
import "./barcodeLabel.css";

// Label sizes in mm. page: "A4" prints a small label at the top-left of an office sheet.
const PRESETS = {
  "50x25": { label: "50 × 25 mm", w: 50, h: 25, page: "label" },
  "38x25": { label: "38 × 25 mm", w: 38, h: 25, page: "label" },
  "75x38": { label: "75 × 38 mm", w: 75, h: 38, page: "label" },
  a4: { label: "A4 sheet (60 × 30 mm label)", w: 60, h: 30, page: "A4" },
};

const MM_TO_PX = 3.78; // approx. CSS pixels per millimetre

export default function BarcodeLabelModal({ product, onClose }) {
  const [presetKey, setPresetKey] = useState("50x25");
  const preset = PRESETS[presetKey];

  const code = useMemo(() => getProductIdentifier(product), [product]);
  const { valid, error } = useMemo(() => validateBarcodeValue(code), [code]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Screen preview only: enlarge the small label so it is readable.
  const pxW = preset.w * MM_TO_PX;
  const pxH = preset.h * MM_TO_PX;
  const scale = Math.min(2.2, 400 / pxW);

  const pageSize =
    preset.page === "A4" ? "A4 portrait" : `${preset.w}mm ${preset.h}mm`;

  return createPortal(
    <div className="bl-print-root">
      <style>{`@page { size: ${pageSize}; margin: 0; }`}</style>

      <div className="bl-backdrop" onClick={onClose}>
        <div className="bl-modal" onClick={(e) => e.stopPropagation()}>
          <div className="bl-header bl-no-print">
            <h3 className="bl-title">Print barcode label</h3>
            <button type="button" className="bl-btn" onClick={onClose}>✕</button>
          </div>

          {!valid ? (
            <div className="bl-error bl-no-print" role="alert">{error}</div>
          ) : (
            <>
              <div className="bl-controls bl-no-print">
                <label htmlFor="bl-size">Label size:</label>
                <select
                  id="bl-size"
                  value={presetKey}
                  onChange={(e) => setPresetKey(e.target.value)}
                >
                  {Object.entries(PRESETS).map(([k, p]) => (
                    <option key={k} value={k}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="bl-stage" style={{ minHeight: pxH * scale + 48 }}>
                <div className="bl-scale" style={{ transform: `scale(${scale})` }}>
                  <BarcodeLabel product={product} code={code} size={preset} />
                </div>
              </div>
            </>
          )}

          <div className="bl-actions bl-no-print">
            <button type="button" className="bl-btn" onClick={onClose}>Close</button>
            {valid && (
              <button
                type="button"
                className="bl-btn bl-btn-primary"
                onClick={() => window.print()}
              >
                Print / Save as PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}