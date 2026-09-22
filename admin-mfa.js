(()=>{
  const MFA_KEY='qudrat_owner_mfa_verified_at';
  const MFA_GRACE_MS=60*60*1000;
  const card=()=>document.querySelector('#authScreen .authCard');
  const normalizeOtp=value=>String(value??'')
    .replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/\D/g,'')
    .slice(0,6);
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
  const sendErrorText=error=>{
    const message=String(error?.message||'خطأ غير معروف');
    const code=error?.code?` — ${error.code}`:'';
    const status=error?.status?` — HTTP ${error.status}`:'';
    return `تعذر إرسال الرمز: ${message}${code}${status}`;
  };
  window.requireOwnerMfa=async(db,session)=>{
    try{
      const email=session?.user?.email;
      if(!email)throw new Error('Missing owner email');
      const verifiedAt=Number(sessionStorage.getItem(MFA_KEY)||0);
      if(verifiedAt&&Date.now()-verifiedAt<MFA_GRACE_MS)return true;
      sessionStorage.removeItem(MFA_KEY);
      const box=showBox(`<hr style="margin:22px 0;border:0;border-top:1px solid #e5e7eb"><h2>رمز التحقق عبر البريد</h2><p class="muted">جارٍ إرسال رمز تحقق إلى بريد المالك <b dir="ltr">${email}</b>.</p><form id="ownerEmailCodeForm" hidden><label>رمز التحقق<input id="ownerEmailCode" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9٠-٩۰-۹]{6}" minlength="6" maxlength="6" placeholder="أدخل الرمز المكون من 6 أرقام" required></label><button class="primary wide" type="submit">تحقق ودخول</button></form><button class="textButton" id="ownerResendEmailCode" type="button" hidden>إرسال رمز جديد</button><p class="formMessage" id="ownerMfaMessage" role="status">جارٍ إرسال الرمز...</p><button class="textButton" id="ownerMfaLogout" type="button">إلغاء وتسجيل الخروج</button>`);
      const msg=box.querySelector('#ownerMfaMessage');
      const resendBtn=box.querySelector('#ownerResendEmailCode');
      const form=box.querySelector('#ownerEmailCodeForm');
      const codeInput=box.querySelector('#ownerEmailCode');
      let attempts=0;
      let sending=false;
      box.querySelector('#ownerMfaLogout').onclick=async()=>{sessionStorage.removeItem(MFA_KEY);await db.auth.signOut();location.reload()};
      const sendCode=async()=>{
        if(sending)return false;
        sending=true;msg.textContent='جارٍ إرسال الرمز...';resendBtn.disabled=true;
        const {error}=await db.auth.signInWithOtp({email,options:{shouldCreateUser:false}});
        sending=false;
        if(error){
          console.error('Owner OTP send error',error);
          msg.textContent=sendErrorText(error);
          resendBtn.hidden=false;resendBtn.disabled=false;return false;
        }
        attempts=0;codeInput.disabled=false;form.querySelector('button[type="submit"]').disabled=false;
        msg.textContent='تم إرسال الرمز. استخدم أحدث رسالة وصلتك؛ أي رمز أقدم لن يعمل.';form.hidden=false;resendBtn.hidden=false;resendBtn.disabled=false;codeInput.value='';codeInput.focus();return true;
      };
      resendBtn.onclick=sendCode;
      await sendCode();
      return await new Promise(resolve=>{
        form.onsubmit=async e=>{
          e.preventDefault();
          const btn=e.submitter,token=normalizeOtp(codeInput.value);
          codeInput.value=token;
          if(token.length!==6){msg.textContent='أدخل رمز التحقق المكون من 6 أرقام.';return}
          msg.textContent='جارٍ التحقق...';btn.disabled=true;
          const {data,error}=await db.auth.verifyOtp({email,token,type:'email'});
          if(error||!data?.session){
            console.error('Owner OTP verify error',error);
            attempts+=1;
            if(attempts>=5){msg.textContent='تم تجاوز 5 محاولات. اضغط «إرسال رمز جديد» ثم استخدم أحدث رسالة فقط.';codeInput.disabled=true;btn.disabled=true;resendBtn.hidden=false;resendBtn.disabled=false;return}
            const expired=/expired/i.test(error?.message||'');
            msg.textContent=expired?`انتهت صلاحية الرمز. أرسل رمزًا جديدًا. متبقي ${5-attempts} محاولات.`:`الرمز غير صحيح. تأكد من استخدام أحدث رسالة وصلتك. متبقي ${5-attempts} محاولات.`;
            btn.disabled=false;codeInput.select();return;
          }
          sessionStorage.setItem(MFA_KEY,String(Date.now()));
          msg.textContent='تم التحقق بنجاح.';resolve(true);
        };
      });
    }catch(err){
      console.error('Owner email verification error',err);
      const box=showBox('<h2>تعذر تشغيل التحقق عبر البريد</h2><p class="formMessage">سجّل الخروج ثم حاول مرة أخرى.</p><button class="textButton" id="ownerMfaLogout" type="button">تسجيل الخروج</button>');
      box.querySelector('#ownerMfaLogout').onclick=async()=>{sessionStorage.removeItem(MFA_KEY);await db.auth.signOut();location.reload()};
      return false;
    }
  };
})();

(()=>{
  const MFA_KEY='qudrat_owner_mfa_verified_at';
  const ready=()=>window.supabase&&window.SUPABASE_URL&&window.SUPABASE_PUBLISHABLE_KEY;
  const passkeyClient=()=>supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY,{auth:{experimental:{passkey:true}}});
  const friendlyError=err=>{
    const code=String(err?.code||'');
    if(code==='passkey_disabled')return 'مفتاح المرور غير مفعّل في إعدادات Supabase بعد.';
    if(code==='webauthn_credential_exists')return 'مفتاح المرور مسجل على هذا الجهاز مسبقًا.';
    if(code==='webauthn_credential_not_found')return 'لا يوجد مفتاح مرور مسجل لهذا الجهاز.';
    if(code==='webauthn_verification_failed')return 'تعذر التحقق من Face ID أو مفتاح المرور.';
    if(String(err?.name||'')==='NotAllowedError')return 'تم إلغاء Face ID أو انتهت مهلة التحقق.';
    return String(err?.message||'تعذر استخدام مفتاح المرور.');
  };
  function addLoginButton(){
    const form=document.getElementById('loginForm');
    if(!form||document.getElementById('ownerPasskeyLogin'))return;
    const btn=document.createElement('button');
    btn.id='ownerPasskeyLogin';btn.type='button';btn.className='primary wide';
    btn.style.cssText='margin-top:12px;background:#0f766e';
    btn.textContent='الدخول بـ Face ID / مفتاح المرور';
    form.insertAdjacentElement('afterend',btn);
    btn.onclick=async()=>{
      const msg=document.getElementById('authMessage');
      if(!ready()){msg.textContent='تعذر تهيئة تسجيل الدخول.';return}
      btn.disabled=true;msg.textContent='افتح Face ID للتحقق...';
      try{
        const client=passkeyClient();
        const {data,error}=await client.auth.signInWithPasskey();
        if(error)throw error;
        if(!data?.session)throw new Error('لم يتم إنشاء جلسة دخول.');
        const {data:allowed,error:ownerError}=await client.rpc('owner_dashboard_summary');
        if(ownerError||!allowed){await client.auth.signOut();throw new Error('هذا الحساب غير مخوّل للدخول إلى لوحة المالك.');}
        sessionStorage.setItem(MFA_KEY,String(Date.now()));
        location.reload();
      }catch(err){console.error('Owner passkey login error',err);msg.textContent=friendlyError(err);btn.disabled=false}
    };
  }
  function addEnrollButton(){
    const app=document.getElementById('app');
    if(!app||app.hidden||document.getElementById('ownerPasskeyEnroll'))return;
    const badge=document.querySelector('.ownerBadge');
    if(!badge)return;
    const btn=document.createElement('button');
    btn.id='ownerPasskeyEnroll';btn.type='button';
    btn.style.cssText='border:1px solid #cbd5e1;background:#fff;border-radius:10px;padding:8px 11px;font-weight:800;cursor:pointer;margin-inline-start:8px';
    btn.textContent='تفعيل Face ID';badge.insertAdjacentElement('afterend',btn);
    btn.onclick=async()=>{
      btn.disabled=true;const old=btn.textContent;btn.textContent='جارٍ التفعيل...';
      try{
        const client=passkeyClient();
        const {data,error}=await client.auth.registerPasskey();
        if(error)throw error;
        btn.textContent='✓ تم تفعيل Face ID';btn.disabled=true;
        alert('تم تسجيل مفتاح المرور بنجاح. في المرة القادمة يمكنك الدخول مباشرة باستخدام Face ID.');
      }catch(err){console.error('Owner passkey registration error',err);alert(friendlyError(err));btn.disabled=false;btn.textContent=old}
    };
  }
  function initPasskeys(){
    if(!window.PublicKeyCredential)return;
    addLoginButton();addEnrollButton();
    const app=document.getElementById('app');
    if(app)new MutationObserver(()=>addEnrollButton()).observe(app,{attributes:true,attributeFilter:['hidden']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initPasskeys);else initPasskeys();
})();