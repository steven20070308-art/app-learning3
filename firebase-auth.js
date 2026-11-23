import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-app-check.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut, browserLocalPersistence, indexedDBLocalPersistence, setPersistence } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js';
import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-ai.js';

// 將 Firebase Console > Project settings > Your apps 的 Firebase Web App 設定填入此處。
const firebaseConfig = {
  apiKey: 'AIzaSyBx_a3TRxHFZ5XVP5taajMNd0lwq0mGkKU',
  authDomain: 'applearning-3162d.firebaseapp.com',
  projectId: 'applearning-3162d',
  appId: '1:228269124376:web:e86043e1e6ab7a09ed4c6d'

};
const appCheckSiteKey = '6Ld_AykuAAAAAC1bMhSgJF_mSqXhUjuvYkkFaigd';
const configured = Object.values(firebaseConfig).every(value => value && !value.includes('YOUR_'));
const localStateKey = 'dayform-state';
function getSavedLocalState() { return localStorage.getItem(localStateKey); }
const button = document.querySelector('#authButton');
const app = configured ? initializeApp(firebaseConfig) : null;
const appCheck = app ? initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
  isTokenAutoRefreshEnabled: true
}) : null;
const auth = app ? getAuth(app) : null;
if (auth) auth.useDeviceLanguage();
let signInInProgress = false;
const db = app ? getFirestore(app) : null;
const ai = appCheck ? getAI(app, { backend: new GoogleAIBackend(), useLimitedUseAppCheckTokens: true }) : null;
const plannerGenerationConfig = {
  responseMimeType: 'application/json', temperature: 0.3, maxOutputTokens: 1024,
  responseSchema: Schema.object({
    properties: {
      summary: Schema.string(),
      proposals: Schema.array({ items: Schema.object({
        properties: { title: Schema.string(), date: Schema.string(), startTime: Schema.string(), endTime: Schema.string(), category: Schema.string(), place: Schema.string(), reason: Schema.string() },
        required: ['title','date','startTime','endTime','category','reason']
      }) })
    },
    required: ['summary','proposals']
  })
};
const plannerModel = ai ? getGenerativeModel(ai, { model: 'gemini-3.8-flash', generationConfig: plannerGenerationConfig }) : null;
const fallbackPlannerModel = ai ? getGenerativeModel(ai, { model: 'gemini-3.5-flash', generationConfig: plannerGenerationConfig }) : null;const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });
let stopSync = null, saveTimer = null, activeUid = null, stateListener = null, persistenceReady = Promise.resolve(), syncReady = false;
if (auth) persistenceReady = setPersistence(auth, indexedDBLocalPersistence).catch(error => {
  console.warn('IndexedDB persistence unavailable; falling back to browser local persistence.', error);
  return setPersistence(auth, browserLocalPersistence);
});

const plannerForm = document.querySelector('#aiPlannerForm');
const plannerResult = document.querySelector('#aiPlannerResult');
function planningContext() {
  const now = new Date();
  const today = window.dayformTodayISO?.() || [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const date = window.dayformSelectedDateISO?.() || today;
  const dayEvents = (window.dayformState?.events || []).filter(e => !e.cancelled && (e.date || today) === date);
  const tasks = window.dayformState?.tasks || [];
  const deadlines = (window.dayformState?.deadlines || []).filter(item => !item.done && item.date >= today).sort((a,b)=>a.date.localeCompare(b.date)).map(item=>({title:item.title,type:item.type,date:item.date,daysRemaining:Math.round((new Date(item.date+'T12:00:00')-new Date(today+'T12:00:00'))/86400000),description:item.description||''}));
  return { today, date, events: dayEvents.map(({title,time,end,place,category})=>({title,time,end,place,category})), tasks: tasks.filter(t=>!t.done).map(({title,due,category,priority})=>({title,due,category,priority})), deadlines };
}
function showPlannerError(message) { plannerResult.hidden=false; plannerResult.innerHTML=''; const box=document.createElement('div'); box.className='ai-error'; box.textContent=message; plannerResult.append(box); }
function formatTime(value){return /^([01]\d|2[0-3]):[0-5]\d$/.test(value||'')}
function timeToMinutes(value) {
  if (!formatTime(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}
function isTransientAiError(error) {
  const details = String(error?.code || '') + ' ' + String(error?.message || '');
  return /(?:\b503\b|\b504\b|deadline expired|temporarily unavailable|fetch-error|failed to fetch|error fetching|networkerror|network error|load failed|err_connection|err_name_not_resolved)/i.test(details);
}
function withTimeout(promise,milliseconds){
  let timer;
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(new Error("AI request timed out."),{code:"ai/timeout"})),milliseconds)});
  return Promise.race([promise,timeout]).finally(()=>clearTimeout(timer));
}
async function generateWithRetry(model, request, modelName) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await model.generateContent(request);
    } catch (error) {
      if (!isTransientAiError(error) || attempt === 1) throw error;
      const loading = plannerResult.querySelector('.ai-loading');
      if (loading) loading.textContent = modelName + ' 回應較慢，正在重試…';
      await new Promise(resolve => setTimeout(resolve, 700));
    }
  }
}
function renderProposals(data,preserveSelection=false){
  const previousSelection=preserveSelection?new Set([...plannerResult.querySelectorAll('.ai-proposal input:checked')].map(check=>check.dataset.proposalKey)):null;
  const addedKeys=plannerResult.__addedProposalKeys||(plannerResult.__addedProposalKeys=new Set());
  plannerResult.__proposalData=data;
  plannerResult.innerHTML='';plannerResult.hidden=false;
  const t=value=>window.dayformTranslate?.(value)||value;
  const locale=window.dayformIntlLocale?.()||'zh-TW';
  const language=window.dayformLocale?.()||'zh-Hant';
  const addLabels={
    'zh-Hant':['✓ 加入','✓ 已加入'],en:['✓ Add','✓ Added'],ja:['✓ 追加','✓ 追加済み'],
    ko:['✓ 추가','✓ 추가됨'],ru:['✓ Добавить','✓ Добавлено'],fr:['✓ Ajouter','✓ Ajouté'],
    ar:['✓ أضف','✓ تمت الإضافة'],th:['✓ เพิ่ม','✓ เพิ่มแล้ว'],de:['✓ Hinzufügen','✓ Hinzugefügt']
  }[language]||['✓ Add','✓ Added'];
  const heading=document.createElement('h3');heading.textContent=t('Gemini 行程草案');plannerResult.append(heading);
  const summary=document.createElement('p');summary.className='ai-result-intro';summary.textContent=data.summary||t('以下是建議安排，請確認後再加入行程。');plannerResult.append(summary);
  const note=document.createElement('p');note.className='ai-preview-note';note.textContent=t('預覽：核對日期、起訖時間、時長與衝突後再加入。');plannerResult.append(note);
  const list=document.createElement('div');list.className='ai-proposal-list';
  (data.proposals||[]).slice(0,6).forEach(item=>{
    if(!item||typeof item.title!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(item.date)||!formatTime(item.startTime)||!formatTime(item.endTime)||timeToMinutes(item.endTime)<=timeToMinutes(item.startTime))return;
    const row=document.createElement('div');row.className='ai-proposal';
    const key=[item.date,item.startTime,item.endTime,item.title].join('|');
    const normalizedCategory=({Work:'工作',Life:'生活',Study:'學習'}[item.category])||item.category;
    const proposalItem={...item,category:normalizedCategory};
    const check=document.createElement('input');check.type='checkbox';check.checked=previousSelection?previousSelection.has(key):true;check.proposal=proposalItem;check.dataset.proposalKey=key;
    const copy=document.createElement('span');copy.className='ai-proposal-copy';
    const title=document.createElement('span');title.className='ai-proposal-title';title.textContent=item.title;
    const start=timeToMinutes(item.startTime),end=timeToMinutes(item.endTime),duration=end-start;
    const dateLabel=new Intl.DateTimeFormat(locale,{weekday:'short',month:'short',day:'numeric',year:'numeric'}).format(new Date(item.date+'T12:00:00'));
    const durationLabel=window.dayformFormatDuration?.(duration)||duration+' min';
    const detail=document.createElement('span');detail.className='ai-proposal-detail';detail.textContent=dateLabel+' · '+item.startTime+'–'+item.endTime+' · '+t('時長')+' '+durationLabel;
    copy.append(title,detail);
    if(item.reason){const reason=document.createElement('span');reason.className='ai-proposal-reason';reason.textContent=t('安排理由')+'：'+item.reason;copy.append(reason)}
    const status=document.createElement('span');status.className='ai-proposal-status';status.textContent=t('未選取');copy.append(status);
    const category=document.createElement('span');category.className='task-category '+(['工作','生活','學習'].includes(normalizedCategory)?normalizedCategory:'學習');category.textContent=t(normalizedCategory||'學習');
    const quickAdd=document.createElement('button');quickAdd.type='button';quickAdd.className='ai-proposal-add';
    const alreadyAdded=addedKeys.has(key);quickAdd.textContent=alreadyAdded?addLabels[1]:addLabels[0];quickAdd.disabled=alreadyAdded;
    if(alreadyAdded)check.disabled=true;
    row.append(check,copy,category,quickAdd);list.append(row);
    quickAdd.addEventListener('click',()=>{
      if(addedKeys.has(key))return;
      const conflict=(window.dayformState?.events||[]).find(event=>!event.cancelled&&(event.date||window.dayformTodayISO?.())===item.date&&overlaps(item,event));
      if(conflict){
        status.textContent=t('時間衝突')+'：'+t('現有行程')+'「'+conflict.title+'」'+conflict.time+'–'+conflict.end;
        row.classList.add('has-conflict');status.classList.add('conflict');
        return;
      }
      window.dispatchEvent(new CustomEvent('dayform-add-ai-event',{detail:{event:{id:crypto.randomUUID(),title:item.title,category:['工作','生活','學習'].includes(normalizedCategory)?normalizedCategory:'學習',date:item.date,time:item.startTime,end:item.endTime,place:item.place||'Gemini 建議',source:'gemini'}}}));
      addedKeys.add(key);quickAdd.textContent=addLabels[1];quickAdd.disabled=true;check.checked=false;check.disabled=true;updatePreview();
    });
  });
  if(!list.children.length){showPlannerError(t('AI 回覆的行程格式不完整，請調整描述後再試。'));return}
  plannerResult.append(list);
  function overlaps(a,b){
    if(a.date!==(b.date||a.date))return false;
    const aStart=timeToMinutes(a.startTime||a.time),aEnd=timeToMinutes(a.endTime||a.end),bStart=timeToMinutes(b.startTime||b.time),bEnd=timeToMinutes(b.endTime||b.end);
    return aStart!==null&&aEnd!==null&&bStart!==null&&bEnd!==null&&aStart<bEnd&&aEnd>bStart;
  }
  function updatePreview(){
    const selected=[...list.querySelectorAll('input[type=checkbox]:checked')];
    const accepted=[],problems=[];
    selected.forEach(check=>{
      const item=check.proposal,row=check.closest('.ai-proposal'),status=row.querySelector('.ai-proposal-status'),messages=[];
      (window.dayformState?.events||[]).filter(event=>!event.cancelled&&(event.date||window.dayformTodayISO?.())===item.date&&overlaps(item,event)).forEach(event=>messages.push(t('現有行程')+'「'+event.title+'」'+event.time+'–'+event.end));
      accepted.forEach(previous=>{if(overlaps(item,previous))messages.push(t('另一個已選草案')+'「'+previous.title+'」'+previous.startTime+'–'+previous.endTime)});
      row.classList.toggle('has-conflict',messages.length>0);
      status.classList.toggle('conflict',messages.length>0);
      status.classList.toggle('clear',messages.length===0);
      status.textContent=messages.length?t('時間衝突')+'：'+messages.join('；'):t('沒有時間衝突');
      if(messages.length)problems.push(item.title+' ('+item.startTime+'–'+item.endTime+'): '+messages.join('；'));
      else accepted.push(item);
    });
    list.querySelectorAll('input[type=checkbox]:not(:checked)').forEach(check=>{
      const status=check.closest('.ai-proposal')?.querySelector('.ai-proposal-status');
      if(status){status.classList.remove('conflict','clear');status.textContent=t('未選取')}
    });
    return {selected,accepted,problems};
  }
  list.addEventListener('change',updatePreview);
  updatePreview();
  const actions=document.createElement('div');actions.className='ai-proposal-actions';
  const dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent=t('取消');dismiss.onclick=()=>{plannerResult.hidden=true};
  const apply=document.createElement('button');apply.type='button';apply.className='apply-ai-proposal';apply.textContent=t('確認並加入行程');
  apply.onclick=()=>{
    const result=updatePreview();
    if(!result.selected.length){alert(t('請先勾選要加入的行程草案。'));return}
    if(!result.accepted.length){alert(t('這些草案都有時間衝突，尚未加入。')+'\n'+result.problems.join('\n'));return}
    result.accepted.forEach(item=>window.dispatchEvent(new CustomEvent('dayform-add-ai-event',{detail:{event:{id:crypto.randomUUID(),title:item.title,category:['工作','生活','學習'].includes(item.category)?item.category:'學習',date:item.date,time:item.startTime,end:item.endTime,place:item.place||'Gemini 建議',source:'gemini'}}})));
    plannerResult.hidden=true;window.dispatchEvent(new CustomEvent('dayform-refresh'));
    const added={
      'zh-Hant':n=>'已加入 '+n+' 筆 AI 行程草案。',en:n=>'Added '+n+' AI proposal(s).',ja:n=>'AIの予定を'+n+'件追加しました。',
      ko:n=>'AI 일정 '+n+'개를 추가했습니다.',ru:n=>'Добавлено предложений: '+n+'.',fr:n=>n+' proposition(s) IA ajoutée(s).',
      ar:n=>'تمت إضافة '+n+' اقتراحات من الذكاء الاصطناعي.',th:n=>'เพิ่มรายการจาก AI '+n+' รายการแล้ว',de:n=>n+' KI-Vorschläge hinzugefügt.'
    };
    const skipped={'zh-Hant':' 略過衝突：',en:' Skipped due to conflicts: ',ja:' 時間が重複したためスキップ：',ko:' 시간 충돌로 건너뜀: ',ru:' Пропущено из-за конфликтов: ',fr:' Ignoré en raison de conflits : ',ar:' تم التخطي بسبب تعارض الأوقات: ',th:' ข้ามเนื่องจากเวลาซ้ำ: ',de:' Wegen Zeitkonflikten übersprungen: '};
    let message=(added[language]||added.en)(result.accepted.length);
    if(result.problems.length)message+=(skipped[language]||skipped.en)+result.problems.join(language==='zh-Hant'?'；':'; ');
    alert(message);
  };
  actions.append(dismiss,apply);plannerResult.append(actions);
}
window.addEventListener('dayform-language-changed',()=>{if(plannerResult.__proposalData&&!plannerResult.hidden)renderProposals(plannerResult.__proposalData,true)});
if(plannerForm)plannerForm.addEventListener('submit',async event=>{
  event.preventDefault();const prompt=document.querySelector('#aiPlannerPrompt').value.trim();if(!prompt)return;plannerResult.__addedProposalKeys=new Set();
  const run=plannerForm.querySelector('button[type=submit]');run.disabled=true;run.textContent='Gemini 安排中…';plannerResult.hidden=false;plannerResult.innerHTML='<div class="ai-loading">正在參考你的待辦與當日行程產生建議…</div>';
  try{
    if(!plannerModel)throw new Error('Firebase AI Logic 尚未初始化。');
    const input={request:prompt,context:planningContext()};
    const responseLanguage=window.dayformAiLanguage?.()||'Traditional Chinese';
    const systemPrompt='你是個人行程規劃助理。根據使用者需求和提供的日期、行程、待辦資料，提出最多 4 個可執行的行程草案。嚴格遵守使用者指定的時段與長度：例如「下午」只能排在 12:00–18:00；「2 小時」的開始與結束時間必須相差恰好 120 分鐘。避開既有行程，並優先安排現在之後最早的連續空檔。若找不到合適空檔，請在 summary 說明且不要提出不符合條件的時間。不要假設行程已被寫入。所有日期用 YYYY-MM-DD，時間用 24 小時 HH:mm。也要考量提供的考試與作業截止日；若期限在未來 14 天內且空檔允許，請在截止日前分散安排準備或複習時段，不要安排到截止日之後。每個草案需包含標題、日期、開始/結束時間、分類、地點（可空字串）與安排理由。summary、title、place、reason 欄位請使用 '+responseLanguage+'。category 欄位必須使用「工作」「生活」「學習」其中之一。若使用者沒說日期，採用所提供日期。只回傳符合 JSON schema 的資料。';
    const request=systemPrompt+'\n'+JSON.stringify(input);
    const generation=(async()=>{
      try {
        return await generateWithRetry(plannerModel,request,'Gemini 3.8 Flash');
      } catch(error) {
        if(!isTransientAiError(error)||!fallbackPlannerModel) throw error;
        const loading=plannerResult.querySelector('.ai-loading');
        if(loading) loading.textContent='Gemini 3.8 Flash 忙碌，改用 Gemini 3.5 Flash…';
        return await generateWithRetry(fallbackPlannerModel,request,'Gemini 3.5 Flash');
      }
    })();
    const result=await withTimeout(generation,30000);
    const text=result.response.text();renderProposals(JSON.parse(text));
  }catch(error){
    console.error('Gemini 行程規劃失敗',error);
    const needsSetup=/app.?check|recaptcha/i.test(String(error?.message||''));
    const message=error?.code==='ai/timeout'||needsSetup
      ? 'AI 暫時無法使用，請稍後再試。'
      : isTransientAiError(error)
        ? 'AI 服務連線失敗，已重試主要及備援模型。請確認網路可連線至 firebasevertexai.googleapis.com 後再試。'
        : '無法產生建議：'+(error.message||error.code||'請稍後再試。請確認 Firebase AI Logic 已啟用。');
    showPlannerError(message);
  }  finally{run.disabled=false;run.textContent='✦ 產生安排'}
});
window.addEventListener('dayform-state-changed',event=>{window.dayformState=event.detail?.state||window.dayformState});
window.addEventListener('dayform-cloud-state',event=>{window.dayformState=event.detail?.state||window.dayformState});

function setSession(user) {
  window.dispatchEvent(new CustomEvent('dayform-auth-changed', { detail: { user } }));
  document.documentElement.dataset.firebaseUser = user ? 'signed-in' : 'signed-out';
  if (!button) return;
  button.textContent = user ? (user.displayName || user.email || '帳戶') : '使用 Google 登入';
  button.title = user ? ('已登入 '+(user.email || '')+' · 點擊登出') : (window.dayformTranslate?.('使用 Google 帳號登入') || '使用 Google 帳號登入');
  button.classList.toggle('is-signed-in', Boolean(user));
}
window.addEventListener('dayform-language-changed',()=>{if(button&&!window.dayformUser)button.title=window.dayformTranslate?.('使用 Google 帳號登入')||'使用 Google 帳號登入'});
function startSync(user) {
  if (stopSync) stopSync();
  stopSync = null; activeUid = user.uid; syncReady = false;
  const ref = doc(db, 'users', user.uid, 'private', 'dayform');
  getDoc(ref).then(async snapshot => {
    if (activeUid !== user.uid) return;
    const local = getSavedLocalState();
    if (!snapshot.exists() && local) {
      const choice = confirm('這個帳號尚無雲端資料。要將本機現有的任務、行程與目標上傳到此 Google 帳號嗎？\n\n按「確定」上傳本機資料；按「取消」使用雲端空白資料。');
      if (choice) await setDoc(ref, { state: JSON.parse(local), updatedAt: serverTimestamp() });
      else await setDoc(ref, { state: { tasks: [], events: [], goals: [], customCategories: [], settings: { eventReminder: true, taskReminder: true, reminderMinutes: 10 } }, updatedAt: serverTimestamp() });
      window.__dayformCloudInitialized = true;
      syncReady = true;
      if (choice) window.dispatchEvent(new CustomEvent('dayform-cloud-state', { detail: { state: JSON.parse(local) } }));
      else window.dispatchEvent(new CustomEvent('dayform-cloud-state', { detail: { state: { tasks: [], events: [], goals: [], customCategories: [], settings: { eventReminder: true, taskReminder: true, reminderMinutes: 10 } } } }));
    } else if (!snapshot.exists()) {
      const state = { tasks: [], events: [], goals: [], customCategories: [], settings: { eventReminder: true, taskReminder: true, reminderMinutes: 10 } };
      await setDoc(ref, { state, updatedAt: serverTimestamp() });
      window.__dayformCloudInitialized = true;
      syncReady = true;
      window.dispatchEvent(new CustomEvent('dayform-cloud-state', { detail: { state } }));
    }
    stopSync = onSnapshot(ref, snap => {
      if (activeUid !== user.uid || !snap.exists()) return;
      const cloudState = snap.data().state;
      if (cloudState && typeof cloudState === 'object') {
        const local = getSavedLocalState();
        if (local && !window.__dayformCloudInitialized) {
          window.__dayformCloudInitialized = true;
          const useCloud = confirm('已找到此 Google 帳號的雲端資料。要使用雲端資料取代本機目前資料嗎？按「確定」使用雲端資料；按「取消」保留本機資料並上傳到雲端。');
          window.__dayformCloudInitialized = true;
          if (!useCloud) {
            setDoc(ref, { state: JSON.parse(local), updatedAt: serverTimestamp() }).then(() => { syncReady = true; document.documentElement.dataset.firebaseSync = 'connected'; }).catch(error => { syncReady = false; alert(`雲端同步失敗：${error.code || error.message}`); });
            return;
          }
        } else window.__dayformCloudInitialized = true;
        window.dispatchEvent(new CustomEvent('dayform-cloud-state', { detail: { state: cloudState } }));
        syncReady = true;
        window.__dayformCloudInitialized = true;
        document.documentElement.dataset.firebaseSync = 'connected';
      }
    }, error => { console.error('Firestore 同步失敗', error); document.documentElement.dataset.firebaseSync = 'error'; alert(`雲端同步失敗：${error.code || error.message}`); });
    if (stateListener) window.removeEventListener('dayform-state-changed', stateListener);
    stateListener = event => {
      if (activeUid !== user.uid || !syncReady || !window.__dayformCloudInitialized) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => setDoc(ref, { state: event.detail.state, updatedAt: serverTimestamp() }).then(() => { document.documentElement.dataset.firebaseSync = 'connected'; }).catch(error => { console.error('Firestore 儲存失敗', error); document.documentElement.dataset.firebaseSync = 'error'; alert(`雲端儲存失敗：${error.code || error.message}`); }), 500);
    };
    window.addEventListener('dayform-state-changed', stateListener);
  }).catch(error => { console.error('讀取雲端資料失敗', error); syncReady = false; document.documentElement.dataset.firebaseSync = 'error'; alert(`無法讀取雲端資料：${error.code || error.message}`); });
}
if (button) button.addEventListener('click', async () => {
  if (!configured) {
    alert('尚未設定 Firebase。請先在 firebase-auth.js 填入 Firebase Web App 設定，並於 Firebase Console 啟用 Google 登入。');
    return;
  }
  try {
    if (signInInProgress) return;
    if (auth.currentUser) {
      activeUid = null; if (stopSync) stopSync(); stopSync = null; if (stateListener) window.removeEventListener('dayform-state-changed', stateListener); stateListener = null;
      await signOut(auth);
      return;
    }
    await persistenceReady;
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      signInInProgress = true;
      await signInWithRedirect(auth, provider);
      return;
    }
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Google 登入失敗', error);
    signInInProgress = false;
    alert(error.code === 'auth/missing-initial-state' ? '登入狀態無法在此瀏覽器保存（常見於 App 內建瀏覽器或隱私模式）。請點瀏覽器選單，以 Safari／Chrome 外部瀏覽器重新開啟此網站後登入。' : `Google 登入失敗：${error.code || error.message || error}`);
  }
});
if (auth) {
  persistenceReady.then(() => getRedirectResult(auth)).then(result => { signInInProgress = false; if (result?.user) setSession(result.user); }).catch(error => { console.error('Google 登入回傳處理失敗', error); signInInProgress = false; alert(error.code === 'auth/missing-initial-state' ? '登入狀態無法在此瀏覽器保存（常見於 App 內建瀏覽器或隱私模式）。請點瀏覽器選單，以 Safari／Chrome 外部瀏覽器重新開啟此網站後登入。' : `Google 登入失敗：${error.code || error.message || error}`); });
  onAuthStateChanged(auth, user => {
    setSession(user);
    if (user) { window.__dayformCloudInitialized = false; document.documentElement.dataset.firebaseSync = 'syncing'; startSync(user); }
    else { activeUid = null; syncReady = false; document.documentElement.dataset.firebaseSync = 'offline'; if (stopSync) stopSync(); stopSync = null; if (stateListener) window.removeEventListener('dayform-state-changed', stateListener); stateListener = null; }
  });
} else setSession(null);
