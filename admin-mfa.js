(()=>{
  const card=()=>document.querySelector('#authScreen .authCard');
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function showBox(html){
    document.body.classList.remove('authenticated');
    document.getElementById('authScreen').hidden=false;
    document.getElementById('app').hidden=true;
    const c=card();
    c.querySelector('#loginForm')?.setAttribute('hidden','');
    c.querySelector('#firstAccountBtn')?.setAttribute('hidden','');
    let box=document.getElementById('ownerMfaBox');
    if(!box){box=document.createElement('div');box.id='ownerMfaBox';c.appendChild(box)}
    box.innerHTML=html;
    return box;
  }
  async function verifyFactor(db,factorId,code){
    const ch=await db.auth.mfa.challenge({factorId});
    if(ch.error)throw ch.error;
    const vr=await db.auth.mfa.verify({factorId,challengeId:ch.data.id,code});
    if(vr.error)throw vr.error;
    return true;
  }
  function codeForm(title,text,extra=''){
    const box=showBox(`<hr style="margin:22px 0;border:0;border-top:1px solid #e5e7eb"><h2>${title}</h2><p class="muted">${text}</p>${extra}<form id="ownerMfaForm"><label>رمز التحقق<input id="ownerMfaCode" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" placeholder="000000" required></label><button class="primary wide" type="submit">تحقق ودخول</button></form><p class="formMessage" id="ownerMfaMessage" role="status"></p><button class="textButton" id="ownerMfaLogout" type="button">إلغاء وتسجيل الخروج</button>`);
    return box;
  }
  window.requireOwnerMfa=async(db,session)=>{
    try{
      const aal=await db.auth.mfa.getAuthenticatorAssuranceLevel();
      if(aal.error)throw aal.error;
      if(aal.data?.currentLevel==='aal2')return true;
      const listed=await db.auth.mfa.listFactors();
      if(listed.error)throw listed.error;
      let factor=(listed.data?.totp||[]).find(f=>f.status==='verified');
      let enrolling=false,qr='',secret='';
      if(!factor){
        enrolling=true;
        for(const stale of (listed.data?.totp||[]).filter(f=>f.status!=='verified')) await db.auth.mfa.unenroll({factorId:stale.id});
        const en=await db.auth.mfa.enroll({factorType:'totp',friendlyName:'Qudrati Owner'});
        if(en.error)throw en.error;
        factor=en.data;qr=en.data?.totp?.qr_code||'';secret=en.data?.totp?.secret||'';
      }
      const extra=enrolling?`<div style="text-align:center;margin:16px 0"><p><b>أول مرة فقط:</b> افتح تطبيق المصادقة مثل Google Authenticator أو Microsoft Authenticator ثم امسح الرمز.</p>${qr?`<img src="${esc(qr)}" alt="QR للمصادقة" style="width:210px;max-width:80%;background:white;padding:8px;border-radius:12px">`:''}${secret?`<p style="word-break:break-all"><small>أو أدخل المفتاح يدويًا:</small><br><code dir="ltr">${esc(secret)}</code></p>`:''}</div>`:'';
      const box=codeForm(enrolling?'تفعيل التحقق بخطوتين':'التحقق بخطوتين',enrolling?'اربط تطبيق المصادقة ثم أدخل الرمز المكوّن من 6 أرقام.':'أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة.',extra);
      box.querySelector('#ownerMfaLogout').onclick=async()=>{await db.auth.signOut();location.reload()};
      return await new Promise(resolve=>{
        box.querySelector('#ownerMfaForm').onsubmit=async e=>{
          e.preventDefault();const msg=box.querySelector('#ownerMfaMessage'),btn=e.submitter,code=box.querySelector('#ownerMfaCode').value.trim();
          msg.textContent='جارٍ التحقق...';btn.disabled=true;
          try{await verifyFactor(db,factor.id,code);msg.textContent='تم التحقق بنجاح.';resolve(true)}
          catch(err){msg.textContent='الرمز غير صحيح أو انتهت صلاحيته. حاول مرة أخرى.';btn.disabled=false;box.querySelector('#ownerMfaCode').select()}
        };
      });
    }catch(err){
      console.error('Owner MFA error',err);
      const box=showBox('<h2>تعذر تشغيل التحقق بخطوتين</h2><p class="formMessage">تعذر إعداد حماية لوحة المالك. سجّل الخروج ثم حاول مرة أخرى.</p><button class="textButton" id="ownerMfaLogout" type="button">تسجيل الخروج</button>');
      box.querySelector('#ownerMfaLogout').onclick=async()=>{await db.auth.signOut();location.reload()};
      return false;
    }
  };
})();