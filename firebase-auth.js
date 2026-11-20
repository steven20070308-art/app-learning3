import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app-check.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut, browserLocalPersistence, indexedDBLocalPersistence, setPersistence } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-ai.js';

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
const plannerModel = ai ? getGenerativeModel(ai, {
  model: 'gemini-3.8-flash',
  generationConfig: {
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
  }
}) : null;
const provider = new GoogleAuthProvider();
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
  const dayEvents = (window.dayformState?.events || []).filter(e => (e.date || today) === date);
  const tasks = window.dayformState?.tasks || [];
  return { date, events: dayEvents.map(({title,time,end,place,category})=>({title,time,end,place,category})), tasks: tasks.filter(t=>!t.done).map(({title,due,category,priority})=>({title,due,category,priority})) };
}
function showPlannerError(message) { plannerResult.hidden=false; plannerResult.innerHTML=''; const box=document.createElement('div'); box.className='ai-error'; box.textContent=message; plannerResult.append(box); }
function formatTime(value){return /^([01]\d|2[0-3]):[0-5]\d$/.test(value||'')}
function renderProposals(data){
  plannerResult.innerHTML='';plannerResult.hidden=false;
  const heading=document.createElement('h3');heading.textContent='Gemini 行程草案';plannerResult.append(heading);
  const summary=document.createElement('p');summary.className='ai-result-intro';summary.textContent=data.summary||'以下是建議安排，請確認後再加入行程。';plannerResult.append(summary);
  const list=document.createElement('div');list.className='ai-proposal-list';
  (data.proposals||[]).slice(0,6).forEach((item,index)=>{
    if(!item||typeof item.title!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(item.date)||!formatTime(item.startTime)||!formatTime(item.endTime)||item.endTime<=item.startTime)return;
    const row=document.createElement('label');row.className='ai-proposal';
    const check=document.createElement('input');check.type='checkbox';check.checked=true;check.dataset.proposal=String(index);
    const copy=document.createElement('span');const title=document.createElement('span');title.className='ai-proposal-title';title.textContent=item.title;const detail=document.createElement('span');detail.className='ai-proposal-detail';detail.textContent=String(item.date)+' · '+item.startTime+'–'+item.endTime+' · '+(item.place||'');copy.append(title,detail);
    const category=document.createElement('span');category.className='task-category 學習';category.textContent=item.category||'學習';row.append(check,copy,category);list.append(row);
  });
  if(!list.children.length){showPlannerError('AI 回覆的行程格式不完整，請調整描述後再試。');return}
  plannerResult.append(list);
  const actions=document.createElement('div');actions.className='ai-proposal-actions';
  const dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent='取消';dismiss.onclick=()=>{plannerResult.hidden=true};
  const apply=document.createElement('button');apply.type='button';apply.className='apply-ai-proposal';apply.textContent='確認並加入行程';apply.onclick=()=>{
    const checks=[...list.querySelectorAll('input[type=checkbox]')];let added=0;
    checks.forEach((check,i)=>{if(!check.checked)return;const item=data.proposals[Number(check.dataset.proposal)];if(!item)return;const collision=(window.dayformState?.events||[]).some(e=>(e.date||window.dayformTodayISO?.())===item.date&&e.time<item.endTime&&e.end>item.startTime);if(collision)return;window.dispatchEvent(new CustomEvent('dayform-add-ai-event',{detail:{event:{id:crypto.randomUUID(),title:item.title,category:['工作','生活','學習'].includes(item.category)?item.category:'學習',date:item.date,time:item.startTime,end:item.endTime,place:item.place||'Gemini 建議',source:'gemini'}}}));added++});
    plannerResult.hidden=true;window.dispatchEvent(new CustomEvent('dayform-refresh'));if(added)alert('已加入 '+added+' 筆 AI 行程草案。');else alert('沒有加入行程：請勾選草案，並確認時間沒有與既有行程重疊。');
  };
  actions.append(dismiss,apply);plannerResult.append(actions);
}
if(plannerForm)plannerForm.addEventListener('submit',async event=>{
  event.preventDefault();const prompt=document.querySelector('#aiPlannerPrompt').value.trim();if(!prompt)return;
  const run=plannerForm.querySelector('button[type=submit]');run.disabled=true;run.textContent='Gemini 安排中…';plannerResult.hidden=false;plannerResult.innerHTML='<div class="ai-loading">正在參考你的待辦與當日行程產生建議…</div>';
  try{
    if(!plannerModel)throw new Error('Firebase AI Logic 尚未初始化。');
    const input={request:prompt,context:planningContext()};
    const systemPrompt='你是繁體中文個人行程規劃助理。根據使用者需求和提供的日期、行程、待辦資料，提出最多 4 個可執行的行程草案。禁止與既有行程重疊；不要假設行程已被寫入。所有日期用 YYYY-MM-DD，時間用 24 小時 HH:mm。每個草案需包含標題、日期、開始/結束時間、分類、地點（可空字串）與安排理由。若使用者沒說日期，採用所提供日期。只回傳符合 JSON schema 的資料。';
    const result=await plannerModel.generateContent(systemPrompt+'\n'+JSON.stringify(input));
    const text=result.response.text();renderProposals(JSON.parse(text));
  }catch(error){console.error('Gemini 行程規劃失敗',error);showPlannerError('無法產生建議：'+(error.message||error.code||'請稍後再試。請確認 Firebase AI Logic 已啟用。'));}
  finally{run.disabled=false;run.textContent='✦ 產生安排'}
});
window.addEventListener('dayform-state-changed',event=>{window.dayformState=event.detail?.state||window.dayformState});
window.addEventListener('dayform-cloud-state',event=>{window.dayformState=event.detail?.state||window.dayformState});
window.addEventListener('dayform-add-ai-event',event=>{const item=event.detail?.event;if(!item)return;window.dispatchEvent(new CustomEvent('dayform-state-changed',{detail:{state:{...(window.dayformState||{}),events:[...(window.dayformState?.events||[]),item]}}}))});

function setSession(user) {
  window.dispatchEvent(new CustomEvent('dayform-auth-changed', { detail: { user } }));
  document.documentElement.dataset.firebaseUser = user ? 'signed-in' : 'signed-out';
  if (!button) return;
  button.textContent = user ? (user.displayName || user.email || '帳戶') : '使用 Google 登入';
  button.title = user ? `已登入 ${user.email || ''} · 點擊登出` : '使用 Google 帳號登入';
  button.classList.toggle('is-signed-in', Boolean(user));
}
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
