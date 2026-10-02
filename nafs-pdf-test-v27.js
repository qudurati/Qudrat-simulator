/* fresh evidence UI only - PDF engine is loaded once by the main page */
(function(){
window.NAFS_TEST_EVIDENCE=window.NAFS_TEST_EVIDENCE||[];
function boot(){
 const old=document.getElementById('nafsEvidenceBox');if(old)old.remove();
 const actions=document.querySelector('.actions');if(!actions)return;
 const box=document.createElement('div');box.id='nafsEvidenceBox';box.style.cssText='margin-top:16px;border:1px solid #dbe3dd;border-radius:14px;padding:14px;background:#f9fbfa';
 box.innerHTML='<div style="font-weight:800;margin-bottom:6px">شواهد التقرير التجريبي (اختياري)</div><label style="display:inline-block;background:#218b55;color:white;padding:11px 18px;border-radius:10px;font-weight:800;cursor:pointer;margin-bottom:10px">اختيار حتى 4 صور دفعة واحدة<input id="evPick27" type="file" accept="image/*" multiple style="display:none"></label><div id="evGrid27" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px"></div>';
 actions.parentNode.insertBefore(box,actions);document.getElementById('evPick27').onchange=pick;draw();
}
function pick(e){const fs=Array.from(e.target.files||[]).slice(0,4);window.NAFS_TEST_EVIDENCE=[];let n=0;if(!fs.length)return draw();fs.forEach((f,i)=>{const r=new FileReader();r.onload=()=>{window.NAFS_TEST_EVIDENCE[i]=r.result;if(++n===fs.length)draw()};r.readAsDataURL(f)});e.target.value=''}
function draw(){const g=document.getElementById('evGrid27');if(!g)return;g.innerHTML='';for(let i=0;i<4;i++){const d=document.createElement('div');d.style.cssText='aspect-ratio:1/1;border:1px dashed #b9c9c1;border-radius:10px;overflow:hidden;position:relative;background:#fff;display:flex;align-items:center;justify-content:center';const s=window.NAFS_TEST_EVIDENCE[i];d.innerHTML=s?'<img src="'+s+'" style="width:100%;height:100%;object-fit:cover"><button type="button" data-x="'+i+'" style="position:absolute;top:5px;left:5px;border:0;border-radius:7px;padding:4px 8px;background:white;color:#a83232;font-weight:800">حذف</button>':'<span style="color:#98a2b3;font-size:12px">صورة '+(i+1)+'</span>';g.appendChild(d)}g.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{window.NAFS_TEST_EVIDENCE.splice(+b.dataset.x,1);draw()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();