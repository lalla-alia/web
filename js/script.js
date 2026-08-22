const SUPABASE_URL = 'https://karftzjwbmknyditmuoc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthcmZ0emp3Ym1rbnlkaXRtdW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDEwNzMsImV4cCI6MjEwMjQ3NzA3M30.qApKM6CBT-SFB-g6AZUhYwiOz-mw3mxKUBt8ujzOagY';

const SUPA_TABLE = 'site_data';
const SUPA_ROW_ID = 'main';

/* تنقية أي محتوى HTML قادم من قاعدة البيانات قبل عرضه، لمنع هجمات XSS
   في حال تسرّب/تلاعب بالمحتوى المخزّن (إجابات الأسئلة أو محتوى الصفحات) */
function sanitizeHtml(html){
  if(typeof DOMPurify === 'undefined') return html || '';
  return DOMPurify.sanitize(html || '');
}
const supaEnabled = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
const supaClient = supaEnabled ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const ICONS = {
  bold: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  italic: '<svg viewBox="0 0 24 24" width="16" height="16"><line x1="14" y1="5" x2="10" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="5" x2="9" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="19" x2="8" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  underline: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 4v7a5 5 0 0 0 10 0V4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="20" x2="18" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  alignRight: '<svg viewBox="0 0 24 24" width="16" height="16"><line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  alignCenter: '<svg viewBox="0 0 24 24" width="16" height="16"><line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  alignLeft: '<svg viewBox="0 0 24 24" width="16" height="16"><line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="12" x2="15" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  clear: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M16 3l5 5-9 9H7l-4-4 9-9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="7" y1="21" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  image: '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="10" r="1.4" fill="currentColor"/><path d="M21 16l-5-5-4 4-3-3-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  video: '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="3" y="6" width="13" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 10l5-3v10l-5-3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  link: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 15l6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M11 6l1-1a4 4 0 0 1 6 6l-1 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M13 18l-1 1a4 4 0 0 1-6-6l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l7 6-7 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><line x1="20" y1="20" x2="15.3" y2="15.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  ask: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 5h16v11H8l-4 4V5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="12" y1="7.5" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9.2" y1="10.25" x2="14.8" y2="10.25" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  user: '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 20c0-3.6 3.2-6.2 7-6.2s7 2.6 7 6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="18" height="18"><line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  up: '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 5v14M18 13l-6 6-6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  doc: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 3h7l4 4v14H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="10" y1="12" x2="17" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="16" x2="17" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  question: '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.3 9.3a2.7 2.7 0 1 1 3.7 2.5c-.9.4-1 1.1-1 1.9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1" fill="currentColor"/></svg>'
};

const STORAGE_KEY = 'offline_site_data_v6';

function defaultData(){
  return {
    admin:false,
    pages:[
      {id:'home', title:'الرئيسية', fixed:true, type:'hub', content:'', children:[]},
      {id:'questions', title:'الأسئلة', fixed:true, type:'hub', content:'', children:[
        {id:'q_general', title:'عام', type:'qa', qa:[
          {q:'ما هو هذا الموقع؟', a:'نسخة تجريبية أولية لتصميم الموقع تعمل بدون اتصال بالإنترنت.', cat:'عام'},
          {q:'هل يمكن إضافة المزيد من الصفحات؟', a:'نعم، فعّل وضع المؤسس ثم اضغط على زر إنشاء صفحة جديدة في أسفل القائمة الجانبية.', cat:'عام'}
        ], children:[]}
      ]}
    ],
    activePage:'home'
  };
}

async function callApi(action, payload){
  try{
    const { data, error } = await supaClient.functions.invoke('site-api', { body: { action, payload: payload||{} } });
    if(error) return { data:null, error };
    if(data && data.error) return { data:null, error:{ message:data.error } };
    return { data, error:null };
  }catch(e){
    return { data:null, error:{ message: e.message||'network error' } };
  }
}

function loadLocal(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return defaultData();
}
function saveLocal(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function save(){
  saveLocal();
}

let state = loadLocal();

async function syncFromSupabase(){
  if(!supaEnabled) return;
  const { data, error } = await callApi('getSiteData', {});
  if(error){
    console.error('Supabase load error:', error.message);
    return;
  }
  if(data && data.data){
    if(data.data.pages) state.pages = data.data.pages;
    if(data.data.footerText!==undefined) state.footerText = data.data.footerText;
    saveLocal();
    renderAll();
  }
}

if(supaEnabled){
  syncFromSupabase();
  supaClient
    .channel('site_data_changes')
    .on('postgres_changes', { event:'UPDATE', schema:'public', table:SUPA_TABLE, filter:`id=eq.${SUPA_ROW_ID}` }, payload=>{
      if(payload.new && payload.new.data){
        if(payload.new.data.pages) state.pages = payload.new.data.pages;
        if(payload.new.data.footerText!==undefined) state.footerText = payload.new.data.footerText;
        saveLocal();
        renderAll();
      }
    })
    .subscribe();
}

let currentUser = null;

function showToast(msg){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.classList.remove('show'), 3000);
}

function updateAuthBtn(){
  const btn=document.getElementById('authBtn');
  if(!btn) return;
  btn.innerHTML = ICONS.user;
  btn.title = currentUser ? 'تسجيل الخروج' : 'تسجيل الدخول';
}

async function refreshUser(){
  if(!supaEnabled) return;
  const { data } = await supaClient.auth.getSession();
  currentUser = data && data.session ? data.session.user : null;
  updateAuthBtn();
}

if(supaEnabled){
  refreshUser();
  supaClient.auth.onAuthStateChange((event, session)=>{
    const wasLoggedOut = !currentUser;
    currentUser = session ? session.user : null;
    updateAuthBtn();
    renderMain();
    if(event==='SIGNED_IN' && currentUser && wasLoggedOut){
      showToast('تم تسجيل الدخول بنجاح ✓ — '+currentUser.email);
      if(openAskAfterLogin){
        openAskAfterLogin=false;
        authModalBg.classList.remove('show');
        openAskModal();
      }
    }
  });
}

const authModalBg=document.getElementById('authModalBg');
const accountModalBg=document.getElementById('accountModalBg');
const authBtn=document.getElementById('authBtn');
let pendingAuthEmail='';

function openLoginModal(){
  document.getElementById('authStep1').style.display='block';
  document.getElementById('authStep2').style.display='none';
  document.getElementById('authEmailInput').value='';
  document.getElementById('authCodeInput').value='';
  document.getElementById('authStatus').textContent='';
  authModalBg.classList.add('show');
  setTimeout(()=>document.getElementById('authEmailInput').focus(),50);
}

if(authBtn){
  authBtn.onclick=async ()=>{
    if(!supaEnabled){
      alert('هذه الميزة تتطلب تفعيل الاتصال بقاعدة البيانات أولاً من مالك الموقع.');
      return;
    }
    if(currentUser){
      document.getElementById('accountEmailDisplay').textContent = 'مسجّل الدخول بالبريد: '+currentUser.email;
      accountModalBg.classList.add('show');
    } else {
      openLoginModal();
    }
  };
}
const authCancelBtn=document.getElementById('authCancel');
if(authCancelBtn) authCancelBtn.onclick=()=> authModalBg.classList.remove('show');
const authCodeCancelBtn=document.getElementById('authCodeCancel');
if(authCodeCancelBtn) authCodeCancelBtn.onclick=()=> authModalBg.classList.remove('show');

const authSendBtn=document.getElementById('authSend');
if(authSendBtn){
  authSendBtn.onclick=async ()=>{
    const email=document.getElementById('authEmailInput').value.trim();
    if(!email) return;
    const statusEl=document.getElementById('authStatus');
    statusEl.textContent='جارِ الإرسال...';
    const { error } = await supaClient.auth.signInWithOtp({ email });
    if(error){
      statusEl.textContent='تعذّر الإرسال: '+error.message;
      return;
    }
    pendingAuthEmail=email;
    statusEl.textContent='تم إرسال رمز مكوّن من 6 أرقام إلى بريدك.';
    document.getElementById('authStep1').style.display='none';
    document.getElementById('authStep2').style.display='block';
    setTimeout(()=>document.getElementById('authCodeInput').focus(),50);
  };
}
const authVerifyBtn=document.getElementById('authVerify');
if(authVerifyBtn){
  authVerifyBtn.onclick=async ()=>{
    const code=document.getElementById('authCodeInput').value.trim();
    if(!code) return;
    const statusEl=document.getElementById('authStatus');
    statusEl.textContent='جارِ التحقق...';
    const { error } = await supaClient.auth.verifyOtp({ email: pendingAuthEmail, token: code, type:'email' });
    if(error){
      statusEl.textContent='رمز غير صحيح أو منتهي الصلاحية: '+error.message;
      return;
    }
    authModalBg.classList.remove('show');
  };
}
const accountCancelBtn=document.getElementById('accountCancel');
if(accountCancelBtn) accountCancelBtn.onclick=()=> accountModalBg.classList.remove('show');
const accountLogoutBtn=document.getElementById('accountLogoutBtn');
if(accountLogoutBtn){
  accountLogoutBtn.onclick=async ()=>{
    await supaClient.auth.signOut();
    currentUser=null; updateAuthBtn(); renderMain();
    accountModalBg.classList.remove('show');
    showToast('تم تسجيل الخروج');
  };
}

const askModalBg=document.getElementById('askModalBg');
const askQuestionInput=document.getElementById('askQuestionInput');
let openAskAfterLogin=false;

const EMOJI_RE=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu;
if(askQuestionInput){
  askQuestionInput.addEventListener('input', ()=>{
    const cleaned=askQuestionInput.value.replace(EMOJI_RE,'');
    if(cleaned!==askQuestionInput.value){
      const pos=askQuestionInput.selectionStart;
      askQuestionInput.value=cleaned;
      askQuestionInput.setSelectionRange(pos-1, pos-1);
    }
  });
}

function openAskModal(){
  document.getElementById('askStatus').textContent='';
  askQuestionInput.value='';
  askModalBg.classList.add('show');
  renderMyQuestionsInModal();
  setTimeout(()=>askQuestionInput.focus(),50);
}

const askBtn=document.getElementById('askBtn');
if(askBtn){
  askBtn.onclick=()=>{
    if(!supaEnabled){
      alert('هذه الميزة تتطلب تفعيل الاتصال بقاعدة البيانات أولاً من مالك الموقع.');
      return;
    }
    if(!currentUser){
      openAskAfterLogin=true;
      openLoginModal();
      return;
    }
    openAskModal();
  };
}
const askCancelBtn=document.getElementById('askCancel');
if(askCancelBtn) askCancelBtn.onclick=()=> askModalBg.classList.remove('show');

const askSendBtn=document.getElementById('askSend');
if(askSendBtn){
  askSendBtn.onclick=async ()=>{
    const qVal=askQuestionInput.value.trim();
    if(!qVal || !currentUser) return;
    const statusEl=document.getElementById('askStatus');
    askSendBtn.disabled=true; askSendBtn.textContent='جارِ الإرسال...';
    const { error } = await callApi('submitQuestion', { question: qVal });
    askSendBtn.disabled=false; askSendBtn.textContent='إرسال السؤال';
    if(error){ statusEl.textContent='تعذّر إرسال السؤال: '+error.message; return; }
    askQuestionInput.value='';
    statusEl.textContent='تم إرسال سؤالك بنجاح ✓';
    showToast('تم إرسال سؤالك بنجاح ✓');
    renderMyQuestionsInModal();
  };
}

async function renderMyQuestionsInModal(){
  const wrap=document.getElementById('myQuestionsWrap');
  if(!wrap || !currentUser) return;
  wrap.innerHTML='';
  const { data:apiResult, error } = await callApi('getMyQuestions', {});
  const data = apiResult && apiResult.data;
  if(error || !data || !data.length) return;

  const title=document.createElement('div'); title.className='qa-cat-title'; title.style.marginTop='18px';
  title.textContent='أسئلتك السابقة';
  wrap.appendChild(title);
  data.forEach(row=>{
    const hasAnswer = row.status==='answered' && row.answer;
    const item=document.createElement('div'); item.className='qa-item';

    const qRow=document.createElement('div'); qRow.className='qa-q';
    const statusLabel = row.status==='answered' ? '✓' : (row.status==='dismissed' ? 'لم تُنشر' : 'قيد المراجعة');
    const qText=document.createElement('span'); qText.textContent = 'س/ '+row.question;
    const statusSpan=document.createElement('span'); statusSpan.style.fontSize='12px'; statusSpan.style.color='var(--text-dim)';
    statusSpan.textContent = statusLabel;
    qRow.appendChild(qText); qRow.appendChild(statusSpan);
    item.appendChild(qRow);

    if(hasAnswer){
      qRow.style.cursor='pointer';
      const a=document.createElement('div'); a.className='qa-a';
      const aLabel=document.createElement('span'); aLabel.className='qa-a-label'; aLabel.textContent='ج/ ';
      const aBody=document.createElement('span'); aBody.innerHTML=sanitizeHtml(row.answer);
      a.appendChild(aLabel); a.appendChild(aBody);
      qRow.onclick=()=>a.classList.toggle('open');
      item.appendChild(a);
    } else {
      qRow.style.cursor='default';
    }

    wrap.appendChild(item);
  });
}

function stripHtml(html){
  const div=document.createElement('div');
  div.innerHTML=html||'';
  return div.textContent||div.innerText||'';
}

function buildSearchIndex(){
  const index=[];
  function walk(pages){
    pages.forEach(p=>{
      const type=p.type||'content';
      if(type==='qa'){
        (p.qa||[]).forEach(item=>{
          const qText=item.q||'';
          const aText=stripHtml(item.a||'');
          index.push({ pageId:p.id, pageTitle:p.title, kind:'qa', question:qText, text:(qText+' '+aText).trim() });
        });
      } else {
        const contentText=stripHtml(p.content||'');
        index.push({ pageId:p.id, pageTitle:p.title, kind:'page', text:(p.title+' '+contentText).trim() });
      }
      if(p.children && p.children.length) walk(p.children);
    });
  }
  walk(state.pages);
  return index;
}

function highlightSnippet(text, query){
  const lower=text.toLowerCase(), q=query.toLowerCase();
  const idx=lower.indexOf(q);
  let start=0, end=Math.min(text.length,140);
  if(idx!==-1){ start=Math.max(0, idx-40); end=Math.min(text.length, idx+q.length+60); }
  let snippet=text.slice(start,end).trim();
  if(start>0) snippet='…'+snippet;
  if(end<text.length) snippet+='…';
  const esc=escapeHtml(snippet);
  const escQuery=escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp('('+escQuery+')','ig');
  return esc.replace(re, '<mark>$1</mark>');
}

function runSearch(query){
  const resultsEl=document.getElementById('searchResults');
  resultsEl.innerHTML='';
  const q=query.trim();
  if(q.length<2) return;
  const idx=buildSearchIndex();
  const matches=idx.filter(item=> item.text.toLowerCase().includes(q.toLowerCase())).slice(0,25);
  if(!matches.length){
    const empty=document.createElement('div'); empty.className='empty-hint'; empty.style.padding='12px 4px';
    empty.textContent='لا توجد نتائج.';
    resultsEl.appendChild(empty);
    return;
  }
  matches.forEach(m=>{
    const row=document.createElement('div'); row.className='search-result';
    const title=document.createElement('div'); title.className='search-result-title'; title.textContent=m.pageTitle;
    const snip=document.createElement('div'); snip.className='search-result-snippet';
    snip.innerHTML=highlightSnippet(m.text, q);
    row.appendChild(title); row.appendChild(snip);
    row.onclick=()=>goToSearchResult(m);
    resultsEl.appendChild(row);
  });
}

function goToSearchResult(m){
  searchModalBg.classList.remove('show');
  state.activePage=m.pageId;
  save(); renderAll();
  if(m.kind==='qa' && m.question){
    setTimeout(()=>{
      const items=document.querySelectorAll('.qa-item .qa-q');
      for(const qEl of items){
        if(qEl.textContent.includes(m.question)){
          qEl.click();
          const item=qEl.closest('.qa-item');
          item.scrollIntoView({behavior:'smooth', block:'center'});
          item.style.transition='background .4s';
          item.style.background='rgba(45,212,191,.15)';
          setTimeout(()=>{ item.style.background=''; }, 1600);
          break;
        }
      }
    }, 60);
  } else {
    setTimeout(()=> window.scrollTo({top:0, behavior:'smooth'}), 60);
  }
}

const searchModalBg=document.getElementById('searchModalBg');
const searchBtn=document.getElementById('searchBtn');
if(searchBtn){
  searchBtn.onclick=()=>{
    document.getElementById('searchInput').value='';
    document.getElementById('searchResults').innerHTML='';
    searchModalBg.classList.add('show');
    setTimeout(()=>document.getElementById('searchInput').focus(),50);
  };
}
const searchCancelBtn=document.getElementById('searchCancel');
if(searchCancelBtn) searchCancelBtn.onclick=()=> searchModalBg.classList.remove('show');
const searchInputEl=document.getElementById('searchInput');
if(searchInputEl){
  searchInputEl.addEventListener('input', ()=> runSearch(searchInputEl.value));
}

function findPage(id, list=state.pages){
  for(const p of list){
    if(p.id===id) return p;
    if(p.children && p.children.length){
      const f = findPage(id, p.children);
      if(f) return f;
    }
  }
  return null;
}
function findParentArray(id, list=state.pages){
  for(const p of list){
    if(p.id===id) return list;
    if(p.children && p.children.length){
      const f = findParentArray(id, p.children);
      if(f) return f;
    }
  }
  return null;
}
function allPagesFlat(list=state.pages, depth=0, out=[]){
  for(const p of list){
    out.push({id:p.id, title:p.title, depth});
    if(p.children && p.children.length) allPagesFlat(p.children, depth+1, out);
  }
  return out;
}
function uid(){ return 'p_'+Math.random().toString(36).slice(2,9); }
function iconBtn(name, title, cls){
  const b=document.createElement('button');
  if(cls) b.className=cls;
  b.title=title;
  b.innerHTML=ICONS[name];
  return b;
}

const menuTree = document.getElementById('menuTree');
function renderTree(list, container){
  container.innerHTML='';
  list.forEach(p=>{
    const row = document.createElement('div');
    row.className='menu-item';

    const link = document.createElement('a');
    link.href='#';
    link.textContent=p.title;
    if(state.activePage===p.id) link.classList.add('active');
    link.onclick=(e)=>{ e.preventDefault(); state.activePage=p.id; save(); renderAll(); closeSidebar(); };
    row.appendChild(link);

    const controls = document.createElement('div');
    controls.style.display='flex';

    let caretEl=null;
    if(p.children && p.children.length){
      caretEl = document.createElement('span');
      caretEl.className='caret';
      caretEl.innerHTML=ICONS.chevron;
      caretEl.onclick=()=>{
        const childBox = row.nextElementSibling;
        childBox.classList.toggle('open');
        caretEl.classList.toggle('rot');
      };
      controls.appendChild(caretEl);
    }

    if(state.admin){
      const addBtn=iconBtn('plus','إضافة صفحة فرعية','mini-btn');
      addBtn.onclick=()=>openPageModal(p.id);
      controls.appendChild(addBtn);

      if(!p.fixed){
        const delBtn=iconBtn('trash','حذف الصفحة','mini-btn');
        delBtn.onclick=()=>{
          if(confirm('حذف هذه الصفحة وكل ما بداخلها؟')){
            const arr=findParentArray(p.id);
            const idx=arr.findIndex(x=>x.id===p.id);
            arr.splice(idx,1);
            if(state.activePage===p.id) state.activePage='home';
            save(); renderAll();
          }
        };
        controls.appendChild(delBtn);
      }
    }
    row.appendChild(controls);
    container.appendChild(row);

    if(p.children && p.children.length){
      const childBox=document.createElement('div');
      childBox.className='menu-children';
      container.appendChild(childBox);
      renderTree(p.children, childBox);
    }
  });
}

let savedRange = null;
function saveSelection(){
  const sel = window.getSelection();
  if(sel.rangeCount>0) savedRange = sel.getRangeAt(0);
}
function restoreSelection(box){
  box.focus();
  if(savedRange){
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }
}
function insertHtmlAtSelection(box, html){
  restoreSelection(box);
  document.execCommand('insertHTML', false, html);
}

function cleanContentHtml(box){
  const clone = box.cloneNode(true);
  clone.querySelectorAll('.media-block').forEach(wrap=>{
    const media = wrap.querySelector('img,video,iframe');
    if(media){ media.removeAttribute('draggable'); wrap.replaceWith(media); }
    else wrap.remove();
  });
  return clone.innerHTML;
}
function saveContent(box,p){ p.content = cleanContentHtml(box); save(); }

function moveMediaBlock(wrap, dir){
  if(dir<0){
    const prev = wrap.previousSibling;
    if(prev) wrap.parentNode.insertBefore(wrap, prev);
  }else{
    const next = wrap.nextSibling;
    if(next) wrap.parentNode.insertBefore(next, wrap);
  }
}

function enhanceMediaBlocks(box, onSave){
  box.querySelectorAll('img,video,iframe').forEach(media=>{
    if(media.closest('.media-block')) return;
    const wrap=document.createElement('div');
    wrap.className='media-block';
    wrap.contentEditable='false';
    media.parentNode.insertBefore(wrap, media);
    wrap.appendChild(media);

    const ctrl=document.createElement('div');
    ctrl.className='media-controls';
    const upBtn=iconBtn('up','نقل للأعلى','mctrl');
    const downBtn=iconBtn('down','نقل للأسفل','mctrl');
    const delBtn=iconBtn('trash','حذف','mctrl danger');
    [upBtn,downBtn,delBtn].forEach(b=>{
      b.addEventListener('mousedown', e=>e.preventDefault());
    });
    upBtn.addEventListener('click', ()=>{ moveMediaBlock(wrap,-1); onSave(); });
    downBtn.addEventListener('click', ()=>{ moveMediaBlock(wrap,1); onSave(); });
    delBtn.addEventListener('click', ()=>{ wrap.remove(); onSave(); });
    ctrl.appendChild(upBtn); ctrl.appendChild(downBtn); ctrl.appendChild(delBtn);
    wrap.appendChild(ctrl);
  });
}

const mainContent = document.getElementById('mainContent');

function buildToolbar(box, onSave, opts){
  opts = opts || {};
  const showMedia = opts.media !== false;

  const bar=document.createElement('div');
  bar.className='toolbar';

  function cmdBtn(icon, title, cmd, val){
    const b=iconBtn(icon, title);
    b.onmousedown=(e)=>e.preventDefault();
    b.onclick=()=>{ box.focus(); document.execCommand(cmd, false, val||null); onSave(); };
    return b;
  }
  bar.appendChild(cmdBtn('bold','غامق','bold'));
  bar.appendChild(cmdBtn('italic','مائل','italic'));
  bar.appendChild(cmdBtn('underline','تسطير','underline'));

  const sep1=document.createElement('div'); sep1.className='sep'; bar.appendChild(sep1);

  bar.appendChild(cmdBtn('alignRight','محاذاة يمين','justifyRight'));
  bar.appendChild(cmdBtn('alignCenter','توسيط','justifyCenter'));
  bar.appendChild(cmdBtn('alignLeft','محاذاة يسار','justifyLeft'));

  const sep2=document.createElement('div'); sep2.className='sep'; bar.appendChild(sep2);

  const colorInput=document.createElement('input');
  colorInput.type='color'; colorInput.value='#f2f2f2'; colorInput.title='لون النص';
  colorInput.addEventListener('mousedown', saveSelection);
  colorInput.addEventListener('input', ()=>{ restoreSelection(box); document.execCommand('foreColor', false, colorInput.value); onSave(); });
  bar.appendChild(colorInput);

  bar.appendChild(cmdBtn('clear','إزالة التنسيق','removeFormat'));

  const sep3=document.createElement('div'); sep3.className='sep'; bar.appendChild(sep3);

  if(showMedia){
    const imgLabel=document.createElement('label');
    imgLabel.className='tbtn'; imgLabel.title='إدراج صورة'; imgLabel.innerHTML=ICONS.image;
    const imgInput=document.createElement('input');
    imgInput.type='file'; imgInput.accept='image/*';
    imgInput.addEventListener('mousedown', saveSelection);
    imgInput.onchange=(e)=>{
      const file=e.target.files[0];
      if(!file) return;
      const reader=new FileReader();
      reader.onload=(ev)=>{
        insertHtmlAtSelection(box, `<img src="${ev.target.result}">`);
        enhanceMediaBlocks(box,onSave);
        onSave();
      };
      reader.readAsDataURL(file);
      imgInput.value='';
    };
    imgLabel.appendChild(imgInput);
    bar.appendChild(imgLabel);

    const vidLabel=document.createElement('label');
    vidLabel.className='tbtn'; vidLabel.title='رفع فيديو'; vidLabel.innerHTML=ICONS.video;
    const vidInput=document.createElement('input');
    vidInput.type='file'; vidInput.accept='video/*';
    vidInput.addEventListener('mousedown', saveSelection);
    vidInput.onchange=(e)=>{
      const file=e.target.files[0];
      if(!file) return;
      const reader=new FileReader();
      reader.onload=(ev)=>{
        insertHtmlAtSelection(box, `<video src="${ev.target.result}" controls></video>`);
        enhanceMediaBlocks(box,onSave);
        onSave();
      };
      reader.readAsDataURL(file);
      vidInput.value='';
    };
    vidLabel.appendChild(vidInput);
    bar.appendChild(vidLabel);
  }

  const linkBtn=iconBtn('link','إدراج رابط');
  linkBtn.onmousedown=(e)=>{ e.preventDefault(); saveSelection(); };
  linkBtn.onclick=()=> openVideoModal(box, onSave, showMedia);
  bar.appendChild(linkBtn);

  return bar;
}

function renderContentPage(p){
  const sub = getSubtitle(p, '');
  let html = '';
  if(sub) html += `<div class="page-sub">${escapeHtml(sub)}</div>`;
  mainContent.innerHTML = html;

  if(state.admin){
    const box=document.createElement('div');
    box.className='content-box';
    box.contentEditable = true;
    box.innerHTML = sanitizeHtml(p.content || '');

    const bar = buildToolbar(box, ()=>saveContent(box,p));
    mainContent.appendChild(bar);
    mainContent.appendChild(box);

    enhanceMediaBlocks(box, ()=>saveContent(box,p));
    box.addEventListener('input', ()=>{ saveContent(box,p); });

    const note=document.createElement('div');
    note.className='helper-note';
    note.innerHTML = ICONS.up + '<span>مرر المؤشر فوق أي صورة أو فيديو لإظهار أزرار نقله للأعلى أو الأسفل أو حذفه.</span>';
    mainContent.appendChild(note);

    const panel=document.createElement('div');
    panel.className='admin-panel';
    panel.innerHTML=`<div class="label">إدارة الصفحة</div>`;
    const row=document.createElement('div'); row.className='admin-row';

    const addSub=iconBtn('plus','إضافة صفحة فرعية');
    addSub.onclick=()=>openPageModal(p.id);
    row.appendChild(addSub);

    const rename=iconBtn('pencil','إعادة تسمية الصفحة');
    rename.onclick=()=>{
      const newTitle=prompt('العنوان الجديد:', p.title);
      if(newTitle && newTitle.trim()){ p.title=newTitle.trim(); save(); renderAll(); }
    };
    row.appendChild(rename);

    row.appendChild(editSubtitleBtn(p, ''));

    panel.appendChild(row);
    mainContent.appendChild(panel);
  } else {
    const box=document.createElement('div');
    box.className='content-box';
    if(p.content){
      box.innerHTML = sanitizeHtml(p.content);
    } else {
      box.innerHTML='<span class="empty-hint">لا يوجد محتوى بعد.</span>';
    }
    mainContent.appendChild(box);
  }
}

function compareOrderKeys(a, b){
  const oa=(a||'').trim(), ob=(b||'').trim();
  if(!oa && !ob) return 0;
  if(!oa) return 1;
  if(!ob) return -1;
  const pa=oa.split(':').map(n=>parseInt(n,10));
  const pb=ob.split(':').map(n=>parseInt(n,10));
  const len=Math.max(pa.length, pb.length);
  for(let i=0;i<len;i++){
    const va=isNaN(pa[i])?0:pa[i];
    const vb=isNaN(pb[i])?0:pb[i];
    if(va!==vb) return va-vb;
  }
  return 0;
}

const CAT_PRIORITY={'الأسئلة الشائعة':0, 'أسئلة الزوار':1};
function sortCategories(cats){
  return cats.slice().sort((a,b)=>{
    const pa=CAT_PRIORITY[a]!==undefined?CAT_PRIORITY[a]:99;
    const pb=CAT_PRIORITY[b]!==undefined?CAT_PRIORITY[b]:99;
    return pa-pb;
  });
}

function renderQaItem(p, item, i){
  const box=document.createElement('div'); box.className='qa-item';
  const qRow=document.createElement('div'); qRow.className='qa-q';
  const qText=document.createElement('span'); qText.textContent='س/ '+item.q;
  qRow.appendChild(qText);

  const a=document.createElement('div'); a.className='qa-a';
  const aLabel=document.createElement('span'); aLabel.className='qa-a-label'; aLabel.textContent='ج/ ';
  const aBody=document.createElement('span'); aBody.className='qa-a-body'; aBody.innerHTML=sanitizeHtml(item.a||'');
  a.appendChild(aLabel); a.appendChild(aBody);
  qText.onclick=()=>a.classList.toggle('open');

  if(state.admin){
    const actions=document.createElement('div'); actions.className='row-actions';
    const edit=iconBtn('pencil','تعديل السؤال','mini-btn');
    edit.onclick=(e)=>{ e.stopPropagation(); renderQaEditForm(p, item, i, box); };
    actions.appendChild(edit);
    const del=iconBtn('trash','حذف السؤال','mini-btn');
    del.onclick=(e)=>{ e.stopPropagation(); p.qa.splice(i,1); save(); renderQuestionsPage(p); };
    actions.appendChild(del);
    qRow.appendChild(actions);
  }
  box.appendChild(qRow); box.appendChild(a);
  return box;
}

function renderQaEditForm(p, item, i, box){
  box.innerHTML='';
  box.classList.add('qa-editing');

  const form=document.createElement('div'); form.className='qa-form';
  const catInput=document.createElement('input');
  catInput.placeholder='التصنيف'; catInput.value=item.cat||'عام';
  const qInput=document.createElement('input');
  qInput.placeholder='السؤال'; qInput.value=item.q;
  form.appendChild(catInput); form.appendChild(qInput);
  box.appendChild(form);

  const aBox=document.createElement('div');
  aBox.className='content-box'; aBox.contentEditable=true;
  aBox.style.minHeight='90px';
  aBox.innerHTML=sanitizeHtml(item.a||'');
  const bar=buildToolbar(aBox, ()=>{}, {media:false});
  enhanceMediaBlocks(aBox, ()=>{});
  box.appendChild(bar);
  box.appendChild(aBox);

  const actions=document.createElement('div'); actions.className='qa-edit-actions';
  const saveBtn=document.createElement('button'); saveBtn.className='text-btn primary'; saveBtn.textContent='حفظ';
  saveBtn.onclick=()=>{
    const newQ=qInput.value.trim();
    if(!newQ) return;
    item.q=newQ;
    item.cat=catInput.value.trim()||'عام';
    item.a=cleanContentHtml(aBox);
    save(); renderQuestionsPage(p);
  };
  const cancelBtn=document.createElement('button'); cancelBtn.className='text-btn'; cancelBtn.textContent='إلغاء';
  cancelBtn.onclick=()=> renderQuestionsPage(p);
  actions.appendChild(saveBtn); actions.appendChild(cancelBtn);
  box.appendChild(actions);
}

function buildQaAddForm(p){
  const panel=document.createElement('div'); panel.className='admin-panel';
  panel.innerHTML='<div class="label">إضافة سؤال جديد</div>';

  const form=document.createElement('div'); form.className='qa-form';
  const catInput=document.createElement('input');
  catInput.placeholder='التصنيف (مثال: عام)';
  catInput.setAttribute('list','qaCatOptions');
  form.appendChild(catInput);

  const dl=document.createElement('datalist'); dl.id='qaCatOptions';
  const seen=new Set();
  (p.qa||[]).forEach(it=>{
    const c=(it.cat && it.cat.trim())? it.cat.trim() : 'عام';
    if(!seen.has(c)){ seen.add(c); const opt=document.createElement('option'); opt.value=c; dl.appendChild(opt); }
  });
  form.appendChild(dl);

  const q=document.createElement('input'); q.placeholder='السؤال';
  form.appendChild(q);
  panel.appendChild(form);

  const aBox=document.createElement('div');
  aBox.className='content-box'; aBox.contentEditable=true;
  aBox.style.minHeight='90px';
  const bar=buildToolbar(aBox, ()=>{}, {media:false});
  enhanceMediaBlocks(aBox, ()=>{});
  panel.appendChild(bar);
  panel.appendChild(aBox);

  const actions=document.createElement('div'); actions.className='qa-edit-actions';
  const addBtn=document.createElement('button'); addBtn.className='text-btn primary'; addBtn.textContent='إضافة';
  addBtn.onclick=()=>{
    const qVal=q.value.trim();
    if(qVal && aBox.textContent.trim()){
      p.qa = p.qa||[];
      p.qa.push({q:qVal, a:cleanContentHtml(aBox), cat:catInput.value.trim()||'عام'});
      save(); renderQuestionsPage(p);
    }
  };
  actions.appendChild(addBtn);
  panel.appendChild(actions);

  const row=document.createElement('div'); row.className='admin-row'; row.style.marginTop='10px';
  const addSub=iconBtn('plus','إضافة صفحة فرعية');
  addSub.onclick=()=>openPageModal(p.id);
  row.appendChild(addSub);
  const rename=iconBtn('pencil','إعادة تسمية الصفحة');
  rename.onclick=()=>{
    const newTitle=prompt('العنوان الجديد:', p.title);
    if(newTitle && newTitle.trim()){ p.title=newTitle.trim(); save(); renderAll(); }
  };
  row.appendChild(rename);
  row.appendChild(editSubtitleBtn(p, ''));
  panel.appendChild(row);
  return panel;
}

function renderQuestionsPage(p){
  const sub = getSubtitle(p, '');
  let html = '';
  if(sub) html += `<div class="page-sub">${escapeHtml(sub)}</div>`;
  mainContent.innerHTML = html;

  const cats=[]; const catMap={};
  (p.qa||[]).forEach((item,i)=>{
    const cat=(item.cat && item.cat.trim())? item.cat.trim() : 'عام';
    if(!catMap[cat]){ catMap[cat]=[]; cats.push(cat); }
    catMap[cat].push(i);
  });

  sortCategories(cats).forEach(cat=>{
    const catBox=document.createElement('div'); catBox.className='qa-cat';
    const catTitle=document.createElement('div'); catTitle.className='qa-cat-title';
    const lineL=document.createElement('span'); lineL.className='qa-cat-line';
    const label=document.createElement('span'); label.textContent=cat;
    const lineR=document.createElement('span'); lineR.className='qa-cat-line';
    catTitle.appendChild(lineL); catTitle.appendChild(label); catTitle.appendChild(lineR);
    catBox.appendChild(catTitle);
    catMap[cat].sort((ia,ib)=>compareOrderKeys(p.qa[ia].order, p.qa[ib].order));
    catMap[cat].forEach(i=>{ catBox.appendChild(renderQaItem(p, p.qa[i], i)); });
    mainContent.appendChild(catBox);
  });

  if(!(p.qa && p.qa.length)){
    const empty=document.createElement('div');
    empty.className='empty-hint'; empty.style.marginTop='4px';
    empty.textContent='لا توجد أسئلة بعد.';
    mainContent.appendChild(empty);
  }
}

function escapeHtml(s){
  return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function getSubtitle(p, defaultText){
  return (p.subtitle!==undefined && p.subtitle!==null) ? p.subtitle : defaultText;
}
function editSubtitleBtn(p, defaultText){
  const btn=iconBtn('doc','تعديل الوصف الفرعي (يمكن تركه فارغًا لإخفائه)');
  btn.onclick=()=>{
    const current=getSubtitle(p, defaultText);
    const newSub=prompt('الوصف الفرعي (اتركه فارغًا لإخفائه):', current);
    if(newSub!==null){ p.subtitle=newSub.trim(); save(); renderAll(); }
  };
  return btn;
}

function renderHubPage(p){
  const sub = getSubtitle(p, '');
  let html = '';
  if(sub) html += `<div class="page-sub">${escapeHtml(sub)}</div>`;
  mainContent.innerHTML = html;

  if(state.admin){
    const box=document.createElement('div');
    box.className='content-box';
    box.contentEditable = true;
    box.innerHTML = sanitizeHtml(p.content || '');

    const bar = buildToolbar(box, ()=>saveContent(box,p));
    mainContent.appendChild(bar);
    mainContent.appendChild(box);

    enhanceMediaBlocks(box, ()=>saveContent(box,p));
    box.addEventListener('input', ()=>{ saveContent(box,p); });
  } else if(p.content){
    const box=document.createElement('div');
    box.className='content-box';
    box.innerHTML = sanitizeHtml(p.content);
    mainContent.appendChild(box);
  }

  const grid=document.createElement('div');
  grid.className='hub-grid';
  (p.children||[]).forEach(child=>{
    const card=document.createElement('a');
    card.href='#'; card.className='hub-card';
    card.innerHTML = `<span class="hub-card-title"></span><span class="enter-arrow"></span>`;
    card.querySelector('.hub-card-title').textContent = child.title;
    card.querySelector('.enter-arrow').innerHTML = ICONS.back;
    card.onclick=(e)=>{ e.preventDefault(); state.activePage=child.id; save(); renderAll(); };
    grid.appendChild(card);
  });
  mainContent.appendChild(grid);

  if(!(p.children && p.children.length)){
    const empty=document.createElement('div');
    empty.className='empty-hint';
    empty.style.marginTop='10px';
    empty.textContent='لا توجد أقسام بعد.';
    mainContent.appendChild(empty);
  }

  if(state.admin){
    const panel=document.createElement('div');
    panel.className='admin-panel';
    panel.innerHTML='<div class="label">إدارة الأقسام</div>';
    const row=document.createElement('div'); row.className='admin-row';
    const addBtn=iconBtn('plus','إضافة قسم جديد');
    addBtn.onclick=()=>openPageModal(p.id);
    row.appendChild(addBtn);
    const rename=iconBtn('pencil','إعادة تسمية الصفحة');
    rename.onclick=()=>{
      const newTitle=prompt('العنوان الجديد:', p.title);
      if(newTitle && newTitle.trim()){ p.title=newTitle.trim(); save(); renderAll(); }
    };
    row.appendChild(rename);
    row.appendChild(editSubtitleBtn(p, ''));
    panel.appendChild(row);
    mainContent.appendChild(panel);
  }
}

function renderMain(){
  const p = findPage(state.activePage) || state.pages[0];
  const type = p.type || 'content';
  if(type==='qa') renderQuestionsPage(p);
  else if(type==='hub') renderHubPage(p);
  else renderContentPage(p);
}

const DEFAULT_FOOTER_TEXT = '';
function renderFooter(){
  const el=document.getElementById('siteFooter');
  el.innerHTML='';
  const text = (state.footerText!==undefined && state.footerText!==null) ? state.footerText : DEFAULT_FOOTER_TEXT;
  if(text){
    const span=document.createElement('span');
    span.textContent=text;
    el.appendChild(span);
  }
  if(state.admin){
    const editBtn=iconBtn('doc','تعديل نص التذييل (اتركه فارغًا لإخفائه)','mini-btn');
    editBtn.onclick=()=>{
      const current=(state.footerText!==undefined && state.footerText!==null) ? state.footerText : DEFAULT_FOOTER_TEXT;
      const newText=prompt('نص التذييل (اتركه فارغًا لإخفائه):', current);
      if(newText!==null){ state.footerText=newText.trim(); save(); renderFooter(); }
    };
    el.appendChild(editBtn);
  }
}

function renderAll(){
  renderTree(state.pages, menuTree);
  renderMain();
  renderFooter();
}

document.getElementById('closeSidebar').innerHTML = ICONS.back;
document.getElementById('searchBtn').innerHTML = ICONS.search;
document.getElementById('askBtn').innerHTML = ICONS.ask;
document.getElementById('askCancel').innerHTML = ICONS.close;
document.getElementById('searchCancel').innerHTML = ICONS.close;

const sidebar=document.getElementById('sidebar');
const overlay=document.getElementById('overlay');
const burger=document.getElementById('burger');
function openSidebar(){ sidebar.classList.add('open'); overlay.classList.add('show'); burger.classList.add('open'); }
function closeSidebar(){ sidebar.classList.remove('open'); overlay.classList.remove('show'); burger.classList.remove('open'); }
burger.onclick=()=> sidebar.classList.contains('open')? closeSidebar(): openSidebar();
overlay.onclick=closeSidebar;
document.getElementById('closeSidebar').onclick=closeSidebar;

const modalBg=document.getElementById('modalBg');
const modalInput=document.getElementById('modalInput');
const modalParent=document.getElementById('modalParent');
const typeContentBtn=document.getElementById('typeContentBtn');
const typeQaBtn=document.getElementById('typeQaBtn');
typeContentBtn.innerHTML = ICONS.doc + '<span>محتوى</span>';
typeQaBtn.innerHTML = ICONS.question + '<span>أسئلة</span>';

let pendingType='content';
[typeContentBtn, typeQaBtn].forEach(btn=>{
  btn.onclick=()=>{
    pendingType=btn.dataset.type;
    [typeContentBtn, typeQaBtn].forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  };
});

function openPageModal(parentId){
  modalInput.value='';
  pendingType='content';
  [typeContentBtn, typeQaBtn].forEach(b=>b.classList.remove('active'));
  typeContentBtn.classList.add('active');
  modalParent.innerHTML='<option value="">-- بدون (صفحة رئيسية في القائمة) --</option>';
  allPagesFlat().forEach(item=>{
    const opt=document.createElement('option');
    opt.value=item.id;
    opt.textContent='—'.repeat(item.depth)+' '+item.title;
    if(item.id===parentId) opt.selected=true;
    modalParent.appendChild(opt);
  });
  modalBg.classList.add('show');
  setTimeout(()=>modalInput.focus(),50);
}
document.getElementById('modalCancel').onclick=()=> modalBg.classList.remove('show');
document.getElementById('modalConfirm').onclick=()=>{
  const title=modalInput.value.trim();
  if(!title){ modalInput.focus(); return; }
  const parentId=modalParent.value;
  const newPage = pendingType==='qa'
    ? {id:uid(), title, type:'qa', qa:[], children:[]}
    : {id:uid(), title, type:'content', content:'', children:[]};
  if(parentId){
    const parent=findPage(parentId);
    parent.children = parent.children||[];
    parent.children.push(newPage);
  }else{
    state.pages.push(newPage);
  }
  state.activePage=newPage.id;
  save();
  modalBg.classList.remove('show');
  renderAll();
};

const videoModalBg=document.getElementById('videoModalBg');
const videoUrlInput=document.getElementById('videoUrlInput');
let videoTargetBox=null, videoTargetSave=null, videoTargetAllowMedia=true;

function openVideoModal(box, onSave, allowMedia){
  videoTargetBox=box; videoTargetSave=onSave; videoTargetAllowMedia = allowMedia!==false;
  videoUrlInput.value='';
  videoModalBg.classList.add('show');
  setTimeout(()=>videoUrlInput.focus(),50);
}
document.getElementById('videoCancel').onclick=()=> videoModalBg.classList.remove('show');
document.getElementById('videoConfirm').onclick=()=>{
  const url=videoUrlInput.value.trim();
  if(!url) return;

  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/);
  const isVideoFile = /\.(mp4|webm|ogv|ogg|mov)(\?.*)?$/i.test(url);

  if(videoTargetAllowMedia && yt){
    insertHtmlAtSelection(videoTargetBox, `<iframe src="https://www.youtube.com/embed/${yt[1]}" allowfullscreen></iframe>`);
    enhanceMediaBlocks(videoTargetBox, videoTargetSave);
  } else if(videoTargetAllowMedia && isVideoFile){
    insertHtmlAtSelection(videoTargetBox, `<video src="${url}" controls></video>`);
    enhanceMediaBlocks(videoTargetBox, videoTargetSave);
  } else {
    restoreSelection(videoTargetBox);
    const sel = window.getSelection();
    if(sel && sel.toString().length>0){
      document.execCommand('createLink', false, url);
    } else {
      document.execCommand('insertHTML', false, `<a href="${url}">انقر للانتقال للصفحة</a>`);
    }
    videoTargetBox.querySelectorAll('a').forEach(a=>{
      if(!a.target){ a.target='_blank'; a.rel='noopener'; }
    });
  }

  videoTargetSave();
  videoModalBg.classList.remove('show');
};

renderAll();
