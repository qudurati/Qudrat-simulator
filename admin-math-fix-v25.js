// Admin math renderer fix v25: use non-numeric hold keys so Arabic digit conversion cannot corrupt placeholders.
renderAdminMath=function(raw){
  let s=String(raw??'');
  const frac=(a,b)=>`<span dir="ltr" style="display:inline-flex;vertical-align:middle;flex-direction:column;align-items:center;line-height:1.05;margin:0 .15em"><span style="padding:0 .18em;border-bottom:1.5px solid currentColor">${esc(arDigits(a))}</span><span style="padding:0 .18em">${esc(arDigits(b))}</span></span>`;
  const sqrt=x=>`<span dir="ltr" style="display:inline-flex;align-items:flex-start;vertical-align:middle"><span style="font-size:1.15em;line-height:1">√</span><span style="border-top:1.5px solid currentColor;padding:0 .14em">${esc(arDigits(x))}</span></span>`;
  const pow=(a,b)=>`<span dir="ltr" style="display:inline-block;white-space:nowrap"><span>${esc(arDigits(a))}</span><sup style="font-size:.72em;line-height:0">${esc(arDigits(b))}</sup></span>`;
  const holds=[];
  const hold=h=>{const k='\uE000'+String.fromCharCode(0xE100+holds.length)+'\uE001';holds.push([k,h]);return k};
  s=s.replace(/\{\{\s*frac\s*:\s*([^}:]+)\s*:\s*([^}]+)\}\}/gi,(_,a,b)=>hold(frac(a,b)))
     .replace(/\{\{\s*([^}:]+)\s*:\s*([^}:]+)\s*:\s*frac\s*\}\}/gi,(_,a,b)=>hold(frac(a,b)))
     .replace(/\{\{\s*sqrt\s*:\s*([^}]+)\}\}/gi,(_,x)=>hold(sqrt(x)))
     .replace(/\{\{\s*([^}:]+)\s*:\s*sqrt\s*\}\}/gi,(_,x)=>hold(sqrt(x)))
     .replace(/\{\{\s*pow\s*:\s*([^}:]+)\s*:\s*([^}]+)\}\}/gi,(_,a,b)=>hold(pow(a,b)))
     .replace(/\{\{\s*([^}:]+)\s*:\s*([^}:]+)\s*:\s*pow\s*\}\}/gi,(_,a,b)=>hold(pow(a,b)))
     .replace(/([0-9٠-٩]+)\s*\/\s*([0-9٠-٩]+)/g,(_,a,b)=>hold(frac(a,b)))
     .replace(/√\s*([0-9٠-٩]+)/g,(_,x)=>hold(sqrt(x)))
     .replace(/([0-9٠-٩]+)\s*\^\s*([0-9٠-٩]+)/g,(_,a,b)=>hold(pow(a,b)));
  s=esc(arDigits(s));
  holds.forEach(([k,h])=>{s=s.split(k).join(h)});
  return s;
};