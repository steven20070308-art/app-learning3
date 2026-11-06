import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// 將 Firebase Console > Project settings > Your apps 的 Firebase Web App 設定填入此處。
const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  appId: 'YOUR_FIREBASE_APP_ID'
};
const configured = Object.values(firebaseConfig).every(value => value && !value.includes('YOUR_'));
const localStateKey = 'dayform-state';
function getSavedLocalState() { return localStorage.getItem(localStateKey); }
const button = document.querySelector('#authButton');
const app = configured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });
let stopSync = null, saveTimer = null, activeUid = null, stateListener = null;

function setSession(user) {
  window.dispatchEvent(new CustomEvent('dayform-auth-changed', { detail: { user } }));
  if (!button) return;
  button.textContent = user ? (user.displayName || user.email || '帳戶') : '使用 Google 登入';
  button.title = user ? `已登入 ${user.email || ''} · 點擊登出` : '使用 Google 帳號登入';
  button.classList.toggle('is-signed-in', Boolean(user));
}
function startSync(user) {
  if (stopSync) stopSync();
  stopSync = null; activeUid = user.uid;
  const ref = doc(db, 'users', user.uid, 'private', 'dayform');
  getDoc(ref).then(async snapshot => {
    if (activeUid !== user.uid) return;
    const local = getSavedLocalState();
    if (!snapshot.exists() && local) {
      const choice = confirm('這個帳號尚無雲端資料。要將本機現有的任務、行程與目標上傳到此 Google 帳號嗎？\n\n按「確定」上傳本機資料；按「取消」使用雲端空白資料。');
      if (choice) await setDoc(ref, { state: JSON.parse(local), updatedAt: serverTimestamp() });
      else await setDoc(ref, { state: { tasks: [], events: [], goals: [], customCategories: [], settings: { eventReminder: true, taskReminder: true, reminderMinutes: 10 } }, updatedAt: serverTimestamp() });
      window.__dayformCloudInitialized = true;
    } else if (!snapshot.exists()) {
      const state = { tasks: [], events: [], goals: [], customCategories: [], settings: { eventReminder: true, taskReminder: true, reminderMinutes: 10 } };
      await setDoc(ref, { state, updatedAt: serverTimestamp() });
      window.__dayformCloudInitialized = true;
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
            setDoc(ref, { state: JSON.parse(local), updatedAt: serverTimestamp() }).catch(error => alert(`雲端同步失敗：${error.message}`));
            return;
          }
        } else window.__dayformCloudInitialized = true;
        window.dispatchEvent(new CustomEvent('dayform-cloud-state', { detail: { state: cloudState } }));
      }
    }, error => { console.error('Firestore 同步失敗', error); alert(`雲端同步失敗：${error.message}`); });
    if (stateListener) window.removeEventListener('dayform-state-changed', stateListener);
    stateListener = event => {
      if (activeUid !== user.uid || !window.__dayformCloudInitialized) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => setDoc(ref, { state: event.detail.state, updatedAt: serverTimestamp() }).catch(error => { console.error('Firestore 儲存失敗', error); alert(`雲端儲存失敗：${error.message}`); }), 500);
    };
    window.addEventListener('dayform-state-changed', stateListener);
  }).catch(error => { console.error('讀取雲端資料失敗', error); alert(`無法讀取雲端資料：${error.message}`); });
}
if (button) button.addEventListener('click', async () => {
  if (!configured) {
    alert('尚未設定 Firebase。請先在 firebase-auth.js 填入 Firebase Web App 設定，並於 Firebase Console 啟用 Google 登入。');
    return;
  }
  try {
    if (auth.currentUser) {
      activeUid = null; if (stopSync) stopSync(); stopSync = null; if (stateListener) window.removeEventListener('dayform-state-changed', stateListener); stateListener = null;
      await signOut(auth);
      return;
    }
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) await signInWithRedirect(auth, provider);
    else await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Google 登入失敗', error);
    alert(`Google 登入失敗：${error.message || error.code}`);
  }
});
if (auth) {
  getRedirectResult(auth).catch(error => { console.error('Google 登入回傳處理失敗', error); alert(`Google 登入失敗：${error.message || error.code}`); });
  onAuthStateChanged(auth, user => {
    setSession(user);
    if (user) { window.__dayformCloudInitialized = false; startSync(user); }
    else { activeUid = null; if (stopSync) stopSync(); stopSync = null; if (stateListener) window.removeEventListener('dayform-state-changed', stateListener); stateListener = null; }
  });
} else setSession(null);
