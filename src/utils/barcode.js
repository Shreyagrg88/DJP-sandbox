// CODE128 can encode printable ASCII characters
const CODE128_PATTERN =  /^[\x20-\x7E]+$/;
const MAX_LENGTH = 40;

//pricks product's existing identifier. nothing is generated.
//order = priority
export function getProductIdentifier(product) {
    if (!product) return null;
    const candidates = [
        product.barcode,
        product.barcode_id,
        product.tag_code,
        product.product_code,
    ];
    for (const c of candidates){
        if (c !== undefined && c !== null && String(c).trim() !== "") {
            return String(c).trim();
        }
    }
    return null;
}

// Returns { valid, error }. The UI uses this to block printing.
export function validateBarcodeValue(value){
    if(!value){
        return {
          valid: false,
          error: 
            "This product has no barcode or tag code, so label cannot be printed. Plesde add a code to the product first.",
        };
    }
    if (!CODE128_PATTERN.test(value)){
        return {
          valid: false,
          error: `The code "${value}" contains characters that cannot be encoded in Code 128.`,
        };
    }
    if (value.length > MAX_LENGTH) {
    return {
      valid: false,
      error: `The code "${value}" is too long to fit on a label (max ${MAX_LENGTH} characters).`,
    };
    }
    return {valid: true, error: null};
}

//keeps the unit excactly like it is stored (gm, lal,..) returns null if empty 
export function formatWeight(product){
    const w = product?.weight;
    if (w == undefined || w == null || w == "" || Number(w) == 0 ) return null;
    const unit = product.weight_unit ? ` ${product.weight_unit}` : "";
    return `${w}${unit}`;
}


// Supports an array like [{name, weight, unit}] or a plain string.
// Returns an array of display strings, e.g. ["Diamond 0.19 ct"].
export function formatStones(product) {
  const stones = product?.stones;
  if (!stones) return [];
  if (typeof stones === "string") return stones.trim() ? [stones.trim()] : [];
  if (!Array.isArray(stones)) return [];
  return stones
    .map((s) => {
      const name = s.name || s.type || "";
      const weight =
        s.weight !== undefined && s.weight !== null && s.weight !== ""
          ? `${s.weight}${s.unit ? " " + s.unit : ""}`
          : "";
      return [name, weight].filter(Boolean).join(" ");
    })
    .filter(Boolean);
}