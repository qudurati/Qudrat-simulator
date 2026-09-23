(()=>{
  const $=id=>document.getElementById(id);
  const fmt=x=>x?new Intl.DateTimeFormat('ar-SA',{dateStyle:'long',timeStyle:'short'}).format(new Date(x)):'—';
  const esc=s=>{const d=document.createElement('div');d.textContent=s||'';return d.innerHTML};

  async function loadUnreadNotifications(){
    const box=$('notificationList'),badge=$('notifBadge');
    if(!box||!badge||typeof window.getQudratSupabase!=='function') return;
    const db=window.getQudratSupabase();
    const {data,error}=await db.rpc('owner_new_student_notifications');
    if(error){box.innerHTML='<small>تعذر تحميل الإشعارات.</small>';return;}
    const unread=(data||[]).filter(n=>!n.is_read);
    badge.textContent=unread.length;
    badge.className='notifBadge'+(unread.length?' show':'');
    if(!unread.length){box.innerHTML='<small>لا توجد تسجيلات جديدة.</small>';return;}
    box.innerHTML=unread.slice(0,10).map(n=>`<button type="button" class="notifItem" data-notification-id="${n.id}" style="display:block;width:100%;text-align:right;background:transparent;border:0;border-top:1px solid #edf2f7;cursor:pointer"><b>🟢 ${esc(n.title)}</b><span>${esc(n.message)}</span><br><small>${fmt(n.created_at)}</small></button>`).join('');
    box.querySelectorAll('[data-notification-id]').forEach(item=>{
      item.onclick=async()=>{
        item.disabled=true;
        const {error}=await db.rpc('owner_mark_student_notifications_read');
        if(error){item.disabled=false;return;}
        await loadUnreadNotifications();
      };
    });
  }

  function bind(){
    const refresh=$('refreshNotifs'),read=$('readNotifs');
    if(refresh) refresh.onclick=loadUnreadNotifications;
    if(read) read.onclick=async()=>{
      const db=window.getQudratSupabase();
      const {error}=await db.rpc('owner_mark_student_notifications_read');
      if(!error) await loadUnreadNotifications();
    };
    loadUnreadNotifications();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,1200));
  else setTimeout(bind,1200);
})();
