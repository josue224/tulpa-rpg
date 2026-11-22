/* TULPA RPG — primeira etapa de integração Supabase: autenticação real */
(()=>{
 const SUPABASE_URL='https://dougaphmszjinwkptlxz.supabase.co';
 const SUPABASE_PUBLISHABLE_KEY='sb_publishable_0Lh0nDU6H_cgz1wMBKbatA_wCxZSXrT';
 /* endereço completo do app (funciona em subpasta, ex.: josue224.github.io/tulpa-rpg/) */
 const APP_URL=location.origin+location.pathname.replace(/index\.html$/,'');
 /* link de "esqueci a senha" chega com type=recovery; guardado antes que o cliente limpe a URL */
 const RECOVERY_LINK=/type=recovery/.test(location.hash+location.search);
 const supabaseClient=window.supabase?.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
   auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},
   /* o padrão (10/s) descartava mensagens do mapa, da voz e dos mini-games */
   realtime:{params:{eventsPerSecond:40}}
 });
 window.tulpaSupabase=supabaseClient;
 window.tulpaCloudUser=null;
 window.tulpaCloudRole=null;
 /* Recuperação de senha: quem abre o link do e-mail define a nova senha aqui */
 let recoveryShown=false;
 const showPasswordReset=()=>{
   if(recoveryShown||!supabaseClient)return;recoveryShown=true;
   const box=document.createElement('div');box.id='tulpaResetBox';
   box.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px';
   box.innerHTML=`<div class="panel" style="width:100%;max-width:380px"><h2 style="margin-bottom:8px">Criar nova senha</h2><p class="sub">Digite a nova senha da sua conta (mínimo de 8 caracteres).</p><div class="field" style="margin-top:10px"><input class="portal-input" id="tulpaNewPass" type="password" autocomplete="new-password" placeholder="Nova senha"></div><div class="field" style="margin-top:8px"><input class="portal-input" id="tulpaNewPass2" type="password" autocomplete="new-password" placeholder="Repita a nova senha"></div><p class="sub" id="tulpaResetMsg" style="margin-top:8px;color:#c0392b"></p><div class="inline" style="margin-top:10px;gap:8px"><button class="btn primary" id="tulpaSaveNewPass" type="button">Salvar senha</button></div></div>`;
   document.body.appendChild(box);
   const msg=t=>{box.querySelector('#tulpaResetMsg').textContent=t};
   const btn=box.querySelector('#tulpaSaveNewPass');
   box.querySelector('#tulpaNewPass2').addEventListener('keydown',e=>{if(e.key==='Enter')btn.click()});
   btn.onclick=async()=>{
     const p1=box.querySelector('#tulpaNewPass').value,p2=box.querySelector('#tulpaNewPass2').value;
     if(p1.length<8){msg('A senha precisa ter pelo menos 8 caracteres.');return}
     if(p1!==p2){msg('As duas senhas não são iguais.');return}
     btn.disabled=true;msg('');
     try{
       const {error}=await supabaseClient.auth.updateUser({password:p1});
       if(error)throw error;
       box.remove();
       if(typeof toast==='function')toast('Senha alterada! Você já está conectado.');
     }catch(err){msg(err?.message||String(err))}finally{btn.disabled=false}
   };
 };
 supabaseClient?.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY')setTimeout(showPasswordReset,0)});

 const el=id=>document.getElementById(id);
 const setCloudStatus=(msg,ok=false)=>{
   let n=el('tulpaCloudStatus');
   if(!n){n=document.createElement('span');n.id='tulpaCloudStatus';n.className='pill';document.querySelector('.top-actions')?.prepend(n)}
   n.textContent=msg;n.style.borderColor=ok?'#397b65':'#8a7042';n.style.color=ok?'#9ce0c0':'#e6c58b';
 };
 const showAuthError=err=>{
   console.error('[Tulpa/Supabase]',err);
   const msg=err?.message||'Não foi possível concluir a operação.';
   if(typeof toast==='function')toast(msg);
   else alert(msg);
 };
 const normalizeProfileRole=value=>{
  const normalized=String(value??'').trim().toLocaleLowerCase('pt-BR')
   .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\s_-]+/g,'');
  if(['master','mestre','gamemaster','gm'].includes(normalized))return 'master';
  if(['player','jogador'].includes(normalized))return 'player';
  return null;
 };
 window.tulpaNormalizeProfileRole=normalizeProfileRole;
 const fetchProfile=async user=>{
   const {data:profile,error}=await supabaseClient.from('profiles').select('id,display_name,role').eq('id',user.id).single();
   if(error)throw error;
   return profile;
 };
 const finishLogin=async(user)=>{
   const profile=await fetchProfile(user);
   const role=normalizeProfileRole(profile.role);
   if(!role)throw new Error('Função do perfil não reconhecida. Confira o campo profiles.role no Supabase.');
   window.tulpaCloudUser=user;
   window.tulpaCloudRole=role;
   // User UUID replaces local PIN identity. It is stable across browsers/devices.
   openDashboard(role,user.id);
   setCloudStatus('Nuvem conectada · '+(user.email||''),true);
   if(typeof toast==='function')toast('Sessão conectada: '+(profile.display_name||user.email));
 };
 window.tulpaFinishLogin=finishLogin;

 // Replace legacy PIN/master-password flow with Supabase email/password auth.
 loginScreen=function(role){
   portalRole=role;
   el('portalHome').classList.add('hide');
   el('portalLogin').classList.remove('hide');
   el('loginEyebrow').textContent=role==='master'?'ACESSO DO MESTRE':'ACESSO DO PLAYER';
   el('loginTitle').textContent='Entre ou crie sua conta';
   el('loginFields').innerHTML=`
    <div class="field" style="margin-top:12px"><label class="field-label">E-mail</label><input class="portal-input" id="tulpaAuthEmail" type="email" autocomplete="email" placeholder="voce@exemplo.com" required></div>
    <div class="field" style="margin-top:10px"><label class="field-label">Senha</label><input class="portal-input" id="tulpaAuthPassword" type="password" autocomplete="current-password" placeholder="Mínimo de 8 caracteres" required></div>
    <div class="field" style="margin-top:10px"><label class="field-label">Nome (para cadastro)</label><input class="portal-input" id="tulpaAuthName" maxlength="60" placeholder="Seu nome"></div>
    <p class="sub" style="margin-top:10px">A mesma conta funciona em qualquer aparelho. Para entrar como Mestre, sua conta precisa ter sido autorizada pelo administrador da campanha.</p>
    <div class="inline" style="margin-top:12px;gap:8px"><button class="btn primary" id="tulpaSignIn" type="button">Entrar</button><button class="btn" id="tulpaSignUp" type="button">Criar conta</button><button class="btn" id="tulpaResendConfirm" type="button">Reenviar confirmação</button><button class="btn" id="tulpaForgot" type="button">Esqueci a senha</button></div>`;
   el('loginContinue').classList.add('hide');
   const email=()=>el('tulpaAuthEmail').value.trim().toLowerCase();
   const password=()=>el('tulpaAuthPassword').value;
   el('tulpaSignIn').onclick=async()=>{
     if(!supabaseClient){showAuthError(new Error('Não foi possível carregar o cliente Supabase. Verifique sua conexão.'));return}
     if(!email()||!password()){toast('Informe e-mail e senha.');return}
     el('tulpaSignIn').disabled=true;
     try{
       const {data,error}=await supabaseClient.auth.signInWithPassword({email:email(),password:password()});
       if(error)throw error;
       await finishLogin(data.user);
     }catch(err){showAuthError(err)}finally{el('tulpaSignIn').disabled=false}
   };
   el('tulpaSignUp').onclick=async()=>{
     if(!supabaseClient){showAuthError(new Error('Cliente Supabase indisponível.'));return}
     if(!email()||password().length<8){toast('Informe um e-mail válido e uma senha com pelo menos 8 caracteres.');return}
     el('tulpaSignUp').disabled=true;
     try{
       const display_name=el('tulpaAuthName').value.trim()||email().split('@')[0];
        const {data,error}=await supabaseClient.auth.signUp({email:email(),password:password(),options:{emailRedirectTo:APP_URL,data:{display_name}}});
       if(error)throw error;
       if(data.session){await finishLogin(data.user)}
       else toast('Cadastro iniciado! Confirme seu e-mail e depois entre com sua senha.');
     }catch(err){showAuthError(err)}finally{el('tulpaSignUp').disabled=false}
   };
    el('tulpaResendConfirm').onclick=async()=>{
      if(!supabaseClient){showAuthError(new Error('Cliente Supabase indisponível.'));return}
      if(!email()){toast('Informe o e-mail do cadastro para reenviar a confirmação.');return}
      const button=el('tulpaResendConfirm');button.disabled=true;
      try{
        const {error}=await supabaseClient.auth.resend({type:'signup',email:email(),options:{emailRedirectTo:APP_URL}});
        if(error)throw error;
        toast('Se houver um cadastro aguardando confirmação, um novo link foi enviado. Confira também o spam.');
      }catch(err){showAuthError(err)}finally{button.disabled=false}
    };
    el('tulpaForgot').onclick=async()=>{
      if(!supabaseClient){showAuthError(new Error('Cliente Supabase indisponível.'));return}
      if(!email()){toast('Digite seu e-mail no campo acima e clique de novo em "Esqueci a senha".');el('tulpaAuthEmail').focus();return}
      const button=el('tulpaForgot');button.disabled=true;
      try{
        const {error}=await supabaseClient.auth.resetPasswordForEmail(email(),{redirectTo:APP_URL});
        if(error)throw error;
        toast('Se esse e-mail tiver conta, enviamos um link para criar uma nova senha. Confira também o spam.');
      }catch(err){showAuthError(err)}finally{button.disabled=false}
    };
   el('tulpaAuthPassword').addEventListener('keydown',e=>{if(e.key==='Enter')el('tulpaSignIn').click()});
 };
 // Logout really terminates the Supabase session.
 const logout=el('portalLogout');
 if(logout)logout.onclick=async()=>{
   try{await supabaseClient.auth.signOut()}catch(err){showAuthError(err)}
   window.tulpaCloudUser=null;window.tulpaCloudRole=null;portalRole='';window.currentPlayerId=null;
   setCloudStatus('Desconectado');portalHome();
 };
 // Restore a persisted session when this app is opened on another browser/device.
 (async()=>{
   if(!supabaseClient){setCloudStatus('Cliente Supabase indisponível');return}
   setCloudStatus('Conectando à nuvem…');
   try{
     const {data:{session}}=await supabaseClient.auth.getSession();
     if(session?.user){if(RECOVERY_LINK)showPasswordReset();await finishLogin(session.user)}
     else setCloudStatus('Não conectado');
   }catch(err){console.error(err);setCloudStatus('Falha na autenticação')}
 })();
})();
