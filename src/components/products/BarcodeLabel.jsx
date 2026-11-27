import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { formatWeight, formatStones } from "../../utils/barcode";

export default function BarcodeLabel({ product, code, size }) {
  const svgRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !code) return;

    try {
      JsBarcode(svg, code, {
        format: "CODE128",
        displayValue: false, // we print the code text ourselves below
        width: 2,            // width of the thinnest bar (in SVG units)
        height: 60,
        margin: 10,          // quiet zone on left and right
        background: "#ffffff",
        lineColor: "#000000",
      });

      // Make the SVG scale to any size: keep viewBox, drop fixed width/height.
      const w = parseFloat(svg.getAttribute("width"));
      const h = parseFloat(svg.getAttribute("height"));
      if (!svg.getAttribute("viewBox") && w && h) {
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      }
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.setAttribute("shape-rendering", "crispEdges");
      setFailed(false);
    } catch (err) {
      console.error("Barcode generation failed", err);
      setFailed(true);
    }
  }, [code]);

  const weight = formatWeight(product);
  const stones = formatStones(product);
  const detailLine = [product.purity, product.category, weight]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="bl-label"
      style={{ width: `${size.w}mm`, height: `${size.h}mm` }}
    >
      <div className="bl-name">{product.name}</div>
      {detailLine && <div className="bl-detail">{detailLine}</div>}
      {stones.length > 0 && <div className="bl-detail">{stones.join(", ")}</div>}
      <div className="bl-barcode">
        {failed ? <span className="bl-detail">Barcode failed</span> : <svg ref={svgRef} />}
      </div>
      <div className="bl-code">{code}</div>
    </div>
  );
}