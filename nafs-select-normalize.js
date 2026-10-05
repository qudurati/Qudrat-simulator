// NAFS display normalization. Internal codes/values remain unchanged.
(function(){
'use strict';
function norm(v){
 if(typeof v!=='string')return v;
 return v
  .replace(/العلوم الطبيعية/g,'العلوم')
  .replace(/القراءة/g,'لغتي')
  .replace(/الصف\s*الثالث\s*المتوسط\s*\(\s*(?:التاسع|9|٩)\s*\)/g,'الثالث متوسط')
  .replace(/الصف\s*الثالث\s*المتوسط\s+(?:التاسع|9|٩)/g,'الثالث متوسط')
  .replace(/الثالث\s*متوسط\s+(?:التاسع|9|٩)/g,'الثالث متوسط');
}
function fix(el){
 if(!el||el.nodeType!==1)return;
 if(el.tagName==='OPTION'){el.textContent=norm(el.textContent);return;}
 if(el.hasAttribute('placeholder'))el.setAttribute('placeholder',norm(el.getAttribute('placeholder')));
 if(el.hasAttribute('title'))el.setAttribute('title',norm(el.getAttribute('title')));
 Array.from(el.childNodes||[]).forEach(n=>{if(n.nodeType===3)n.nodeValue=norm(n.nodeValue)});
}
function all(root){if(!root)return;if(root.nodeType===1)fix(root);root.querySelectorAll?.('*').forEach(fix)}
function start(){
 all(document.body);
 new MutationObserver(ms=>ms.forEach(m=>{
  if(m.type==='characterData')m.target.nodeValue=norm(m.target.nodeValue);
  m.addedNodes?.forEach(n=>{if(n.nodeType===3)n.nodeValue=norm(n.nodeValue);else all(n)});
 })).observe(document.body,{childList:true,subtree:true,characterData:true});
 window.nafsDisplayText=norm;
 window.nafsDisplaySubject=norm;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();