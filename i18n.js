(() => {
  const zhToEn = {
    "日序首頁":"DAYFORM home","工作空間":"Workspace","主要導覽":"Main navigation","今日總覽":"Today's overview","年度目標":"Annual goals","所有任務":"All tasks","分類":"Categories","新增分類":"Add category","全部項目":"All items","生活":"Life","工作":"Work","學習":"Study","本週專注":"Weekly focus","小時":"hours","本週目標 18 小時":"Weekly goal: 18 hours","訪客":"Guest","個人工作區":"Personal workspace","通知設定":"Notification settings","使用 Google 登入":"Sign in with Google","個人帳戶":"Account","選擇語言":"Choose language",
    "美好的一天":"A good day ahead","早安，今天":"Good morning","把重要的事，安排進值得期待的一天。":"Make room for what matters today.","AI 行程小幫手":"AI Schedule Assistant","告訴我你想完成什麼，我會參考當日行程與待辦安排時間，先提供草案給你確認。":"Tell me what you want to do. I’ll use your schedule and tasks to suggest a draft for you to review.","描述你想安排的事情":"Describe what you want to schedule","例如：今天找 90 分鐘準備統計考試，避開會議和課程":"Example: Find 90 minutes to study today, avoiding meetings and classes","AI 只會提供建議，不會自行修改行程":"AI suggests a plan; it won’t change your calendar without approval","產生安排":"Generate plan","今日摘要":"Today's summary","今日完成進度":"Today's progress","項任務":"tasks","進度穩定":"Steady progress","保持節奏":"Keep a steady pace","太棒了，繼續保持":"Great work—keep it up","一步一步來":"One step at a time","接下來的行程":"Up next","即將開始":"Starting soon","下一個行程":"Next event","年度目標進度":"Annual goal progress","平均完成度":"Average completion","2026 年度目標":"2026 goals","查看全部 →":"View all →",
    "今日行程":"Today's schedule","今天":"Today","前一天":"Previous day","後一天":"Next day","匯入課表":"Import timetable","新增行程":"Add event","現在時間":"Current time","今天還有":"Remaining today:","等待完成":"to go","查看週行事曆":"Weekly review","今日待辦":"Today's tasks","新增任務":"Add task","即將到期":"Due soon","已完成":"Completed","完成的任務會出現在這裡":"Completed tasks will appear here","目前沒有任務，享受一點留白吧。":"No tasks right now. Enjoy a little breathing room.","新增任務":"Add task","每完成一小步，都在靠近更大的目標。":"Every small step brings you closer to a bigger goal.","高優先級":"High priority","一般優先級":"Normal priority","逾期 ·":"Overdue ·",
    "我的年度目標":"My annual goals","新增目標":"Add goal","目標不必一步到位，只要每天前進一點點。":"Goals take time. Keep moving forward each day.","查看目標計畫":"View goal plan","MAKE IT HAPPEN":"MAKE IT HAPPEN","新增年度目標":"New annual goal","編輯年度目標":"Edit annual goal","編輯任務":"Edit task","編輯行程":"Edit event","任務":"Task","行程":"Event","年度目標":"Annual goals","編輯":"Edit","新增":"New","儲存":"Save","取消":"Cancel","刪除":"Delete","關閉":"Close","任務名稱":"Task name","行程名稱":"Event name","到期時間":"Due time","優先級":"Priority","連結年度目標":"Link annual goal","不連結":"None","一般":"Normal","重要":"High","開始時間":"Start time","結束時間":"End time","地點／備註":"Location / notes","目標名稱":"Goal name","目標期限":"Deadline","手動完成度（可留空）":"Manual progress (optional)","目標說明":"Goal description","說說這個目標對你的意義":"What makes this goal meaningful to you?","里程碑（每行一個，前面加 ✓ 表示已完成）":"Milestones (one per line; prefix ✓ for completed)","✓ 完成初步研究\n完成第一版草稿\n提交最終成果":"✓ Finish initial research\nComplete first draft\nSubmit final work","例如：準備週會簡報":"e.g. Prepare the weekly meeting deck","例如：專案討論會":"e.g. Project discussion","例如：完成個人作品集":"e.g. Finish my portfolio",
    "RECURRING SCHEDULE":"RECURRING SCHEDULE","匯入每週課表":"Import weekly timetable","已讀取 CSV 課表。設定學期日期與台灣國定假日，檢查課程後再建立行程。":"CSV timetable loaded. Set the term dates and holiday option, review the courses, then create events.","學期開始日期":"Term start date","學期結束日期":"Term end date","排除國定假日":"Skip national holidays","台灣國定假日不上課":"No classes on Taiwan national holidays","課程預覽":"Course preview","每週重複 · 依學期日期產生":"Repeats weekly · Generated within the term dates","匯入課程行程":"Import course events",
    "PREFERENCES":"PREFERENCES","通知與提醒":"Notifications & reminders","瀏覽器通知":"Browser notifications","開啟提醒，別錯過重要行程。":"Turn on reminders so you don’t miss an event.","啟用通知權限":"Enable notifications","行程開始前提醒":"Event reminders","在行程開始前收到通知":"Get notified before an event starts","提前提醒":"Remind me","分鐘":"min","任務到期提醒":"Task due reminders","在到期時間通知我":"Notify me when a task is due","提醒會在此頁面開啟時運作；關閉頁面後，瀏覽器不會在背景持續排程通知。":"Reminders work while this page is open. The browser won’t schedule them in the background after you close it.","通知已啟用":"Notifications enabled","此瀏覽器不支援通知":"Notifications aren’t supported by this browser","通知權限已封鎖，請至瀏覽器設定中允許。":"Notifications are blocked. Allow them in your browser settings.","通知已啟用，可以收到頁面開啟時的提醒。":"Notifications are enabled while this page is open.","尚未允許通知":"Notifications haven’t been allowed","無法取得通知權限":"Could not get notification permission",
    "任務完成！":"Task complete!","任務已完成，做得好！":"Task completed—nice work!","已將任務移回待辦":"Task moved back to your to-do list","已更新":"Updated","已新增":"Added","項目已刪除":"Item deleted","這個分類已存在":"This category already exists","輸入新分類名稱：":"Enter a category name:","已顯示全部分類":"Showing all categories","已篩選工作任務":"Filtered to work tasks","已新增分類":"Category added","已匯入":"Imported","課表讀取失敗，請檢查 CSV 格式":"Could not read timetable. Check the CSV format.","無法讀取選取的檔案":"Could not read the selected file","學期結束日期需晚於開始日期":"The term end date must be after its start date","Gemini 行程草案":"Gemini schedule proposals","以下是建議安排，請確認後再加入行程。":"Review these suggestions before adding them to your schedule.","預覽：核對日期、起訖時間、時長與衝突後再加入。":"Review dates, start/end times, durations, and conflicts before adding.","時長":"Duration","安排理由":"Why this time","未選取":"Not selected","沒有時間衝突":"No time conflicts","時間衝突":"Conflict","現有行程":"Existing event","另一個已選草案":"Another selected proposal","請先勾選要加入的行程草案。":"Select at least one proposal to add.","這些草案都有時間衝突，尚未加入。":"Every selected proposal conflicts with an existing event; nothing was added.","確認並加入行程":"Confirm and add","本週回顧":"Weekly review","本週已安排":"Scheduled this week","最忙的一天":"Busiest day","安排偏滿的日子":"Overloaded days","一小時以上空檔":"Open slots (1+ hour)","行程類型":"Time by category","可用空檔（至少 1 小時）":"Open slots (at least 1 hour)","本週沒有行程":"No events this week","尚無排程":"No scheduled events","安排偏滿":"Heavy schedule","還有餘裕":"Room to breathe","這週沒有尚未安排的一小時以上空檔。":"No open blocks of an hour or more this week.","查看週回顧":"View weekly review","正在規劃中":"Coming soon",
    "Gemini 安排中…":"Planning with Gemini…","正在參考你的待辦與當日行程產生建議…":"Reviewing your tasks and schedule…",
    "Gemini 3.8 Flash 忙碌，改用 Gemini 3.5 Flash…":"Gemini 3.8 Flash is busy; switching to Gemini 3.5 Flash…",
    "Gemini 3.8 Flash 回應較慢，正在重試…":"Gemini 3.8 Flash is taking longer; retrying…",
    "Gemini 3.5 Flash 回應較慢，正在重試…":"Gemini 3.5 Flash is taking longer; retrying…",
    "AI 暫時無法使用，請稍後再試。":"AI is temporarily unavailable. Please try again.",
    "考試／作業倒數":"Exam & assignment countdown","新增截止日":"Add deadline","項目名稱":"Item name","截止日期":"Deadline date","類型":"Type","考試":"Exam","作業":"Assignment","備註（選填）":"Notes (optional)","例如：統計期中考":"e.g. Statistics midterm","尚未新增截止日。":"No deadlines yet.","刪除截止日":"Delete deadline","截止日已新增":"Deadline added","本次停課":"Cancel this class","恢復本堂":"Restore this class","已標記本堂停課":"Class marked canceled","已恢復本堂課程":"Class restored","課程已停課":"Class canceled","切換淺色模式":"Switch to light mode","切換深色模式":"Switch to dark mode","主題依時間自動切換":"Theme follows time automatically",
  };
  Object.assign(zhToEn,{
    "日期":"Date","選擇主題":"Appearance","依時間自動":"Automatic","深色":"Dark","淺色":"Light",
    "標記完成":"Mark complete","取消完成":"Undo completion","請輸入項目名稱":"Please enter an item name.",
    "請輸入截止項目名稱":"Please enter a deadline name.","請輸入日期與完整時間":"Please enter a date and both times.",
    "結束時間必須晚於開始時間":"End time must be after start time.","該時段與既有行程重疊":"This time overlaps an existing event."
  });
  Object.assign(zhToEn,{
    "現在":"Now","讓每一天，都朝著想去的方向。":"Let each day move you toward what matters.",
    "使用 Google 帳號登入":"Sign in to your Google account","下載範本 CSV":"Download CSV template",
    "必要欄位：星期、時間、課程名稱。星期接受「週一」「星期一」「一」「Mon」或「1」等寫法。":"Required columns: Day, Time, and Course name. Weekdays accept Monday, Mon, 1, or 星期一.",
    "匯入時段有衝突":"Schedule conflicts found","其餘衝突也會一併匯入":"More conflicts will also be imported.",
    "確認仍要匯入":"Import anyway","復原":"Undo","分類名稱":"Category name","例如：閱讀":"e.g. Reading",
    "請輸入分類名稱":"Enter a category name.","已復原":"Restored","這個分類已存在。":"This category already exists.","已新增分類":"Category added"
  });
  Object.assign(zhToEn,{
    "搜尋":"Search","搜尋任務、行程、截止日、目標或習慣":"Search tasks, events, deadlines, goals, or habits","找不到符合的項目":"No matching items found","截止項目":"Deadline",
    "習慣打卡":"Habit tracker","新增習慣":"Add habit","編輯習慣":"Edit habit","習慣名稱":"Habit name","例如：每天背單字":"e.g. Memorize vocabulary daily","頻率":"Frequency","每天":"Daily","每週":"Weekly","每週目標次數":"Weekly target",
    "累積打卡目標次數":"Total check-ins for goal","達到此次數時，年度目標進度會到 100%。":"The linked goal reaches 100% at this number of check-ins.","本週":"This week","連續天數":"Day streak","連續週數":"Week streak","打卡":"Check in","撤銷今日打卡":"Undo today's check-in","已打卡":"Checked in",
    "尚未新增習慣，先從每天一小步開始。":"No habits yet. Start with one small daily step.","習慣已新增":"Habit added","習慣已更新":"Habit updated","習慣已刪除":"Habit deleted","請輸入習慣名稱":"Enter a habit name.","連結年度目標（選填）":"Link annual goal (optional)"
  });  Object.assign(zhToEn,{
    "刪除分類":"Delete category","分類名稱最多 12 個字":"Category names are limited to 12 characters.","分類已刪除，相關項目已移至生活":"Category deleted; related items moved to Life."
  });  const enToZh = Object.fromEntries(Object.entries(zhToEn).map(([zh,en]) => [en,zh]));
  const packs = window.dayformLanguagePacks || {};
  const locales = {
    'zh-Hant': { intl: 'zh-TW', ai: 'Traditional Chinese' }, en: { intl: 'en-US', ai: 'English' },
    ja: { intl: 'ja-JP', ai: 'Japanese' }, ko: { intl: 'ko-KR', ai: 'Korean' },
    ru: { intl: 'ru-RU', ai: 'Russian' }, fr: { intl: 'fr-FR', ai: 'French' },
    ar: { intl: 'ar', ai: 'Arabic' }, th: { intl: 'th-TH', ai: 'Thai' }, de: { intl: 'de-DE', ai: 'German' }
  };
  const titles = {
    'zh-Hant':'日序 — 個人行程與目標', en:'DAYFORM — Schedule & Goals',
    ja:'DAYFORM — 予定と目標', ko:'DAYFORM — 일정 및 목표',
    ru:'DAYFORM — Расписание и цели', fr:'DAYFORM — Planning et objectifs',
    ar:'DAYFORM — الجدول والأهداف', th:'DAYFORM — ตารางเวลาและเป้าหมาย', de:'DAYFORM — Zeitplan und Ziele'
  };
  const reversePacks = new Map();
  Object.entries(packs).forEach(([english, translations]) => {
    Object.values(translations).forEach(value => reversePacks.set(value, english));
  });
  let locale = 'zh-Hant';
  try {
    const saved = localStorage.getItem('dayform-language');
    if (locales[saved]) locale = saved;
  } catch {}
  function translateText(value) {
    if (!value.trim()) return value;
    const leading = (value.match(/^\s*/) || [''])[0];
    const trailing = (value.match(/\s*$/) || [''])[0];
    const rawKey = value.slice(leading.length, value.length - trailing.length);
    const symbolPrefix = (rawKey.match(/^[✦＋⇧⇩↑]\s*/) || [''])[0];
    const key = rawKey.slice(symbolPrefix.length);
    let english = zhToEn[key] || (enToZh[key] ? key : reversePacks.get(key) || key);
    let match = key.match(/^今日 (\d+) 個行程$/);
    if (match) english = 'Today: ' + match[1] + ' event' + (match[1] === '1' ? '' : 's');
    match = key.match(/^當日 (\d+) 個行程$/);
    if (match) english = 'Selected day: ' + match[1] + ' event' + (match[1] === '1' ? '' : 's');
    match = key.match(/^逾期 ·\s*(.+)$/);
    if (match) english = 'Overdue · ' + match[1];
    match = key.match(/^已更新 (\d+) 個課程行程$/);
    if (match) english = 'Updated ' + match[1] + ' timetable events.';
    match = key.match(/^已建立 (\d+) 個課程行程$/);
    if (match) english = 'Created ' + match[1] + ' timetable events.';    match = key.match(/^(\d+) 個行程$/);
    if (match) english = match[1] + ' event' + (match[1] === '1' ? '' : 's');
    match = key.match(/^已匯入 (\d+) 門課，共建立 (\d+) 個課程行程$/);
    if (match) english = 'Imported ' + match[1] + ' course(s) and created ' + match[2] + ' timetable event(s).';
    match = key.match(/^已新增「(.+)」分類$/);
    if (match) english = 'Added category "' + match[1] + '".';
    if (locale === 'zh-Hant') {
      let chinese = enToZh[english] || english;
      match = english.match(/^Today: (\d+) events?$/);
      if (match) chinese = '今日 ' + match[1] + ' 個行程';
      match = english.match(/^(\d+) events?$/);
      if (match) chinese = match[1] + ' 個行程';
      match = english.match(/^Selected day: (\d+) events?$/);
      if (match) chinese = '當日 ' + match[1] + ' 個行程';      match = english.match(/^Imported (\d+) course\(s\) and created (\d+) timetable event\(s\)\.$/);
      if (match) chinese = '已匯入 ' + match[1] + ' 門課，共建立 ' + match[2] + ' 個課程行程';
      match = english.match(/^Overdue · (.+)$/);
      if (match) chinese = '逾期 · ' + match[1];
      match = english.match(/^Updated (\d+) timetable events?\.$/);
      if (match) chinese = '已更新 ' + match[1] + ' 個課程行程';
      match = english.match(/^Created (\d+) timetable events?\.$/);
      if (match) chinese = '已建立 ' + match[1] + ' 個課程行程';
      match = english.match(/^Added category "(.+)"\.$/);
      if (match) chinese = '已新增「' + match[1] + '」分類';
      return leading + symbolPrefix + chinese + trailing;
    }
    let localized = locale === 'en' ? english : (packs[english]?.[locale] || english);
    match = english.match(/^Overdue · (.+)$/);
    if (match && locale !== 'en') localized = (packs['Overdue ·']?.[locale] || 'Overdue ·') + ' ' + match[1];
    match = english.match(/^Updated (\d+) timetable events?\.$/);
    if (match && locale !== 'en') localized = (packs['Timetable events updated']?.[locale] || 'Timetable events updated') + ': ' + match[1];
    match = english.match(/^Created (\d+) timetable events?\.$/);
    if (match && locale !== 'en') localized = (packs['Timetable events created']?.[locale] || 'Timetable events created') + ': ' + match[1];
    return leading + symbolPrefix + localized + trailing;
  }
  function formatDuration(minutes) {
    const total = Math.max(0, Number(minutes) || 0);
    const hours = Math.floor(total / 60), mins = total % 60, intl = locales[locale].intl, result = [];
    if (hours) result.push(new Intl.NumberFormat(intl, { style: 'unit', unit: 'hour', unitDisplay: 'short' }).format(hours));
    if (mins || !hours) result.push(new Intl.NumberFormat(intl, { style: 'unit', unit: 'minute', unitDisplay: 'short' }).format(mins));
    return result.join(' ');
  }
  window.dayformLocale = () => locale;
  window.dayformIntlLocale = () => locales[locale].intl;
  window.dayformAiLanguage = () => locales[locale].ai;
  window.dayformFormatDuration = formatDuration;
  window.dayformTranslate = translateText;
  function applyTranslations(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim()) {
        const translated = translateText(node.nodeValue);
        if (translated !== node.nodeValue) node.nodeValue = translated;
      }
    }
    root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(element => {
      ['placeholder','title','aria-label'].forEach(attribute => {
        if (element.hasAttribute(attribute)) {
          const oldValue = element.getAttribute(attribute);
          const translated = translateText(oldValue);
          if (translated !== oldValue) element.setAttribute(attribute, translated);
        }
      });
    });
  }
  const selector = document.querySelector('#languageSelect');
  function setLocale(value) {
    locale = locales[value] ? value : 'zh-Hant';
    try { localStorage.setItem('dayform-language', locale); } catch {}
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.title = titles[locale];
    if (selector) selector.value = locale;
    applyTranslations(document.body);
    window.dispatchEvent(new CustomEvent('dayform-language-changed', { detail: { locale } }));
  }
  if (selector) selector.addEventListener('change', () => setLocale(selector.value));
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.title = titles[locale];
  if (selector) selector.value = locale;
  applyTranslations(document.body);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') {
        const translated = translateText(record.target.nodeValue);
        if (translated !== record.target.nodeValue) record.target.nodeValue = translated;
      } else {
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            const translated = translateText(node.nodeValue);
            if (translated !== node.nodeValue) node.nodeValue = translated;
          } else if (node.nodeType === Node.ELEMENT_NODE) applyTranslations(node);
        });
      }
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();