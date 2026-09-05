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
  question: '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.3 9.3a2.7 2.7 0 1 1 3.7 2.5c-.9.4-1 1.1-1 1.9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1" fill="currentColor"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 12h4l2 3h4l2-3h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M4 12l1.5-6.5A2 2 0 0 1 7.4 4h9.2a2 2 0 0 1 1.9 1.5L20 12v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  save: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 4h11l3 3v13H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 4v5h8V4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 20v-6h8v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  list: '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="4.5" cy="6" r="1.3" fill="currentColor"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor"/><circle cx="4.5" cy="18" r="1.3" fill="currentColor"/><line x1="9" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  listNum: '<svg viewBox="0 0 24 24" width="16" height="16"><text x="1" y="9" font-size="7" fill="currentColor">1</text><text x="1" y="15" font-size="7" fill="currentColor">2</text><text x="1" y="21" font-size="7" fill="currentColor">3</text><line x1="9" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  undo: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 8H4V5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 8c2.5-2.7 6-4 9-3.4 4 .8 6.7 4.6 6 8.6-.7 4-4.6 6.7-8.6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  redo: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M17 8h3V5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 8c-2.5-2.7-6-4-9-3.4-4 .8-6.7 4.6-6 8.6.7 4 4.6 6.7 8.6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  strike: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 7c0-2 2-3.5 6-3.5s6 1.5 6 3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 17c0 2 2 3.5 6 3.5s6-1.5 6-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  code: '<svg viewBox="0 0 24 24" width="16" height="16"><polyline points="8,6 3,12 8,18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16,6 21,12 16,18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  hr: '<svg viewBox="0 0 24 24" width="16" height="16"><line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 4"/></svg>',
  table: '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="3" y="4" width="18" height="16" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/><line x1="3" y1="16" x2="21" y2="16" stroke="currentColor" stroke-width="2"/><line x1="10" y1="4" x2="10" y2="20" stroke="currentColor" stroke-width="2"/></svg>',
  focus: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  publish: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 19V6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  eye: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  grip: '<svg viewBox="0 0 24 24" width="14" height="14"><circle cx="9" cy="6" r="1.5" fill="currentColor"/><circle cx="15" cy="6" r="1.5" fill="currentColor"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/><circle cx="9" cy="18" r="1.5" fill="currentColor"/><circle cx="15" cy="18" r="1.5" fill="currentColor"/></svg>',
  team: '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="17" cy="8.5" r="2.3" fill="none" stroke="currentColor" stroke-width="2" opacity=".7"/><path d="M16 13.5c2.3.3 3.8 2 3.8 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>',
  gamepad: '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="3" y="8" width="18" height="9.5" rx="4.5" fill="none" stroke="currentColor" stroke-width="2"/><line x1="7.2" y1="11.5" x2="7.2" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="5.4" y1="13.25" x2="9" y2="13.25" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="15" cy="12.2" r="1" fill="currentColor"/><circle cx="17.3" cy="14.4" r="1" fill="currentColor"/></svg>',
  arrowEnd: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  globe: '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor" stroke-width="2"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2"/></svg>'
};

const STORAGE_KEY = 'offline_site_data_v6';

function defaultData(){
  return {
    admin:false,
    pages:[
      {id:'home', title:'الرئيسية', fixed:true, type:'hub', content:'', children:[]}
    ],
    activePage:'home',
    /* لغة/اتجاه الموقع الافتراضيان إنجليزي (LTR)؛ يمكن للمؤسس تغييرهما من
       زر الكرة الأرضية في القائمة العلوية، وستتكيف الصفحة بالكامل تلقائيًا
       (الخطوط والترتيب) عبر خصائص CSS المنطقية بدل خصائص يمين/يسار الثابتة. */
    siteLang:'en'
  };
}

/* اللغات التي تُكتب من اليمين لليسار — أي لغة أخرى تُعامل كـ LTR افتراضيًا. */
const RTL_LANGS = ['ar','he','fa','ur'];
function applySiteDirection(){
  const lang = (state.siteLang || 'en').trim().toLowerCase();
  const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
  document.documentElement.lang = lang || 'en';
  document.documentElement.dir = dir;
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

/* فصل "المسودة المحلية" عن "النشر الفعلي": الكتابة المستمرة تُحفظ محليًا
   فقط بدون إرسالها للخادم، حتى يضغط المؤسس "نشر" صراحة بعد ما يراجعها.
   هذا يفتح المجال لمعاينة الصفحة كما سيراها الزائر قبل نشر أي تغيير. */
let hasUnpublishedChanges = false;
function markUnpublished(){
  hasUnpublishedChanges = true;
  updatePublishIndicator();
}
function markPublished(){
  hasUnpublishedChanges = false;
  updatePublishIndicator();
}
function updatePublishIndicator(){
  const badge = document.getElementById('publishBadge');
  if(!badge) return;
  if(!isAdminAuthed){ badge.style.display='none'; return; }
  badge.style.display='inline-flex';
  if(hasUnpublishedChanges){
    badge.textContent = '● تغييرات غير منشورة';
    badge.className = 'publish-badge dirty';
  } else {
    badge.textContent = '✓ منشور بالكامل';
    badge.className = 'publish-badge clean';
  }
}
function saveDraft(){
  saveLocal();
  markUnpublished();
}

/* الكتابة الفعلية التي تظهر لجميع الزوار تمر حصرًا عبر site-api، والتي تتحقق
   من صلاحية المؤسس على الخادم نفسه (انظر checkAdmin/isAdminEmail بالدالة).
   التخزين المحلي هو نسخة مؤقتة على هذا الجهاز فقط ولا يغني عن نجاح المزامنة.
   statusHandle اختياري: كائن {saving,saved,failed} لعرض حالة الحفظ للمستخدم. */
function save(statusHandle){
  saveLocal();
  if(supaEnabled && isAdminAuthed){
    if(statusHandle) statusHandle.saving();
    callApi('saveSiteData', { pages: state.pages, footerText: state.footerText, siteLang: state.siteLang })
      .then(({error})=>{
        if(error){
          console.error('Supabase save error:', error.message);
          showToast('⚠️ فشل الحفظ على الخادم: '+error.message);
          if(statusHandle) statusHandle.failed(error.message);
        } else {
          if(statusHandle) statusHandle.saved();
          markPublished();
        }
      });
  }
}

let pendingQaNumber = null;
let state = loadLocal();
if(!state.siteLang) state.siteLang = 'en';
applyUrlToState();
applySiteDirection();

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
    if(data.data.siteLang) state.siteLang = data.data.siteLang;
    applyUrlToState();
    applySiteDirection();
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
        if(payload.new.data.siteLang) state.siteLang = payload.new.data.siteLang;
        applySiteDirection();
        saveLocal();
        renderAll();
      }
    })
    .subscribe();
}

let currentUser = null;

/* لوحة المؤسس لا تظهر ولا تُفعَّل إطلاقًا إلا لمن يعرف رابط الدخول السري
   (?admin=1). أي زائر عادي، حتى لو سجّل دخول لطرح سؤال، لا يُستدعى له فحص
   الصلاحية إطلاقًا فيما يخص المؤسس. */
const ADMIN_MODE_REQUESTED = new URLSearchParams(location.search).get('admin') === '1';
let isAdminAuthed = false;

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

function updateAdminUi(){
  const saveBtnEl = document.getElementById('saveBtn');
  const inboxBtnEl = document.getElementById('inboxBtn');
  const langBtnEl = document.getElementById('langBtn');
  const editToolbarEl = document.getElementById('editToolbar');
  if(saveBtnEl) saveBtnEl.style.display = isAdminAuthed ? 'flex' : 'none';
  if(inboxBtnEl) inboxBtnEl.style.display = isAdminAuthed ? 'flex' : 'none';
  if(langBtnEl) langBtnEl.style.display = isAdminAuthed ? 'flex' : 'none';
  if(editToolbarEl) editToolbarEl.classList.toggle('show', isAdminAuthed);
  updatePublishIndicator();
}

function renderLockGate(){
  const gate=document.getElementById('lockScreen');
  if(!gate) return;
  if(!ADMIN_MODE_REQUESTED || isAdminAuthed){
    gate.style.display='none';
    return;
  }
  gate.style.display='flex';
  const formWrap=document.getElementById('lockFormWrap');
  const deniedWrap=document.getElementById('lockDeniedWrap');
  if(currentUser){
    formWrap.style.display='none';
    deniedWrap.style.display='block';
    document.getElementById('deniedEmail').textContent = currentUser.email;
  } else {
    formWrap.style.display='block';
    deniedWrap.style.display='none';
    document.getElementById('lockStep1').style.display='block';
    document.getElementById('lockStep2').style.display='none';
    document.getElementById('lockStatus').textContent='';
    document.getElementById('lockStatus').className='vm-row';
    setLockDots(1);
  }
}

/* تحديث نقاط الخطوات (١: البريد، ٢: الرمز) أعلى شاشة دخول المؤسس */
function setLockDots(step){
  const d1=document.getElementById('lockDot1'), d2=document.getElementById('lockDot2');
  if(!d1||!d2) return;
  d1.className = step>=1 ? 'dot active' : 'dot';
  d2.className = step>=2 ? 'dot active' : (step>1 ? 'dot done' : 'dot');
}

/* يتحقق من الأهلية عبر خادم Edge (site-api) بدل قراءة جدول admins مباشرة —
   الجدول أصلاً محمي بـ RLS وغير مقروء من المتصفح مطلقًا. */
async function checkIsAdminEmail(email){
  const { data, error } = await callApi('checkAdmin', { email });
  if(error) return false;
  return !!(data && data.isAdmin);
}

async function checkAdminStatus(user){
  if(!supaEnabled) return;
  if(!user){
    isAdminAuthed=false; state.admin=false;
    updateAdminUi(); renderLockGate(); renderAll();
    return;
  }
  const wasAuthed = isAdminAuthed;
  const isAdmin = await checkIsAdminEmail(user.email);
  isAdminAuthed = isAdmin;
  state.admin = isAdmin;
  if(isAdminAuthed && ensureQaIds(state.pages)) save();
  updateAdminUi(); renderLockGate(); renderAll();
  if(isAdminAuthed && !wasAuthed) showToast('تم تسجيل الدخول كمؤسس ✓');
}

async function refreshUser(){
  if(!supaEnabled) return;
  const { data } = await supaClient.auth.getSession();
  currentUser = data && data.session ? data.session.user : null;
  updateAuthBtn();
  if(ADMIN_MODE_REQUESTED || currentUser) checkAdminStatus(currentUser);
}

if(supaEnabled){
  refreshUser();
  supaClient.auth.onAuthStateChange((event, session)=>{
    const wasLoggedOut = !currentUser;
    currentUser = session ? session.user : null;
    updateAuthBtn();
    renderMain();
    if(ADMIN_MODE_REQUESTED || currentUser) checkAdminStatus(currentUser);
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

/* ميزة "اطرح سؤالك" من الزائر معطّلة مؤقتًا بطلب صاحب الموقع — الأسئلة
   الشائعة الآن يدوّنها المؤسس مباشرة (نفس آلية "إضافة سؤال جديد" الموجودة
   بصفحات نوع "أسئلة"). لإعادة تفعيلها لاحقًا، غيّر القيمة إلى true فقط. */
const ASK_QUESTION_ENABLED = false;

const askBtn=document.getElementById('askBtn');
if(askBtn && !ASK_QUESTION_ENABLED) askBtn.style.display='none';
if(askBtn){
  askBtn.onclick=()=>{
    if(!ASK_QUESTION_ENABLED) return;
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
      } else if(type==='chars'){
        (p.characters||[]).forEach(ch=>{
          const bioText=stripHtml(Array.isArray(ch.bio)?ch.bio.join(' '):(ch.bio||''));
          const abilityText=stripHtml(Array.isArray(ch.ability)?ch.ability.join(' '):(ch.ability||''));
          const nm=(ch.name||'');
          index.push({ pageId:p.id, pageTitle:p.title, kind:'char', charId:ch.id, charName:nm.trim(), text:(nm+' '+bioText+' '+abilityText).trim() });
        });
      } else if(type==='game'){
        (p.sections||[]).forEach(s=>{
          const bodyText=stripHtml(s.body||'');
          index.push({ pageId:p.id, pageTitle:p.title, kind:'gamesec', secId:s.id, secTitle:s.title||'', text:((s.title||'')+' '+bodyText).trim() });
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

/* توهيج مؤقت لعنصر عند القفز إليه من نتائج البحث */
function flashHighlight(el){
  if(!el) return;
  el.scrollIntoView({behavior:'smooth', block:'center'});
  el.style.transition='background .4s';
  el.style.background='rgba(45,212,191,.18)';
  setTimeout(()=>{ el.style.background=''; }, 1600);
}

/* يبحث عن أول عنصر يحتوي على نص المطابقة داخل صندوق المحتوى، ويقفز إليه
   مباشرة بدل الاكتفاء بفتح الصفحة من الأعلى. */
function scrollToTextMatch(query){
  const q=(query||'').trim().toLowerCase();
  if(!q) return false;
  const boxes=document.querySelectorAll('#mainContent .content-box, #mainContent .game-sec-body');
  for(const box of boxes){
    const walker=document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
    let node;
    while(node=walker.nextNode()){
      if(node.textContent.toLowerCase().includes(q)){
        const target=(node.parentElement && node.parentElement!==box) ? node.parentElement : box;
        flashHighlight(target);
        return true;
      }
    }
  }
  return false;
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
          flashHighlight(qEl.closest('.qa-item'));
          break;
        }
      }
    }, 60);
  } else if(m.kind==='char' && m.charId){
    mainContent.dataset.activeTeam='All';
    renderMain();
    setTimeout(()=>{
      const idx = charsPagerList.findIndex(ch=> ch.id===m.charId);
      if(idx>-1 && charsPagerInstance){
        charsPagerInstance.goTo(idx);
        setTimeout(()=>{
          const el=document.querySelector(`.char-slide[data-char-id="${m.charId}"]`);
          if(el) flashHighlight(el);
        }, 340);
      } else {
        window.scrollTo({top:0, behavior:'smooth'});
      }
    }, 60);
  } else if(m.kind==='gamesec' && m.secId){
    setTimeout(()=>{
      const el=document.querySelector(`.game-section[data-sec-id="${m.secId}"]`);
      if(el) flashHighlight(el); else window.scrollTo({top:0, behavior:'smooth'});
    }, 60);
  } else if(m.kind==='page' && searchInputEl && searchInputEl.value.trim()){
    const q=searchInputEl.value.trim();
    setTimeout(()=>{
      if(!scrollToTextMatch(q)) window.scrollTo({top:0, behavior:'smooth'});
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

/* ===== روابط فردية للصفحات والأسئلة (SEO) ===== */
const SITE_BASE_TITLE = document.title || 'الموقع';
function slugify(text){
  return (text||'').toString().trim()
    .replace(/\s+/g,'-')
    .replace(/[^\p{L}\p{N}-]+/gu,'')
    .replace(/-+/g,'-')
    .slice(0,60);
}
/* يضمن أن كل سؤال له id ثابت (قديم أو جديد) حتى يصلح كرابط دائم */
function ensureQaIds(pages){
  let changed=false;
  (pages||[]).forEach(p=>{
    if(p.type==='qa' && p.qa && p.qa.length){
      p.qa.forEach(item=>{ if(!item.id){ item.id=uid(); changed=true; } });
    }
    if(p.type==='chars' && p.characters && p.characters.length){
      p.characters.forEach(ch=>{ if(!ch.id){ ch.id=uid(); changed=true; } });
    }
    if(p.type==='game' && p.sections && p.sections.length){
      p.sections.forEach(s=>{ if(!s.id){ s.id=uid(); changed=true; } });
    }
    if(p.children && p.children.length){ if(ensureQaIds(p.children)) changed=true; }
  });
  return changed;
}
function buildPagePath(p, qaItem, qaIndex){
  let path = '/p/'+p.id+(slugify(p.title)?('-'+slugify(p.title)):'');
  if(qaItem && typeof qaIndex==='number') path += '/'+(qaIndex+1);
  return path;
}
function parsePathIds(){
  const parts = location.pathname.split('/').filter(Boolean);
  if(parts[0]!=='p' || !parts[1]) return null;
  const qaSeg = parts[2] || null;
  const qaNumber = qaSeg && /^\d+$/.test(qaSeg) ? parseInt(qaSeg,10) : null;
  return { pageId: parts[1].split('-')[0], qaNumber };
}
function setMetaTag(attr, val, content){
  let m = document.querySelector(`meta[${attr}="${val}"]`);
  if(!m){ m=document.createElement('meta'); m.setAttribute(attr, val); document.head.appendChild(m); }
  m.setAttribute('content', content||'');
}
function setFaqSchema(entries){
  removeFaqSchema();
  if(!entries || !entries.length) return;
  const s=document.createElement('script');
  s.type='application/ld+json'; s.id='faqSchema';
  s.textContent = JSON.stringify({
    '@context':'https://schema.org', '@type':'FAQPage',
    mainEntity: entries.map(e=>({ '@type':'Question', name:e.q, acceptedAnswer:{ '@type':'Answer', text: stripHtml(e.a||'') } }))
  });
  document.head.appendChild(s);
}
function removeFaqSchema(){ const e=document.getElementById('faqSchema'); if(e) e.remove(); }
/* يحدّث رابط المتصفح + العنوان + الوصف + بيانات الأسئلة الشائعة المنظّمة، دون إعادة تحميل الصفحة */
function updateUrlAndMeta(p, qaItem, qaIndex){
  const path = buildPagePath(p, qaItem, qaIndex);
  if(location.pathname !== path){
    history.pushState({ pageId:p.id, qaIndex: qaItem?qaIndex:null }, '', path);
  }
  const siteName = SITE_BASE_TITLE;
  if(qaItem){
    document.title = qaItem.q+' | '+siteName;
    setMetaTag('name','description', stripHtml(qaItem.a||'').slice(0,160));
    setFaqSchema([qaItem]);
  } else if(p.type==='qa'){
    document.title = p.title+' | '+siteName;
    setMetaTag('name','description', stripHtml(getSubtitle(p,'')||p.title).slice(0,160));
    setFaqSchema(p.qa||[]);
  } else {
    document.title = p.title+' | '+siteName;
    setMetaTag('name','description', stripHtml(p.content||getSubtitle(p,'')||p.title).slice(0,160));
    removeFaqSchema();
  }
}
function applyUrlToState(){
  const ids = parsePathIds();
  if(ids && findPage(ids.pageId)){
    state.activePage = ids.pageId;
    pendingQaNumber = ids.qaNumber || null;
  }
}
window.addEventListener('popstate', ()=>{
  const ids = parsePathIds();
  state.activePage = (ids && findPage(ids.pageId)) ? ids.pageId : 'home';
  pendingQaNumber = ids ? ids.qaNumber : null;
  renderAll();
});
/* ===== نهاية أدوات الروابط ===== */

function iconBtn(name, title, cls){
  const b=document.createElement('button');
  if(cls) b.className=cls;
  b.title=title;
  b.innerHTML=ICONS[name];
  return b;
}

/* زر بأيقونة + نص واضح، يُستخدم لإجراءات الإدارة الأساسية (إعادة تسمية، إضافة
   قسم...) بدل الأيقونة المجرّدة، لأن أيقونة بدون كتابة كانت سبب رئيسي في
   الشعور بعدم الوضوح لمن يستخدم لوحة التحكم لأول مرة. */
function labeledBtn(iconName, label, cls){
  const b=document.createElement('button');
  b.className = cls ? cls+' labeled-btn' : 'labeled-btn';
  b.title=label;
  b.innerHTML = ICONS[iconName] + '<span>'+label+'</span>';
  return b;
}

function debounce(fn, wait){
  let t;
  return function(...args){
    clearTimeout(t);
    t=setTimeout(()=>fn.apply(this,args), wait);
  };
}

/* مؤشر حالة حفظ صغير بجانب أدوات التحرير: يوضّح "جارِ الحفظ..." ثم
   "تم الحفظ ✓" فور اكتمال المزامنة الفعلية مع الخادم، بدل ما يبقى الأدمن
   بدون أي تأكيد مرئي أثناء الكتابة. */
function attachSaveStatus(container){
  const el=document.createElement('span');
  el.className='save-status';
  container.appendChild(el);
  return {
    saving(){ el.textContent='جارِ الحفظ...'; el.className='save-status pending'; },
    saved(){ el.textContent='تم الحفظ ✓'; el.className='save-status ok'; clearTimeout(el._t); el._t=setTimeout(()=>{ el.textContent=''; }, 2000); },
    failed(msg){ el.textContent='⚠️ فشل الحفظ'+(msg?(': '+msg):''); el.className='save-status err'; }
  };
}

const menuTree = document.getElementById('menuTree');
/* سياق السحب الحالي لإعادة ترتيب صفحات القائمة الجانبية (يعمل بين عناصر
   نفس المستوى/المصفوفة فقط) — يمنح المؤسس تحكمًا مباشرًا بالترتيب بدل
   الحاجة لحذف الصفحة وإعادة إنشائها بترتيب مختلف. */
let menuDragCtx=null;
function renderTree(list, container){
  container.innerHTML='';
  list.forEach((p, idx)=>{
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

    if(state.admin && list.length>1){
      const handle=document.createElement('span');
      handle.className='drag-handle mini-btn';
      handle.innerHTML=ICONS.grip;
      handle.title='اسحب لإعادة ترتيب الصفحات';
      handle.draggable=true;
      handle.addEventListener('dragstart',(e)=>{
        menuDragCtx={list, fromIndex:idx};
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed='move';
        try{ e.dataTransfer.setData('text/plain',''); }catch(err){}
      });
      handle.addEventListener('dragend',()=>{
        row.classList.remove('dragging');
        menuDragCtx=null;
      });
      controls.appendChild(handle);
    }

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

    if(state.admin){
      row.addEventListener('dragover',(e)=>{
        if(!menuDragCtx || menuDragCtx.list!==list) return;
        e.preventDefault();
        row.classList.add('drag-over');
      });
      row.addEventListener('dragleave',()=> row.classList.remove('drag-over'));
      row.addEventListener('drop',(e)=>{
        e.preventDefault();
        row.classList.remove('drag-over');
        if(!menuDragCtx || menuDragCtx.list!==list) return;
        const from=menuDragCtx.fromIndex;
        menuDragCtx=null;
        if(from===idx) return;
        const [moved]=list.splice(from,1);
        list.splice(idx,0,moved);
        save(); renderAll();
      });
    }
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

/* رفع الملفات فعليًا لمساحة تخزين Supabase (Storage) بدل تحويلها لنص Base64
   طويل يُخزَّن داخل بيانات الصفحة نفسها — هذا يخفّف حجم البيانات المنقولة
   لكل زائر بشكل كبير ويجعل تحميل الصفحة أسرع. يرجّع الرابط العام للملف بعد
   نجاح الرفع، أو null مع رسالة خطأ واضحة عند الفشل. */
const MEDIA_BUCKET = 'media';
const MAX_IMAGE_MB = 8;
const MAX_VIDEO_MB = 60;

async function uploadMediaFile(file, kind){
  if(!supaEnabled || !isAdminAuthed || !supaClient) return null;
  const maxMb = kind==='video' ? MAX_VIDEO_MB : MAX_IMAGE_MB;
  if(file.size > maxMb*1024*1024){
    showToast(`⚠️ الملف كبير جدًا (الحد الأقصى ${maxMb} ميغابايت)`);
    return null;
  }
  const ext = (file.name.split('.').pop() || (kind==='video'?'mp4':'jpg')).toLowerCase().replace(/[^a-z0-9]/g,'') || 'bin';
  const path = `${kind}/${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;
  const { error } = await supaClient.storage.from(MEDIA_BUCKET).upload(path, file, { cacheControl:'3600', upsert:false });
  if(error){
    console.error('media upload error:', error.message);
    /* "row-level security" هنا يعني أن سياسات RLS على مخزن Supabase (bucket:
       media) لا تسمح بالرفع بعد — هذا إعداد على مستوى المشروع في Supabase
       وليس خللًا في الكود، فنعرض توضيحًا أدق بدل رسالة Supabase الخام. */
    if(/row-level security/i.test(error.message)){
      showToast('⚠️ الرفع مرفوض من إعدادات الصلاحيات (RLS) في Supabase — راجع سياسات bucket "media"');
    } else {
      showToast('⚠️ فشل رفع الملف: '+error.message);
    }
    return null;
  }
  const { data } = supaClient.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data && data.publicUrl ? data.publicUrl : null;
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
function saveContent(box,p){ p.content = cleanContentHtml(box); saveDraft(); }

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
    /* الصور داخل خلايا الجدول تُعرض كصورة مصغّرة بدل شريط كامل العرض،
       وبدون أزرار نقل للأعلى/الأسفل التي لا معنى لها داخل خلية واحدة. */
    const inCell = !!media.closest('td,th');
    const wrap=document.createElement('div');
    wrap.className='media-block'+(inCell?' in-table':'');
    wrap.contentEditable='false';
    media.parentNode.insertBefore(wrap, media);
    wrap.appendChild(media);

    const ctrl=document.createElement('div');
    ctrl.className='media-controls';
    if(!inCell){
      const upBtn=iconBtn('up','نقل للأعلى','mctrl');
      const downBtn=iconBtn('down','نقل للأسفل','mctrl');
      [upBtn,downBtn].forEach(b=> b.addEventListener('mousedown', e=>e.preventDefault()));
      upBtn.addEventListener('click', ()=>{ moveMediaBlock(wrap,-1); onSave(); });
      downBtn.addEventListener('click', ()=>{ moveMediaBlock(wrap,1); onSave(); });
      ctrl.appendChild(upBtn); ctrl.appendChild(downBtn);
    }
    const delBtn=iconBtn('trash','حذف','mctrl danger');
    delBtn.addEventListener('mousedown', e=>e.preventDefault());
    delBtn.addEventListener('click', ()=>{ wrap.remove(); onSave(); });
    ctrl.appendChild(delBtn);
    wrap.appendChild(ctrl);
  });
}

const mainContent = document.getElementById('mainContent');

/* ==========================================================================
   شريط التحرير العلوي الموحّد (وضع المؤسس)
   بدل شريط أدوات منفصل يُبنى فوق كل صندوق كتابة (يختفي أثناء التمرير لأسفل
   بالمقالات الطويلة)، صار فيه شريط واحد ثابت أسفل القائمة العلوية مباشرة،
   يبقى ظاهر دائمًا مهما طال المقال، ويعمل على "الصندوق النشط حاليًا"
   (activeEditBox) — أي صندوق كتابة ضغط عليه المؤسس آخر مرة.
   ========================================================================== */
let activeEditBox = null;
let activeEditOnSave = ()=>{};
let activeEditAllowMedia = true;
let globalSaveStatus = null;

function setActiveEditBox(box, onSave, allowMedia){
  activeEditBox = box;
  activeEditOnSave = onSave || (()=>{});
  activeEditAllowMedia = allowMedia !== false;
}

/* يُستدعى بدل buildToolbar القديمة: يجعل الصندوق قابلاً للتحرير عبر الشريط
   العلوي الموحّد بمجرد التركيز عليه (أو فورًا لصندوق المحتوى الرئيسي). */
function attachEditable(box, onSave, opts){
  opts = opts || {};
  box.addEventListener('focus', ()=> setActiveEditBox(box, onSave, opts.media));
  return globalSaveStatus;
}

function initGlobalEditToolbar(){
  const bar=document.getElementById('editToolbar');
  if(!bar || bar._initDone) return;
  bar._initDone = true;

  /* نجبر أوامر التنسيق تنتج style="..." حديثة بدل وسوم HTML قديمة مهجورة
     مثل <font> أو <b> — لأن أداة التنظيف الأمنية (DOMPurify) قد تتعامل مع
     الوسوم القديمة بشكل مختلف، بينما خاصية style مسموحة ومضمونة دائمًا. */
  function ensureStyleMode(){
    try{ document.execCommand('styleWithCSS', false, true); }catch(e){}
  }

  function withActive(fn){
    return ()=>{
      if(!activeEditBox) return;
      fn();
    };
  }
  function cmdBtn(icon, title, cmd, val){
    const b=iconBtn(icon, title, 'et-btn');
    b.onmousedown=(e)=>e.preventDefault();
    b.onclick=withActive(()=>{
      activeEditBox.focus();
      ensureStyleMode();
      document.execCommand(cmd, false, val||null);
      activeEditOnSave();
    });
    return b;
  }
  function sep(){ const s=document.createElement('div'); s.className='sep'; return s; }

  const blockSelect=document.createElement('select');
  blockSelect.className='block-format-select';
  [['P','نص عادي'],['H2','عنوان كبير'],['H3','عنوان فرعي'],['BLOCKQUOTE','اقتباس']].forEach(([tag,label])=>{
    const o=document.createElement('option'); o.value=tag; o.textContent=label; blockSelect.appendChild(o);
  });
  blockSelect.onmousedown=()=>{ if(activeEditBox) saveSelection(); };
  blockSelect.onchange=withActive(()=>{
    restoreSelection(activeEditBox);
    document.execCommand('formatBlock', false, blockSelect.value);
    activeEditOnSave();
  });
  bar.appendChild(blockSelect);
  bar.appendChild(sep());

  /* اختيار نوع الخط — مجموعة خطوط عربية متنوعة الطابع (كوفي، نسخي كلاسيكي،
     خط عريض جريء، خط أنيق للعناوين...) يمكن تطبيقها على أي نص محدد. */
  const fontSelect=document.createElement('select');
  fontSelect.className='font-family-select';
  [
    ['', 'الخط الافتراضي'],
    ['Cairo', 'القاهرة (Cairo)'],
    ['Tajawal', 'تجوّل (Tajawal)'],
    ['Almarai', 'المرعي (Almarai)'],
    ['IBM Plex Sans Arabic', 'آي بي إم (عصري)'],
    ['Noto Kufi Arabic', 'نوتو كوفي'],
    ['Reem Kufi', 'ريم كوفي (أنيق)'],
    ['Aref Ruqaa', 'عارف رقعة (خط يد)'],
    ['Amiri', 'أميري (نسخي كلاسيكي)'],
    ['Markazi Text', 'مركزي (أدبي)'],
    ['Lalezar', 'لاله زار (عريض جريء)'],
  ].forEach(([fam,label])=>{
    const o=document.createElement('option');
    o.value=fam; o.textContent=label;
    if(fam) o.style.fontFamily = `'${fam}'`;
    fontSelect.appendChild(o);
  });
  fontSelect.onmousedown=()=>{ if(activeEditBox) saveSelection(); };
  fontSelect.onchange=withActive(()=>{
    restoreSelection(activeEditBox);
    ensureStyleMode();
    if(fontSelect.value){
      document.execCommand('fontName', false, fontSelect.value);
    } else {
      /* "الخط الافتراضي": نغلّف التحديد بامتداد بلا خط مخصص بدل حذف كل
         التنسيق، عشان التثخين واللون والتسطير ما ينمسحون معه. */
      document.execCommand('fontName', false, 'inherit');
    }
    activeEditOnSave();
    fontSelect.value='';
  });
  bar.appendChild(fontSelect);

  /* حجم الخط */
  const sizeSelect=document.createElement('select');
  sizeSelect.className='font-size-select';
  [['','الحجم'],['2','صغير'],['3','عادي'],['5','كبير'],['6','كبير جدًا'],['7','ضخم']].forEach(([val,label])=>{
    const o=document.createElement('option'); o.value=val; o.textContent=label; sizeSelect.appendChild(o);
  });
  sizeSelect.onmousedown=()=>{ if(activeEditBox) saveSelection(); };
  sizeSelect.onchange=withActive(()=>{
    if(!sizeSelect.value) return;
    restoreSelection(activeEditBox);
    ensureStyleMode();
    document.execCommand('fontSize', false, sizeSelect.value);
    activeEditOnSave();
    sizeSelect.value='';
  });
  bar.appendChild(sizeSelect);
  bar.appendChild(sep());

  bar.appendChild(cmdBtn('bold','غامق (Ctrl+B)','bold'));
  bar.appendChild(cmdBtn('underline','تسطير (Ctrl+U)','underline'));
  bar.appendChild(sep());

  bar.appendChild(cmdBtn('alignRight','محاذاة يمين','justifyRight'));
  bar.appendChild(cmdBtn('alignCenter','توسيط','justifyCenter'));
  bar.appendChild(cmdBtn('alignLeft','محاذاة يسار','justifyLeft'));
  bar.appendChild(sep());

  bar.appendChild(cmdBtn('list','قائمة نقطية','insertUnorderedList'));
  bar.appendChild(cmdBtn('listNum','قائمة مرقّمة','insertOrderedList'));
  bar.appendChild(sep());

  const colorWrap=document.createElement('div'); colorWrap.className='color-swatches';
  [['#ffffff','أبيض'],['#ef4444','أحمر'],['#3b82f6','أزرق'],['#22c55e','أخضر'],['#eab308','أصفر']].forEach(([hex,label])=>{
    const sw=document.createElement('button'); sw.type='button'; sw.className='color-swatch'; sw.title='لون النص: '+label;
    sw.style.background=hex;
    sw.onmousedown=(e)=>{ e.preventDefault(); if(activeEditBox) saveSelection(); };
    sw.onclick=withActive(()=>{
      restoreSelection(activeEditBox);
      ensureStyleMode();
      document.execCommand('foreColor', false, hex);
      activeEditOnSave();
    });
    colorWrap.appendChild(sw);
  });
  bar.appendChild(colorWrap);

  /* تظليل النص — لون خلفية خلف الكلمات المحددة، مفيد للتمييز داخل الفقرات
     الطويلة. "بدون" تزيل التظليل السابق. */
  const hiliteWrap=document.createElement('div'); hiliteWrap.className='color-swatches hilite-swatches';
  [['transparent','بدون'],['#fef08a','أصفر فاتح'],['#bbf7d0','أخضر فاتح'],['#bfdbfe','أزرق فاتح'],['#fbcfe8','وردي فاتح']].forEach(([hex,label])=>{
    const sw=document.createElement('button'); sw.type='button'; sw.className='color-swatch hilite-swatch'; sw.title='تظليل: '+label;
    sw.style.background = hex==='transparent' ? 'var(--bg-panel)' : hex;
    if(hex==='transparent') sw.innerHTML = ICONS.clear;
    sw.onmousedown=(e)=>{ e.preventDefault(); if(activeEditBox) saveSelection(); };
    sw.onclick=withActive(()=>{
      restoreSelection(activeEditBox);
      ensureStyleMode();
      document.execCommand('hiliteColor', false, hex);
      activeEditOnSave();
    });
    hiliteWrap.appendChild(sw);
  });
  bar.appendChild(hiliteWrap);
  bar.appendChild(sep());

  bar.appendChild(cmdBtn('strike','خط في المنتصف','strikeThrough'));

  /* مقتطف كود — يلف النص المحدد بخط ثابت العرض مع خلفية مميزة، مناسب
     لعرض أكواد أو أوامر أو مصطلحات تقنية داخل المقال. */
  const codeBtn=iconBtn('code','مقتطف كود','et-btn');
  codeBtn.onmousedown=(e)=>e.preventDefault();
  codeBtn.onclick=withActive(()=>{
    activeEditBox.focus();
    const sel=window.getSelection();
    if(!sel || sel.rangeCount===0 || sel.toString()==='') return;
    const text=sel.toString();
    document.execCommand('insertHTML', false, '<code class="inline-code">'+escapeHtml(text)+'</code>&#8203;');
    activeEditOnSave();
  });
  bar.appendChild(codeBtn);

  bar.appendChild(cmdBtn('hr','خط فاصل بين الأقسام','insertHorizontalRule'));

  /* إدراج جدول بسيط بعدد صفوف/أعمدة يحدده المؤسس */
  const tableBtn=iconBtn('table','إدراج جدول','et-btn');
  tableBtn.onmousedown=(e)=>{ e.preventDefault(); if(activeEditBox) saveSelection(); };
  tableBtn.onclick=withActive(()=>{
    const rowsStr=prompt('عدد الصفوف؟', '3');
    if(!rowsStr) return;
    const colsStr=prompt('عدد الأعمدة؟', '3');
    if(!colsStr) return;
    const rows=Math.max(1, Math.min(20, parseInt(rowsStr)||3));
    const cols=Math.max(1, Math.min(10, parseInt(colsStr)||3));
    let html='<table class="content-table"><tbody>';
    for(let r=0;r<rows;r++){
      html+='<tr>';
      for(let c=0;c<cols;c++) html+='<td>&nbsp;</td>';
      html+='</tr>';
    }
    html+='</tbody></table><p><br></p>';
    activeEditBox.focus();
    restoreSelection(activeEditBox);
    document.execCommand('insertHTML', false, html);
    activeEditOnSave();
  });
  bar.appendChild(tableBtn);
  bar.appendChild(sep());

  const imgLabel=document.createElement('label');
  imgLabel.className='tbtn et-btn'; imgLabel.title='إدراج صورة'; imgLabel.innerHTML=ICONS.image;
  const imgInput=document.createElement('input');
  imgInput.type='file'; imgInput.accept='image/*';
  imgInput.addEventListener('mousedown', ()=>{ if(activeEditBox) saveSelection(); });
  imgInput.onchange=async (e)=>{
    const file=e.target.files[0];
    if(!file || !activeEditBox) return;
    const box=activeEditBox, onSave=activeEditOnSave;
    imgInput.value='';
    showToast('⏳ جارِ رفع الصورة...');
    const url = await uploadMediaFile(file, 'image');
    if(!url) return;
    insertHtmlAtSelection(box, `<img src="${url}">`);
    enhanceMediaBlocks(box,onSave);
    onSave();
    showToast('✓ تمت إضافة الصورة');
  };
  imgLabel.appendChild(imgInput);
  bar.appendChild(imgLabel);

  const vidLabel=document.createElement('label');
  vidLabel.className='tbtn et-btn'; vidLabel.title='رفع فيديو'; vidLabel.innerHTML=ICONS.video;
  const vidInput=document.createElement('input');
  vidInput.type='file'; vidInput.accept='video/*';
  vidInput.addEventListener('mousedown', ()=>{ if(activeEditBox) saveSelection(); });
  vidInput.onchange=async (e)=>{
    const file=e.target.files[0];
    if(!file || !activeEditBox) return;
    const box=activeEditBox, onSave=activeEditOnSave;
    vidInput.value='';
    showToast('⏳ جارِ رفع الفيديو...');
    const url = await uploadMediaFile(file, 'video');
    if(!url) return;
    insertHtmlAtSelection(box, `<video src="${url}" controls></video>`);
    enhanceMediaBlocks(box,onSave);
    onSave();
    showToast('✓ تمت إضافة الفيديو');
  };
  vidLabel.appendChild(vidInput);
  bar.appendChild(vidLabel);

  const linkBtn=iconBtn('link','إدراج رابط','et-btn');
  linkBtn.onmousedown=(e)=>{ e.preventDefault(); if(activeEditBox) saveSelection(); };
  linkBtn.onclick=withActive(()=> openVideoModal(activeEditBox, activeEditOnSave, activeEditAllowMedia));
  bar.appendChild(linkBtn);
  bar.appendChild(sep());

  bar.appendChild(cmdBtn('undo','تراجع (Ctrl+Z)','undo'));
  bar.appendChild(cmdBtn('redo','إعادة (Ctrl+Y)','redo'));
  bar.appendChild(sep());

  /* معاينة قبل النشر — تعرض الصفحة تمامًا كما سيراها الزائر (بلا حدود
     تحرير ولا شريط أدوات) قبل ما تقرر نشر التغييرات فعليًا. */
  const previewBtn=iconBtn('eye','معاينة كزائر','et-btn');
  previewBtn.onmousedown=(e)=>e.preventDefault();
  previewBtn.onclick=()=> togglePreviewMode();
  bar.appendChild(previewBtn);

  /* وضع الكتابة بلا إلهاء — يخفي عناصر الواجهة غير الضرورية ويوسّع منطقة
     الكتابة، مناسب للمقالات الطويلة. */
  const focusBtn=iconBtn('focus','وضع الكتابة بدون إلهاء','et-btn');
  focusBtn.onmousedown=(e)=>e.preventDefault();
  focusBtn.onclick=()=>{
    const on = document.body.classList.toggle('focus-mode');
    focusBtn.classList.toggle('active', on);
  };
  bar.appendChild(focusBtn);

  globalSaveStatus = attachSaveStatus(bar);
}

let previewModeOn = false;
let previewExitBtnEl = null;
function togglePreviewMode(){
  if(!activeEditBox) return;
  previewModeOn = !previewModeOn;
  const bar=document.getElementById('editToolbar');

  if(previewModeOn){
    activeEditBox.contentEditable = false;
    activeEditBox.classList.add('preview-active');
    if(bar) bar.classList.add('hidden-in-preview');
    document.querySelectorAll('.admin-panel, .helper-note').forEach(el=> el.classList.add('hidden-in-preview'));

    previewExitBtnEl = document.createElement('button');
    previewExitBtnEl.id = 'previewExitBtn';
    previewExitBtnEl.className = 'preview-exit-btn';
    previewExitBtnEl.innerHTML = ICONS.pencil + '<span>عودة للتحرير</span>';
    previewExitBtnEl.onclick = ()=> togglePreviewMode();
    document.body.appendChild(previewExitBtnEl);
  } else {
    activeEditBox.contentEditable = true;
    activeEditBox.classList.remove('preview-active');
    if(bar) bar.classList.remove('hidden-in-preview');
    document.querySelectorAll('.admin-panel, .helper-note').forEach(el=> el.classList.remove('hidden-in-preview'));
    if(previewExitBtnEl){ previewExitBtnEl.remove(); previewExitBtnEl=null; }
    activeEditBox.focus();
  }
}

/* عند تبديل الصفحة أثناء المعاينة، الصندوق القديم قد يُزال من DOM بالكامل
   — نصفّر حالة المعاينة بأمان بدل ترك زر "عودة للتحرير" معلّقًا بلا فائدة. */
function resetPreviewMode(){
  if(!previewModeOn) return;
  previewModeOn = false;
  const bar=document.getElementById('editToolbar');
  if(bar) bar.classList.remove('hidden-in-preview');
  document.querySelectorAll('.admin-panel, .helper-note').forEach(el=> el.classList.remove('hidden-in-preview'));
  if(previewExitBtnEl){ previewExitBtnEl.remove(); previewExitBtnEl=null; }
}
function renderContentPage(p){
  const sub = getSubtitle(p, '');
  let html = '';
  if(sub) html += `<div class="page-sub">${escapeHtml(sub)}</div>`;
  mainContent.innerHTML = html;

  if(state.admin){
    const fieldLbl=document.createElement('div');
    fieldLbl.className='field-label';
    fieldLbl.textContent='نص الصفحة';
    mainContent.appendChild(fieldLbl);

    const box=document.createElement('div');
    box.className='content-box';
    box.contentEditable = true;
    box.innerHTML = sanitizeHtml(p.content || '');
    mainContent.appendChild(box);

    const onSave = ()=>saveContent(box,p);
    attachEditable(box, onSave, {media:true});
    setActiveEditBox(box, onSave, true);

    enhanceMediaBlocks(box, onSave);
    /* تأخير الحفظ للخادم لحين توقف الكتابة (900 ملّي ثانية) بدل إرسال طلب
       حفظ منفصل مع كل حرف — هذا كان يسبب تهنيج ملحوظ أثناء الكتابة. */
    const debouncedSave = debounce(()=>{ p.content = cleanContentHtml(box); saveDraft(); }, 900);
    box.addEventListener('input', debouncedSave);

    const note=document.createElement('div');
    note.className='helper-note';
    note.innerHTML = ICONS.up + '<span>أدوات التنسيق ثابتة أعلى الصفحة، ومرر المؤشر فوق أي صورة أو فيديو لإظهار أزرار نقله للأعلى أو الأسفل أو حذفه.</span>';
    mainContent.appendChild(note);

    const panel=document.createElement('div');
    panel.className='admin-panel';
    panel.innerHTML=`<div class="label">إدارة الصفحة</div>`;
    const row=document.createElement('div'); row.className='admin-row';

    const addSub=labeledBtn('plus','إضافة صفحة فرعية');
    addSub.onclick=()=>openPageModal(p.id);
    row.appendChild(addSub);

    const rename=labeledBtn('pencil','إعادة تسمية');
    rename.onclick=()=>{
      const newTitle=prompt('العنوان الجديد:', p.title);
      if(newTitle && newTitle.trim()){ p.title=newTitle.trim(); save(); renderAll(); }
    };
    row.appendChild(rename);

    const subBtn=labeledBtn('doc','الوصف الفرعي');
    subBtn.title='تعديل الوصف الفرعي (يمكن تركه فارغًا لإخفائه)';
    subBtn.onclick=()=>{
      const current=getSubtitle(p, '');
      const newSub=prompt('الوصف الفرعي (اتركه فارغًا لإخفائه):', current);
      if(newSub!==null){ p.subtitle=newSub.trim(); save(); renderAll(); }
    };
    row.appendChild(subBtn);

    panel.appendChild(row);
    mainContent.appendChild(panel);

    renderEndLinksSection(p);
    mainContent.appendChild(buildEndLinksAdminPanel(p, ()=>renderContentPage(p)));
  } else {
    const box=document.createElement('div');
    box.className='content-box';
    if(p.content){
      box.innerHTML = sanitizeHtml(p.content);
    } else {
      box.innerHTML='<span class="empty-hint">لا يوجد محتوى بعد.</span>';
    }
    mainContent.appendChild(box);

    renderEndLinksSection(p);
  }
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
  qText.onclick=()=>{
    const isOpen=a.classList.toggle('open');
    updateUrlAndMeta(p, isOpen?item:null, isOpen?i:null);
  };
  if(pendingQaNumber!==null && i===pendingQaNumber-1){
    a.classList.add('open');
    setTimeout(()=>box.scrollIntoView({behavior:'smooth', block:'start'}), 60);
    pendingQaNumber=null;
  }

  if(state.admin){
    const actions=document.createElement('div'); actions.className='row-actions';
    if(i>0){
      const up=iconBtn('up','نقل لأعلى','mini-btn');
      up.onclick=(e)=>{ e.stopPropagation(); const t=p.qa[i-1]; p.qa[i-1]=p.qa[i]; p.qa[i]=t; save(); renderQuestionsPage(p); };
      actions.appendChild(up);
    }
    if(i<p.qa.length-1){
      const down=iconBtn('down','نقل لأسفل','mini-btn');
      down.onclick=(e)=>{ e.stopPropagation(); const t=p.qa[i+1]; p.qa[i+1]=p.qa[i]; p.qa[i]=t; save(); renderQuestionsPage(p); };
      actions.appendChild(down);
    }
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
  const qInput=document.createElement('input');
  qInput.placeholder='السؤال'; qInput.value=item.q;
  form.appendChild(qInput);
  box.appendChild(form);

  const aBox=document.createElement('div');
  aBox.className='content-box'; aBox.contentEditable=true;
  aBox.style.minHeight='90px';
  aBox.innerHTML=sanitizeHtml(item.a||'');
  attachEditable(aBox, ()=>{}, {media:false});
  enhanceMediaBlocks(aBox, ()=>{});
  box.appendChild(aBox);

  qInput.addEventListener('keydown',(e)=>{
    if(e.key==='Enter'){ e.preventDefault(); aBox.focus(); }
  });

  const actions=document.createElement('div'); actions.className='qa-edit-actions';
  const saveBtn=document.createElement('button'); saveBtn.className='text-btn primary'; saveBtn.textContent='حفظ';
  saveBtn.onclick=()=>{
    const newQ=qInput.value.trim();
    if(!newQ) return;
    item.q=newQ;
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

  const qLbl=document.createElement('div'); qLbl.className='field-label'; qLbl.textContent='السؤال';
  form.appendChild(qLbl);
  const q=document.createElement('input'); q.placeholder='اكتب نص السؤال هنا';
  form.appendChild(q);
  panel.appendChild(form);

  const aLbl=document.createElement('div'); aLbl.className='field-label'; aLbl.style.marginTop='4px'; aLbl.textContent='الإجابة';
  panel.appendChild(aLbl);
  const aBox=document.createElement('div');
  aBox.className='content-box'; aBox.contentEditable=true;
  aBox.style.minHeight='90px';
  attachEditable(aBox, ()=>{}, {media:false});
  enhanceMediaBlocks(aBox, ()=>{});
  panel.appendChild(aBox);

  q.addEventListener('keydown',(e)=>{
    if(e.key==='Enter'){ e.preventDefault(); aBox.focus(); }
  });

  function publishQuestion(){
    const qVal=q.value.trim();
    if(!qVal){ q.focus(); return; }
    if(!aBox.textContent.trim()){ aBox.focus(); return; }
    p.qa = p.qa||[];
    p.qa.push({id:uid(), q:qVal, a:cleanContentHtml(aBox)});
    save();
    showToast('✓ تمت إضافة السؤال ونشره');
    renderQuestionsPage(p);
  }

  /* اختصار لوحة المفاتيح Ctrl+Shift لإضافة السؤال ونشره — هذا هو الأسلوب
     الوحيد للإضافة، بدون زر منفصل. */
  let shortcutArmed=false;
  panel.addEventListener('keydown', (e)=>{
    if(e.ctrlKey && e.shiftKey && !shortcutArmed){
      shortcutArmed=true;
      e.preventDefault();
      publishQuestion();
    }
  });
  panel.addEventListener('keyup', (e)=>{
    if(e.key==='Control' || e.key==='Shift') shortcutArmed=false;
  });

  const note=document.createElement('div');
  note.className='helper-note';
  note.innerHTML = ICONS.up + '<span>اضغط Ctrl+Shift داخل هذا القسم لإضافة السؤال ونشره مباشرة.</span>';
  panel.appendChild(note);

  return panel;
}

function buildPageManagePanel(p, addLabel){
  const panel=document.createElement('div'); panel.className='admin-panel';
  panel.innerHTML='<div class="label">إدارة الصفحة</div>';
  const row=document.createElement('div'); row.className='admin-row';
  const addSub=labeledBtn('plus', addLabel||'إضافة صفحة فرعية');
  addSub.onclick=()=>openPageModal(p.id);
  row.appendChild(addSub);
  const rename=labeledBtn('pencil','إعادة تسمية');
  rename.onclick=()=>{
    const newTitle=prompt('العنوان الجديد:', p.title);
    if(newTitle && newTitle.trim()){ p.title=newTitle.trim(); save(); renderAll(); }
  };
  row.appendChild(rename);
  const subBtn=labeledBtn('doc','الوصف الفرعي');
  subBtn.title='تعديل الوصف الفرعي (يمكن تركه فارغًا لإخفائه)';
  subBtn.onclick=()=>{
    const current=getSubtitle(p, '');
    const newSub=prompt('الوصف الفرعي (اتركه فارغًا لإخفائه):', current);
    if(newSub!==null){ p.subtitle=newSub.trim(); save(); renderAll(); }
  };
  row.appendChild(subBtn);
  panel.appendChild(row);
  return panel;
}

/* ═══ قسم نهاية الصفحة: رابط ينقل الزائر لصفحة أخرى ═══ */
/* ═══ أقسام نهاية الصفحة: يمكن إدراج أكثر من رابط واحد ينقل الزائر
   لصفحات أخرى داخل الموقع، وتُعرض كل الروابط بالترتيب الذي أُضيفت به ═══ */
function ensureEndLinks(p){
  if(!p.endLinks){
    p.endLinks = (p.endLink && p.endLink.targetId) ? [{ id:uid(), targetId:p.endLink.targetId }] : [];
    delete p.endLink;
  }
  return p.endLinks;
}

function renderEndLinksSection(p){
  const links = ensureEndLinks(p).filter(l=> l.targetId && findPage(l.targetId));
  if(!links.length) return;
  const wrap=document.createElement('div'); wrap.className='end-link-wrap';
  links.forEach(link=>{
    const target=findPage(link.targetId);
    const card=document.createElement('a');
    card.href='#'; card.className='end-link-card';
    card.innerHTML = `<span class="end-link-title"></span><span class="enter-arrow"></span>`;
    card.querySelector('.end-link-title').textContent = target.title;
    card.querySelector('.enter-arrow').innerHTML = ICONS.arrowEnd;
    card.onclick=(e)=>{ e.preventDefault(); state.activePage=target.id; save(); renderAll(); window.scrollTo({top:0, behavior:'smooth'}); };
    wrap.appendChild(card);
  });
  mainContent.appendChild(wrap);
}

function buildEndLinksAdminPanel(p, rerender){
  const links = ensureEndLinks(p);
  const panel=document.createElement('div'); panel.className='admin-panel';
  panel.innerHTML='<div class="label">End-of-Page Links (link to other pages)</div>';

  if(links.length){
    const list=document.createElement('div'); list.className='teams-list';
    links.forEach(link=>{
      const target=findPage(link.targetId);
      const chip=document.createElement('span'); chip.className='team-chip-admin';
      const nameSpan=document.createElement('span'); nameSpan.textContent = target ? target.title : '(deleted page)';
      chip.appendChild(nameSpan);
      const rm=iconBtn('close','Remove link','mini-btn');
      rm.onclick=()=>{
        const idx=links.indexOf(link);
        if(idx>-1) links.splice(idx,1);
        save();
        showToast('✓ Link removed');
        rerender();
      };
      chip.appendChild(rm);
      list.appendChild(chip);
    });
    panel.appendChild(list);
  }

  const form=document.createElement('div'); form.className='qa-form';
  const select=document.createElement('select');
  select.className='admin-select';
  select.innerHTML='<option value="">-- Choose a page to link to --</option>';
  allPagesFlat().forEach(item=>{
    if(item.id===p.id) return;
    const opt=document.createElement('option');
    opt.value=item.id;
    opt.textContent='—'.repeat(item.depth)+' '+item.title;
    select.appendChild(opt);
  });
  form.appendChild(select);
  panel.appendChild(form);

  const actions=document.createElement('div'); actions.className='qa-edit-actions';
  const addBtn=document.createElement('button'); addBtn.className='text-btn primary'; addBtn.textContent='Add Link';
  addBtn.onclick=()=>{
    if(!select.value) return;
    if(links.some(l=> l.targetId===select.value)){ showToast('This link is already added'); return; }
    links.push({ id:uid(), targetId:select.value });
    save();
    showToast('✓ Link added');
    rerender();
  };
  actions.appendChild(addBtn);
  panel.appendChild(actions);
  return panel;
}

function renderQuestionsPage(p){
  const sub = getSubtitle(p, '');
  let html = '';
  if(sub) html += `<div class="page-sub">${escapeHtml(sub)}</div>`;
  mainContent.innerHTML = html;

  (p.qa||[]).forEach((item,i)=>{
    mainContent.appendChild(renderQaItem(p, item, i));
  });

  if(!(p.qa && p.qa.length)){
    const empty=document.createElement('div');
    empty.className='empty-hint'; empty.style.marginTop='4px';
    empty.textContent='لا توجد أسئلة بعد.';
    mainContent.appendChild(empty);
  }

  renderEndLinksSection(p);

  if(state.admin){
    mainContent.appendChild(buildQaAddForm(p));
    mainContent.appendChild(buildPageManagePanel(p));
    mainContent.appendChild(buildEndLinksAdminPanel(p, ()=>renderQuestionsPage(p)));
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
    const fieldLbl=document.createElement('div');
    fieldLbl.className='field-label';
    fieldLbl.textContent='نص الصفحة';
    mainContent.appendChild(fieldLbl);

    const box=document.createElement('div');
    box.className='content-box';
    box.contentEditable = true;
    box.innerHTML = sanitizeHtml(p.content || '');
    mainContent.appendChild(box);

    const onSave = ()=>saveContent(box,p);
    attachEditable(box, onSave, {media:true});
    setActiveEditBox(box, onSave, true);

    enhanceMediaBlocks(box, onSave);
    const debouncedSave = debounce(()=>{ p.content = cleanContentHtml(box); saveDraft(); }, 900);
    box.addEventListener('input', debouncedSave);
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

  if(state.admin){
    mainContent.appendChild(buildEndLinksAdminPanel(p, ()=>renderHubPage(p)));
  }

  renderEndLinksSection(p);
}

/* ══════════════════════════════════════════════════════════
   نوع صفحة "الشخصيات": فريق من الشخصيات يُعرض على شكل شرائح
   بملء الشاشة (شخصية واحدة كاملة في كل مرة)، والانتقال بينها
   بالسحب/التمرير الأفقي تمامًا كتصميم help.html المرجعي:
   - اسم الشخصية: أعلى الوسط.
   - صورة الشخصية: أعلى يمين الصفحة.
   - قصة الشخصية: أعلى يسار الصفحة (بجانب الصورة مباشرة).
   - وصف الشخصية: أسفل الصورة والقصة.
   الفرق نفسها عنصر أساسي يحدّده المؤسس مسبقًا (p.teams)، وعند
   إضافة/تعديل شخصية يُختار فريقها من تلك القائمة عبر قائمة منسدلة،
   لا بكتابة حرة. يمكن أيضًا تصفية الشرائح حسب الفريق أو القفز
   مباشرة لاسم شخصية معيّنة عبر لوحة سفلية، كالملف الأصلي.
   ══════════════════════════════════════════════════════════ */

let charsPagerInstance = null;
let charsPagerList = [];
function ensureCharTeams(p){ p.teams = p.teams || []; return p.teams; }

/* ─── Team management panel: the founder adds/removes team names here,
   which is the only source used to build the team dropdown for each
   character ─── */
function buildTeamsAdminPanel(p, rerender){
  const teams = ensureCharTeams(p);
  const panel=document.createElement('div'); panel.className='admin-panel';
  panel.innerHTML='<div class="label">Character Teams</div>';

  if(teams.length){
    const list=document.createElement('div'); list.className='teams-list';
    teams.forEach((t,i)=>{
      const chip=document.createElement('span'); chip.className='team-chip-admin';
      const nameSpan=document.createElement('span'); nameSpan.textContent=t;
      chip.appendChild(nameSpan);
      const rm=iconBtn('close','Remove team','mini-btn');
      rm.onclick=()=>{
        if(confirm('Remove team "'+t+'"? Any character descriptions already written won\'t be affected.')){
          teams.splice(i,1); save(); rerender();
        }
      };
      chip.appendChild(rm);
      list.appendChild(chip);
    });
    panel.appendChild(list);
  } else {
    const empty=document.createElement('div'); empty.className='empty-hint'; empty.style.marginBottom='10px';
    empty.textContent='No teams added yet — add the first team so it becomes available when creating characters.';
    panel.appendChild(empty);
  }

  const row=document.createElement('div'); row.className='qa-form'; row.style.marginTop='6px';
  const input=document.createElement('input'); input.placeholder='New team name';
  row.appendChild(input);
  panel.appendChild(row);

  const actions=document.createElement('div'); actions.className='qa-edit-actions';
  const addBtn=document.createElement('button'); addBtn.className='text-btn primary'; addBtn.textContent='Add Team';
  addBtn.onclick=()=>{
    const v=input.value.trim();
    if(!v) return;
    if(teams.includes(v)){ input.value=''; return; }
    teams.push(v); save();
    showToast('✓ Team added');
    rerender();
  };
  input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); addBtn.click(); } });
  actions.appendChild(addBtn);
  panel.appendChild(actions);
  return panel;
}

function charBioHtml(ch){ return (ch && ch.bio) || ''; }
function charDescHtml(ch){ return (ch && ch.ability) || ''; }

function statsCard(ch){
  const stats=[
    ch.stats && ch.stats.height ? {label:'Height', value:ch.stats.height} : null,
    ch.stats && ch.stats.team   ? {label:'Team',   value:ch.stats.team}   : null,
  ].filter(Boolean);
  if(!stats.length) return '';
  return `<div class="char-stats">${stats.map(s=>
    `<div class="char-stat-row"><span class="char-stat-label">${escapeHtml(s.label)}:</span><span class="char-stat-value">${escapeHtml(s.value)}</span></div>`
  ).join('')}</div>`;
}

/* رابط مباشر لشخصية معيّنة: يُبنى بنفس مخطط روابط الأسئلة (رقم الشخصية
   داخل مصفوفة p.characters الكاملة، بصرف النظر عن أي تصفية حسب الفريق). */
function copyCharLink(p, ch){
  const idx = (p.characters||[]).indexOf(ch);
  if(idx<0) return;
  const path = buildPagePath(p, ch, idx);
  const url = location.origin + path;
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(
      ()=> showToast('✓ Character link copied'),
      ()=> prompt('Copy character link:', url)
    );
  } else {
    prompt('Copy character link:', url);
  }
}

function renderCharSlide(p, ch, i){
  const slide=document.createElement('div');
  slide.className='char-slide';
  slide.dataset.i=i;
  slide.dataset.charId=ch.id;

  slide.innerHTML = `
    <div class="char-name-top">${escapeHtml(ch.name||'Unnamed')}</div>
    <div class="char-top-row">
      <div class="char-bio-side">
        <div class="ch-section-label">${ICONS.user}<span>Character Story</span></div>
        <div class="char-bio-text">${sanitizeHtml(charBioHtml(ch)) || '<p class="ch-desc empty-hint">No story yet.</p>'}</div>
      </div>
      <div class="char-portrait-wrap">
        <div class="char-portrait">
          ${ch.img ? `<img src="${ch.img}" alt="" onerror="this.closest('.char-portrait').classList.add('ph');this.remove();">` : ''}
          ${statsCard(ch)}
        </div>
      </div>
    </div>
    <div class="char-desc-wrap">
      <div class="ch-section-label">${ICONS.doc}<span>Description</span></div>
      <div class="char-desc-text">${sanitizeHtml(charDescHtml(ch)) || '<p class="ch-desc empty-hint">No description yet.</p>'}</div>
    </div>
  `;

  if(!ch.img) slide.querySelector('.char-portrait').classList.add('ph');

  const actions=document.createElement('div'); actions.className='row-actions char-actions';
  const linkBtn=iconBtn('link','Copy link to this character','mini-btn');
  linkBtn.onclick=()=> copyCharLink(p, ch);
  actions.appendChild(linkBtn);
  if(state.admin){
    const edit=iconBtn('pencil','Edit character','mini-btn');
    edit.onclick=()=> renderCharEditForm(p, ch, slide);
    actions.appendChild(edit);
    const del=iconBtn('trash','Delete character','mini-btn');
    del.onclick=()=>{
      if(confirm('Delete this character?')){
        const idx=(p.characters||[]).indexOf(ch);
        if(idx>-1) p.characters.splice(idx,1);
        save(); renderCharsPage(p);
      }
    };
    actions.appendChild(del);
  }
  slide.appendChild(actions);

  return slide;
}

function buildCharForm(p, existing, onDone){
  const wrap=document.createElement('div'); wrap.className='char-form';

  const nameRow=document.createElement('div'); nameRow.className='qa-form';
  const nameInput=document.createElement('input'); nameInput.placeholder='Character name';
  nameInput.value = (existing && existing.name) || '';
  nameRow.appendChild(nameInput);
  wrap.appendChild(nameRow);

  const statsRow=document.createElement('div'); statsRow.className='qa-form';
  const heightInput=document.createElement('input'); heightInput.placeholder='Height (optional)';
  heightInput.value = (existing && existing.stats && existing.stats.height) || '';
  statsRow.appendChild(heightInput);
  wrap.appendChild(statsRow);

  /* الفريق يُختار من القائمة التي حدّدها المؤسس مسبقًا (p.teams)، وليس
     نصًا حرًا — إن لم تُضف أي فرق بعد، يظهر تنبيه لإضافتها أولًا. */
  const teams = ensureCharTeams(p);
  const teamLbl=document.createElement('div'); teamLbl.className='field-label'; teamLbl.textContent='Team';
  wrap.appendChild(teamLbl);
  const teamSelect=document.createElement('select'); teamSelect.className='admin-select';
  teamSelect.innerHTML='<option value="">-- No team --</option>' +
    teams.map(t=>`<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
  if(existing && existing.stats && existing.stats.team) teamSelect.value = existing.stats.team;
  wrap.appendChild(teamSelect);
  if(!teams.length){
    const hint=document.createElement('div'); hint.className='helper-note';
    hint.innerHTML = ICONS.up + '<span>No teams yet — add one from the "Character Teams" panel below the page first.</span>';
    wrap.appendChild(hint);
  }

  let imgUrl = (existing && existing.img) || '';
  const imgRow=document.createElement('div'); imgRow.className='char-img-row';
  const preview=document.createElement('div'); preview.className='char-img-preview';
  if(imgUrl) preview.innerHTML=`<img src="${imgUrl}" alt="">`;
  const imgLabel=document.createElement('label'); imgLabel.className='text-btn primary'; imgLabel.textContent='Choose Image';
  const imgInput=document.createElement('input'); imgInput.type='file'; imgInput.accept='image/*';
  imgInput.onchange=async (e)=>{
    const file=e.target.files[0];
    if(!file) return;
    showToast('⏳ Uploading image...');
    const url = await uploadMediaFile(file, 'image');
    if(!url) return;
    imgUrl = url;
    preview.innerHTML = `<img src="${imgUrl}" alt="">`;
    showToast('✓ Image uploaded');
  };
  imgLabel.appendChild(imgInput);
  imgRow.appendChild(preview); imgRow.appendChild(imgLabel);
  wrap.appendChild(imgRow);

  const bioLbl=document.createElement('div'); bioLbl.className='field-label'; bioLbl.textContent='Character Story';
  wrap.appendChild(bioLbl);
  const bioBox=document.createElement('div'); bioBox.className='content-box'; bioBox.contentEditable=true; bioBox.style.minHeight='70px';
  bioBox.innerHTML = sanitizeHtml((existing && existing.bio) || '');
  attachEditable(bioBox, ()=>{}, {media:false});
  wrap.appendChild(bioBox);

  const descLbl=document.createElement('div'); descLbl.className='field-label'; descLbl.style.marginTop='8px'; descLbl.textContent='Description (optional)';
  wrap.appendChild(descLbl);
  const descBox=document.createElement('div'); descBox.className='content-box'; descBox.contentEditable=true; descBox.style.minHeight='70px';
  descBox.innerHTML = sanitizeHtml((existing && existing.ability) || '');
  attachEditable(descBox, ()=>{}, {media:false});
  wrap.appendChild(descBox);

  const actions=document.createElement('div'); actions.className='qa-edit-actions';
  const saveBtn=document.createElement('button'); saveBtn.className='text-btn primary';
  saveBtn.textContent = existing ? 'Save Changes' : 'Add & Publish Character';
  saveBtn.onclick=()=>{
    const name=nameInput.value.trim();
    if(!name){ nameInput.focus(); return; }
    const data = {
      id: (existing && existing.id) || uid(),
      name,
      img: imgUrl,
      stats: { height:heightInput.value.trim(), team:teamSelect.value },
      bio: cleanContentHtml(bioBox),
      ability: cleanContentHtml(descBox)
    };
    if(existing){
      existing.name = data.name;
      existing.img = data.img;
      existing.stats = data.stats;
      existing.bio = data.bio;
      existing.ability = data.ability;
      delete existing.enName;
      if(existing.stats) delete existing.stats.kunya;
    } else {
      p.characters = p.characters || [];
      p.characters.push(data);
    }
    save();
    showToast('✓ Character saved');
    onDone();
  };
  const cancelBtn=document.createElement('button'); cancelBtn.className='text-btn'; cancelBtn.textContent='Cancel';
  cancelBtn.onclick=onDone;
  actions.appendChild(saveBtn); actions.appendChild(cancelBtn);
  wrap.appendChild(actions);

  return wrap;
}

function renderCharEditForm(p, ch, slideEl){
  const form = buildCharForm(p, ch, ()=> renderCharsPage(p));
  form.classList.add('char-form-standalone');
  slideEl.replaceWith(form);
}

/* ─── محرّك الشرائح: سحب/تمرير أفقي بشخصية واحدة كاملة في كل مرة،
   يعمل باللمس والفأرة معًا، بنفس أسلوب help.html المرجعي. ─── */
function makeCharPager(viewport, track, dotsWrap, count){
  let index=0, viewportW=viewport.clientWidth;
  let startX=0, startY=0, curX=0, axis=null, dragging=false;
  let dots=[];

  function buildDots(){
    dotsWrap.innerHTML = Array.from({length:count}, (_,i)=>
      `<div class="char-dot ${i===0?'active':''}" data-i="${i}"></div>`).join('');
    dots=[...dotsWrap.children];
    dots.forEach(d=> d.addEventListener('click', ()=> goTo(+d.dataset.i)));
  }
  buildDots();

  function setTransform(px, animate){
    track.style.transition = animate ? 'transform .32s cubic-bezier(.22,.61,.36,1)' : 'none';
    track.style.transform = `translateX(${px}px)`;
  }
  function updateDots(){ dots.forEach((d,i)=> d.classList.toggle('active', i===index)); }
  function goTo(i, animate=true){
    index = Math.max(0, Math.min(count-1, i));
    viewportW = viewport.clientWidth;
    setTransform(-index*viewportW, animate);
    updateDots();
  }

  function getXY(e){
    if(e.touches && e.touches.length) return {x:e.touches[0].clientX, y:e.touches[0].clientY};
    if(e.changedTouches && e.changedTouches.length) return {x:e.changedTouches[0].clientX, y:e.changedTouches[0].clientY};
    return {x:e.clientX, y:e.clientY};
  }
  function onStart(e){
    if(e.type==='mousedown' && e.button!==0) return;
    if(e.target.closest('.char-bio-text, .char-desc-text, button, a')) return; /* السماح بتحديد النص والنقر على الأزرار */
    dragging=true; axis=null;
    const p=getXY(e);
    startX=curX=p.x; startY=p.y;
    viewportW=viewport.clientWidth;
    setTransform(-index*viewportW, false);
  }
  function onMove(e){
    if(!dragging) return;
    const p=getXY(e);
    curX=p.x;
    const dx=curX-startX, dy=p.y-startY;
    if(axis===null){
      if(Math.abs(dx)>6 || Math.abs(dy)>6) axis = Math.abs(dx)>Math.abs(dy) ? 'x' : 'y';
      else return;
    }
    if(axis!=='x'){ dragging=false; return; } /* حركة عمودية: نتركها لتمرير الصفحة الطبيعي */
    if(e.cancelable) e.preventDefault();
    let d=dx;
    if((index===0 && d>0) || (index===count-1 && d<0)) d*=.35;
    setTransform(-index*viewportW+d, false);
  }
  function onEnd(){
    if(!dragging) return;
    dragging=false;
    if(axis!=='x') return;
    const delta=curX-startX;
    const threshold=viewportW*0.15;
    if(delta<-threshold) goTo(index+1);
    else if(delta>threshold) goTo(index-1);
    else goTo(index);
  }

  viewport.addEventListener('touchstart', onStart, {passive:true});
  viewport.addEventListener('touchmove', onMove, {passive:false});
  viewport.addEventListener('touchend', onEnd);
  viewport.addEventListener('touchcancel', onEnd);
  viewport.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('resize', ()=> goTo(index, false));

  goTo(0, false);
  return { goTo, get index(){ return index; } };
}

/* ─── لوحة سفلية: تصفية حسب الفريق أو القفز مباشرة لاسم شخصية،
   بنفس فكرة زر الفرق في الملف الأصلي. ─── */
/* ─── القائمة المنسدلة: تفتح تحت زر "تصفّح الشخصيات" مباشرة (لا كورقة
   سفلية بعد الآن)، بحواف حادة، مع تظليل خلفي يمنع أي تفاعل خلفها. ─── */
function buildCharFilterMenu(p, list, pager){
  const teams = ensureCharTeams(p).filter(t=> list.some(ch=> ch.stats && ch.stats.team===t));
  const wrap=document.createElement('div'); wrap.className='char-filter-wrap';

  const btn=document.createElement('button'); btn.className='char-filter-btn'; btn.type='button';
  btn.innerHTML = '<span>Browse Characters</span>' + ICONS.chevron;
  const backdrop=document.createElement('div'); backdrop.className='char-filter-backdrop';
  const sheet=document.createElement('div'); sheet.className='char-filter-sheet';

  if(teams.length){
    const teamsRow=document.createElement('div'); teamsRow.className='char-filter-teams';
    const allChip=document.createElement('button'); allChip.className='team-chip active'; allChip.textContent='All';
    allChip.onclick=()=>{ mainContent.dataset.activeTeam='All'; renderCharsPage(p); };
    teamsRow.appendChild(allChip);
    teams.forEach(t=>{
      const chip=document.createElement('button'); chip.className='team-chip'; chip.textContent=t;
      chip.onclick=()=>{ mainContent.dataset.activeTeam=t; renderCharsPage(p); };
      teamsRow.appendChild(chip);
    });
    sheet.appendChild(teamsRow);
  }

  const namesList=document.createElement('div'); namesList.className='char-filter-names';
  list.forEach((ch,i)=>{
    const nameBtn=document.createElement('button'); nameBtn.className='char-filter-name';
    nameBtn.textContent = ch.name || 'Unnamed';
    nameBtn.onclick=()=>{ pager.goTo(i); closeMenu(); };
    namesList.appendChild(nameBtn);
  });
  sheet.appendChild(namesList);

  function openMenu(){ sheet.classList.add('open'); backdrop.classList.add('open'); btn.classList.add('open'); }
  function closeMenu(){ sheet.classList.remove('open'); backdrop.classList.remove('open'); btn.classList.remove('open'); }
  btn.onclick=()=> sheet.classList.contains('open') ? closeMenu() : openMenu();
  backdrop.onclick=closeMenu;

  wrap.appendChild(btn);
  wrap.appendChild(backdrop);
  wrap.appendChild(sheet);
  return wrap;
}

function renderCharsPage(p){
  const sub = getSubtitle(p, '');
  let html = '';
  if(sub) html += `<div class="page-sub">${escapeHtml(sub)}</div>`;
  mainContent.innerHTML = html;

  const teams = ensureCharTeams(p);
  const all = p.characters || [];
  /* رابط مباشر لشخصية معيّنة (pendingQaNumber رقمها ضمن p.characters الكاملة)
     يُلغي أي تصفية فريق مفعّلة حاليًا لضمان ظهور الشخصية المطلوبة فورًا. */
  if(pendingQaNumber!==null && all[pendingQaNumber-1]){
    mainContent.dataset.activeTeam = 'All';
  }
  const activeTeam = mainContent.dataset.activeTeam || 'All';
  const list = (activeTeam==='All' || !teams.length)
    ? all
    : all.filter(ch=> ch.stats && ch.stats.team===activeTeam);

  /* شريط علوي: زر تصفّح الشخصيات في أعلى الصفحة قبل الشرائح مباشرة */
  if(list.length && (list.length>1 || teams.length)){
    const topbar=document.createElement('div'); topbar.className='chars-topbar';
    mainContent.appendChild(topbar);
    /* الزر الفعلي يُبنى بعد إنشاء الـ pager (يحتاج مرجعه)، فنملأ الحاوية لاحقًا */
    topbar.dataset.placeholder='1';
  }

  const carouselOuter=document.createElement('div'); carouselOuter.className='char-carousel-outer';
  const viewport=document.createElement('div'); viewport.className='char-carousel-viewport';
  const track=document.createElement('div'); track.className='char-carousel-track';
  list.forEach((ch,i)=> track.appendChild(renderCharSlide(p, ch, i)));
  viewport.appendChild(track);
  carouselOuter.appendChild(viewport);
  mainContent.appendChild(carouselOuter);

  const dotsFooter=document.createElement('div'); dotsFooter.className='char-dots-footer';
  const dotsWrap=document.createElement('div'); dotsWrap.className='char-dots';
  dotsFooter.appendChild(dotsWrap);
  if(list.length>1) mainContent.appendChild(dotsFooter);

  if(list.length){
    const pager = makeCharPager(viewport, track, dotsWrap, list.length);
    charsPagerInstance = pager;
    charsPagerList = list;
    const topbar = mainContent.querySelector('.chars-topbar');
    if(topbar) topbar.appendChild(buildCharFilterMenu(p, list, pager));

    /* استهلاك رابط الشخصية المباشر: نقفز للشريحة المطلوبة ونوهّجها مرة واحدة */
    if(pendingQaNumber!==null){
      const targetChar = all[pendingQaNumber-1];
      const idxInList = targetChar ? list.indexOf(targetChar) : -1;
      if(idxInList>-1){
        pager.goTo(idxInList, false);
        setTimeout(()=>{
          const el=document.querySelector(`.char-slide[data-char-id="${targetChar.id}"]`);
          if(el) flashHighlight(el);
        }, 80);
      }
      pendingQaNumber=null;
    }
  } else {
    charsPagerInstance = null;
    charsPagerList = [];
    const empty=document.createElement('div'); empty.className='empty-hint'; empty.style.marginTop='10px';
    empty.textContent='No characters in this team.';
    mainContent.appendChild(empty);
  }

  if(state.admin){
    const addPanel=document.createElement('div'); addPanel.className='admin-panel';
    addPanel.innerHTML='<div class="label">Add New Character</div>';
    addPanel.appendChild(buildCharForm(p, null, ()=> renderCharsPage(p)));
    mainContent.appendChild(addPanel);

    mainContent.appendChild(buildTeamsAdminPanel(p, ()=>renderCharsPage(p)));
    mainContent.appendChild(buildEndLinksAdminPanel(p, ()=>renderCharsPage(p)));
  }

  renderEndLinksSection(p);
}


/* ══════════════════════════════════════════════════════════
   نوع صفحة "اللعبة": شرح اللعبة على شكل أقسام مرتّبة، كل قسم
   له عنوان ونص غني يدعم صورًا وفيديو وجداول (نفس أدوات التحرير).
   ══════════════════════════════════════════════════════════ */
function buildGameSection(p, sec, i, list){
  const box=document.createElement('div'); box.className='game-section';
  box.id='game-sec-'+sec.id;
  box.dataset.secId=sec.id;

  const num=document.createElement('div'); num.className='game-sec-num';
  num.textContent = String(i+1).padStart(2,'0');
  box.appendChild(num);

  const main=document.createElement('div'); main.className='game-sec-main';

  const head=document.createElement('div'); head.className='game-sec-head';
  const titleEl=document.createElement('h2'); titleEl.className='game-sec-title'; titleEl.textContent=sec.title||'';
  head.appendChild(titleEl);

  if(state.admin){
    const actions=document.createElement('div'); actions.className='row-actions';
    if(i>0){
      const up=iconBtn('up','نقل لأعلى','mini-btn');
      up.onclick=()=>{ const t=list[i-1]; list[i-1]=list[i]; list[i]=t; save(); renderGamePage(p); };
      actions.appendChild(up);
    }
    if(i<list.length-1){
      const down=iconBtn('down','نقل لأسفل','mini-btn');
      down.onclick=()=>{ const t=list[i+1]; list[i+1]=list[i]; list[i]=t; save(); renderGamePage(p); };
      actions.appendChild(down);
    }
    const edit=iconBtn('pencil','تعديل القسم','mini-btn');
    edit.onclick=()=> renderGameSectionEditForm(p, sec, box);
    actions.appendChild(edit);
    const del=iconBtn('trash','حذف القسم','mini-btn');
    del.onclick=()=>{
      if(confirm('حذف هذا القسم؟')){
        const idx=(p.sections||[]).indexOf(sec);
        if(idx>-1) p.sections.splice(idx,1);
        save(); renderGamePage(p);
      }
    };
    actions.appendChild(del);
    head.appendChild(actions);
  }
  main.appendChild(head);

  const body=document.createElement('div'); body.className='game-sec-body content-box';
  body.innerHTML = sanitizeHtml(sec.body || '');
  main.appendChild(body);

  box.appendChild(main);
  return box;
}

function renderGameSectionEditForm(p, sec, boxEl){
  const wrap=document.createElement('div'); wrap.className='game-sec-editing';

  const titleInput=document.createElement('input');
  titleInput.className='game-sec-title-input';
  titleInput.placeholder='عنوان القسم';
  titleInput.value = sec.title || '';
  wrap.appendChild(titleInput);

  const bodyBox=document.createElement('div'); bodyBox.className='content-box'; bodyBox.contentEditable=true; bodyBox.style.minHeight='120px';
  bodyBox.innerHTML = sanitizeHtml(sec.body || '');
  const onSave=()=>{};
  attachEditable(bodyBox, onSave, {media:true});
  setActiveEditBox(bodyBox, onSave, true);
  enhanceMediaBlocks(bodyBox, onSave);
  wrap.appendChild(bodyBox);

  const actions=document.createElement('div'); actions.className='qa-edit-actions';
  const saveBtn=document.createElement('button'); saveBtn.className='text-btn primary'; saveBtn.textContent='حفظ';
  saveBtn.onclick=()=>{
    const t=titleInput.value.trim();
    if(!t){ titleInput.focus(); return; }
    sec.title=t;
    sec.body=cleanContentHtml(bodyBox);
    save();
    showToast('✓ تم حفظ القسم');
    renderGamePage(p);
  };
  const cancelBtn=document.createElement('button'); cancelBtn.className='text-btn'; cancelBtn.textContent='إلغاء';
  cancelBtn.onclick=()=> renderGamePage(p);
  actions.appendChild(saveBtn); actions.appendChild(cancelBtn);
  wrap.appendChild(actions);

  boxEl.replaceWith(wrap);
}

function buildGameSectionAddForm(p){
  const panel=document.createElement('div'); panel.className='admin-panel';
  panel.innerHTML='<div class="label">إضافة قسم جديد لشرح اللعبة</div>';

  const titleInput=document.createElement('input');
  titleInput.className='game-sec-title-input';
  titleInput.placeholder='عنوان القسم (مثال: مرحلة الليل)';
  panel.appendChild(titleInput);

  const bodyBox=document.createElement('div'); bodyBox.className='content-box'; bodyBox.contentEditable=true; bodyBox.style.minHeight='120px';
  const onSave=()=>{};
  attachEditable(bodyBox, onSave, {media:true});
  enhanceMediaBlocks(bodyBox, onSave);
  panel.appendChild(bodyBox);

  const actions=document.createElement('div'); actions.className='qa-edit-actions';
  const saveBtn=document.createElement('button'); saveBtn.className='text-btn primary'; saveBtn.textContent='إضافة القسم ونشره';
  saveBtn.onclick=()=>{
    const t=titleInput.value.trim();
    if(!t){ titleInput.focus(); return; }
    p.sections = p.sections || [];
    p.sections.push({ id:uid(), title:t, body:cleanContentHtml(bodyBox) });
    save();
    showToast('✓ تمت إضافة القسم ونشره');
    renderGamePage(p);
  };
  actions.appendChild(saveBtn);
  panel.appendChild(actions);
  return panel;
}

function renderGamePage(p){
  const sub = getSubtitle(p, '');
  let html = '';
  if(sub) html += `<div class="page-sub">${escapeHtml(sub)}</div>`;
  mainContent.innerHTML = html;

  const list = p.sections || [];

  if(list.length>1){
    const toc=document.createElement('div'); toc.className='game-toc';
    list.forEach((sec,i)=>{
      const item=document.createElement('button'); item.className='game-toc-item'; item.type='button';
      item.innerHTML = `<span class="game-toc-num">${i+1}</span><span></span>`;
      item.querySelector('span:last-child').textContent = sec.title || '';
      item.onclick=()=>{
        const el=document.getElementById('game-sec-'+sec.id);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      };
      toc.appendChild(item);
    });
    mainContent.appendChild(toc);
  }

  list.forEach((sec,i)=> mainContent.appendChild(buildGameSection(p, sec, i, list)));

  if(!list.length){
    const empty=document.createElement('div'); empty.className='game-empty-hero';
    empty.innerHTML = ICONS.gamepad + '<span>لا توجد أقسام شرح بعد.</span>';
    mainContent.appendChild(empty);
  }

  if(state.admin){
    mainContent.appendChild(buildGameSectionAddForm(p));
    mainContent.appendChild(buildPageManagePanel(p, 'إضافة صفحة فرعية'));
    mainContent.appendChild(buildEndLinksAdminPanel(p, ()=>renderGamePage(p)));
  }

  renderEndLinksSection(p);
}

function renderMain(){
  resetPreviewMode();
  const p = findPage(state.activePage) || state.pages[0];
  const type = p.type || 'content';
  if(type==='qa') renderQuestionsPage(p);
  else if(type==='hub') renderHubPage(p);
  else if(type==='chars') renderCharsPage(p);
  else if(type==='game') renderGamePage(p);
  else renderContentPage(p);
  updateUrlAndMeta(p);

  /* حركة دخول سلسة عند تبديل الصفحات بدل الظهور المفاجئ */
  mainContent.classList.remove('page-enter');
  void mainContent.offsetWidth;
  mainContent.classList.add('page-enter');
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

document.getElementById('searchBtn').innerHTML = ICONS.search;
document.getElementById('askBtn').innerHTML = ICONS.ask;
document.getElementById('askCancel').innerHTML = ICONS.close;
document.getElementById('searchCancel').innerHTML = ICONS.close;
document.getElementById('saveBtn').innerHTML = ICONS.publish;
document.getElementById('inboxBtn').innerHTML = ICONS.inbox;
document.getElementById('langBtn').innerHTML = ICONS.globe;
initGlobalEditToolbar();

document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape' && document.body.classList.contains('focus-mode')){
    document.body.classList.remove('focus-mode');
    const focusBtnEl = document.querySelector('#editToolbar .et-btn.active');
    if(focusBtnEl) focusBtnEl.classList.remove('active');
  }
});

/* ---------------- زر النشر وصندوق الأسئلة الواردة (للمؤسس فقط) ---------------- */
document.getElementById('saveBtn').title='نشر التغييرات على الموقع';
document.getElementById('saveBtn').onclick=()=>{
  const hadChanges = hasUnpublishedChanges;
  save(globalSaveStatus);
  showToast(hadChanges ? '✓ تم نشر التغييرات' : '✓ لا تغييرات جديدة، لكن تم التأكيد');
};
document.getElementById('inboxBtn').onclick=()=> openInbox();

/* لغة/اتجاه الموقع: يُدخل المؤسس رمز اللغة (en, ar, fr...)، وتتكيف
   الصفحة بالكامل (الاتجاه والخطوط) تلقائيًا عبر applySiteDirection(). */
document.getElementById('langBtn').onclick=()=>{
  const current = state.siteLang || 'en';
  const input = prompt('رمز لغة الموقع (مثال: en للإنجليزية، ar للعربية، fr للفرنسية...):', current);
  if(input===null) return;
  const v = input.trim().toLowerCase();
  if(!v) return;
  state.siteLang = v;
  applySiteDirection();
  save();
  showToast('✓ تم تغيير لغة الموقع إلى: ' + v);
  renderAll();
};

/* ---------------- بوابة دخول المؤسس (رابط سري ?admin=1) ---------------- */
const lockScreenEl=document.getElementById('lockScreen');
let pendingLockEmail='';

function setLockLoading(btnId, textId, spId, loading){
  const btn=document.getElementById(btnId), sp=document.getElementById(spId);
  if(btn) btn.disabled=loading;
  if(sp) sp.style.display = loading ? 'block' : 'none';
}

const lockSendBtn=document.getElementById('lockSendBtn');
if(lockSendBtn){
  lockSendBtn.onclick=async ()=>{
    const email=document.getElementById('lockEmailInput').value.trim();
    if(!email) return;
    const statusEl=document.getElementById('lockStatus');
    statusEl.className='vm-row'; statusEl.textContent='جارِ الإرسال...';
    setLockLoading('lockSendBtn','lockSendText','lockSendSp',true);
    const { error } = await supaClient.auth.signInWithOtp({ email });
    setLockLoading('lockSendBtn','lockSendText','lockSendSp',false);
    if(error){ statusEl.className='vm-row err'; statusEl.textContent='تعذّر الإرسال: '+error.message; return; }
    pendingLockEmail=email;
    statusEl.className='vm-row ok'; statusEl.textContent='تم إرسال رمز مكوّن من 6 أرقام إلى بريدك.';
    document.getElementById('lockStep1').style.display='none';
    document.getElementById('lockStep2').style.display='block';
    setLockDots(2);
    setTimeout(()=>document.getElementById('lockCodeInput').focus(),50);
  };
}
const lockCodeInputEl=document.getElementById('lockCodeInput');
if(lockCodeInputEl){
  lockCodeInputEl.addEventListener('input', function(){
    this.value=this.value.replace(/\D/g,'').slice(0,8);
  });
  lockCodeInputEl.addEventListener('keydown', (e)=>{
    if(e.key==='Enter') document.getElementById('lockVerifyBtn').click();
  });
}
const lockEmailInputEl=document.getElementById('lockEmailInput');
if(lockEmailInputEl){
  lockEmailInputEl.addEventListener('keydown', (e)=>{
    if(e.key==='Enter') document.getElementById('lockSendBtn').click();
  });
}
const lockCodeBack=document.getElementById('lockCodeBack');
if(lockCodeBack){
  lockCodeBack.onclick=()=>{
    document.getElementById('lockStep1').style.display='block';
    document.getElementById('lockStep2').style.display='none';
    document.getElementById('lockStatus').className='vm-row';
    document.getElementById('lockStatus').textContent='';
    setLockDots(1);
  };
}
const lockVerifyBtn=document.getElementById('lockVerifyBtn');
if(lockVerifyBtn){
  lockVerifyBtn.onclick=async ()=>{
    const code=document.getElementById('lockCodeInput').value.trim();
    if(!code) return;
    const statusEl=document.getElementById('lockStatus');
    statusEl.className='vm-row'; statusEl.textContent='جارِ التحقق...';
    setLockLoading('lockVerifyBtn','lockVerifyText','lockVerifySp',true);
    const { error } = await supaClient.auth.verifyOtp({ email: pendingLockEmail, token: code, type:'email' });
    setLockLoading('lockVerifyBtn','lockVerifyText','lockVerifySp',false);
    if(error){ statusEl.className='vm-row err'; statusEl.textContent='رمز غير صحيح أو منتهي الصلاحية: '+error.message; return; }
    /* onAuthStateChange سيتكفّل تلقائيًا بفحص الصلاحية وتحديث الواجهة */
  };
}
const lockCancelBtn=document.getElementById('lockCancelBtn');
if(lockCancelBtn) lockCancelBtn.onclick=()=>{ lockScreenEl.style.display='none'; };
const lockDeniedClose=document.getElementById('lockDeniedClose');
if(lockDeniedClose) lockDeniedClose.onclick=()=>{ lockScreenEl.style.display='none'; };
const lockLogoutBtn=document.getElementById('lockLogoutBtn');
if(lockLogoutBtn){
  lockLogoutBtn.onclick=async ()=>{
    await supaClient.auth.signOut();
    /* onAuthStateChange سيعيد ضبط الحالة وإظهار نموذج الدخول من جديد */
  };
}

/* ---------------- صندوق الأسئلة الواردة (أسئلة الزوار بانتظار الرد) ---------------- */
async function openInbox(){
  closeSidebar();
  if(!supaEnabled || !isAdminAuthed) return;
  mainContent.innerHTML = '<h1 class="page-title">صندوق الأسئلة الواردة</h1><div class="empty-hint">جارِ التحميل...</div>';
  const { data:apiResult, error } = await callApi('getInboxQuestions', {});
  if(error){
    mainContent.innerHTML = '<h1 class="page-title">صندوق الأسئلة الواردة</h1><div class="empty-hint">تعذّر التحميل: '+escapeHtml(error.message)+'</div>';
    return;
  }
  renderInboxList((apiResult && apiResult.data) || []);
}

function renderInboxList(items){
  mainContent.innerHTML = '<h1 class="page-title">صندوق الأسئلة الواردة</h1>';
  if(!items.length){
    const empty=document.createElement('div');
    empty.className='empty-hint';
    empty.textContent='لا توجد أسئلة بانتظار الإجابة حاليًا.';
    mainContent.appendChild(empty);
    return;
  }

  const qaPages = allPagesFlat().filter(x=> (findPage(x.id)||{}).type==='qa');

  items.forEach(item=>{
    const box=document.createElement('div'); box.className='qa-item';

    const qRow=document.createElement('div'); qRow.className='qa-q'; qRow.style.cursor='default';
    const qText=document.createElement('span');
    qText.textContent = 'س/ '+item.question + (item.email? '  —  '+item.email : '');
    qRow.appendChild(qText);
    box.appendChild(qRow);

    const form=document.createElement('div'); form.className='qa-form';
    const pageSelect=document.createElement('select');
    if(!qaPages.length){
      const opt=document.createElement('option'); opt.value=''; opt.textContent='-- لا توجد صفحات أسئلة بعد --';
      pageSelect.appendChild(opt);
    }
    qaPages.forEach(qp=>{
      const opt=document.createElement('option'); opt.value=qp.id;
      opt.textContent='—'.repeat(qp.depth)+' '+qp.title;
      pageSelect.appendChild(opt);
    });
    form.appendChild(pageSelect);
    box.appendChild(form);

    const aBox=document.createElement('div');
    aBox.className='content-box'; aBox.contentEditable=true; aBox.style.minHeight='90px';
    attachEditable(aBox, ()=>{}, {media:false});
    box.appendChild(aBox);

    const actions=document.createElement('div'); actions.className='qa-edit-actions';

    const publishBtn=document.createElement('button'); publishBtn.className='text-btn primary'; publishBtn.textContent='نشر الإجابة';
    publishBtn.onclick=async ()=>{
      if(!aBox.textContent.trim() || !pageSelect.value) return;
      const targetPage=findPage(pageSelect.value);
      if(!targetPage) return;
      targetPage.qa = targetPage.qa||[];
      targetPage.qa.push({ id:uid(), q:item.question, a:cleanContentHtml(aBox) });
      save();
      const { error:updErr } = await callApi('resolveQuestion', {
        id: item.id, status:'answered', answer:cleanContentHtml(aBox)
      });
      if(updErr) console.error('inbox update error:', updErr.message);
      openInbox();
    };

    const skipBtn=document.createElement('button'); skipBtn.className='text-btn'; skipBtn.textContent='تجاهل السؤال';
    skipBtn.onclick=async ()=>{
      if(!confirm('تجاهل هذا السؤال؟ لن يظهر في القائمة مجددًا.')) return;
      const { error:updErr } = await callApi('resolveQuestion', { id: item.id, status:'dismissed' });
      if(updErr) console.error('inbox dismiss error:', updErr.message);
      openInbox();
    };

    actions.appendChild(publishBtn); actions.appendChild(skipBtn);
    box.appendChild(actions);

    mainContent.appendChild(box);
  });
}

const sidebar=document.getElementById('sidebar');
const overlay=document.getElementById('overlay');
const burger=document.getElementById('burger');
function openSidebar(){ sidebar.classList.add('open'); overlay.classList.add('show'); burger.classList.add('open'); }
function closeSidebar(){ sidebar.classList.remove('open'); overlay.classList.remove('show'); burger.classList.remove('open'); }
burger.onclick=()=> sidebar.classList.contains('open')? closeSidebar(): openSidebar();
overlay.onclick=closeSidebar;
/* القائمة أصبحت تظليلاً كاملاً للشاشة والأزرار بلا خلفية — أي نقرة داخل
   منطقة القائمة لا تقع على رابط أو زر فعلي تُغلق القائمة، تمامًا كالنقر
   على التظليل نفسه خارجها. */
sidebar.addEventListener('click', (e)=>{
  if(e.target.closest('a, button, .caret, .mini-btn')) return;
  closeSidebar();
});

const modalBg=document.getElementById('modalBg');
const modalInput=document.getElementById('modalInput');
const modalParent=document.getElementById('modalParent');
const typeContentBtn=document.getElementById('typeContentBtn');
const typeQaBtn=document.getElementById('typeQaBtn');
const typeCharsBtn=document.getElementById('typeCharsBtn');
const typeGameBtn=document.getElementById('typeGameBtn');
typeContentBtn.innerHTML = ICONS.doc + '<span>محتوى</span>';
typeQaBtn.innerHTML = ICONS.question + '<span>أسئلة</span>';
typeCharsBtn.innerHTML = ICONS.team + '<span>شخصيات</span>';
typeGameBtn.innerHTML = ICONS.gamepad + '<span>اللعبة</span>';
const ALL_TYPE_BTNS = [typeContentBtn, typeQaBtn, typeCharsBtn, typeGameBtn];

let pendingType='content';
ALL_TYPE_BTNS.forEach(btn=>{
  btn.onclick=()=>{
    pendingType=btn.dataset.type;
    ALL_TYPE_BTNS.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  };
});

function openPageModal(parentId){
  modalInput.value='';
  pendingType='content';
  ALL_TYPE_BTNS.forEach(b=>b.classList.remove('active'));
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
  let newPage;
  if(pendingType==='qa') newPage = {id:uid(), title, type:'qa', qa:[], children:[]};
  else if(pendingType==='chars') newPage = {id:uid(), title, type:'chars', characters:[], children:[]};
  else if(pendingType==='game') newPage = {id:uid(), title, type:'game', sections:[], children:[]};
  else newPage = {id:uid(), title, type:'content', content:'', children:[]};
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
