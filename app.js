function toLocalISODate(date = new Date()) {
  const pad = value => String(value).padStart(2, '0');
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}
const todayISO = toLocalISODate();
let selectedDate = todayISO;
window.dayformTodayISO = () => toLocalISODate();
window.dayformSelectedDateISO = () => selectedDate;
const initialState = {
  tasks:[
    {id:'t1',title:'整理 Q4 產品規劃提案',category:'工作',due:'09:00',priority:'high',done:false,goalId:'g1'},
    {id:'t2',title:'完成英文閱讀 Chapter 4',category:'學習',due:'11:30',priority:'normal',done:false,goalId:'g3'},
    {id:'t3',title:'寄出設計稿給合作夥伴',category:'工作',due:'14:00',priority:'high',done:false,goalId:'g1'},
    {id:'t4',title:'預約下週牙醫回診',category:'生活',due:'18:00',priority:'normal',done:true,goalId:null},
    {id:'t5',title:'讀完《原子習慣》一章',category:'學習',due:'20:00',priority:'normal',done:false,goalId:'g3'}
  ],
  events:[
    {id:'e1',title:'晨間規劃與咖啡',time:'08:30',end:'09:00',place:'個人時間',category:'生活',date:todayISO},
    {id:'e2',title:'產品週會',time:'09:30',end:'10:30',place:'會議室 A · 專案進度同步',category:'工作',date:todayISO},
    {id:'e3',title:'專注工作時段',time:'11:00',end:'12:00',place:'Q4 產品規劃提案',category:'工作',date:todayISO},
    {id:'e4',title:'午餐 & 散步',time:'12:30',end:'13:30',place:'留一點時間給自己',category:'生活',date:todayISO},
    {id:'e5',title:'英文線上課程',time:'15:00',end:'16:00',place:'Unit 6 · Conversation',category:'學習',date:todayISO},
    {id:'e6',title:'健身房訓練',time:'18:30',end:'19:30',place:'下肢訓練日',category:'生活',date:todayISO}
  ],
  goals:[
    {id:'g1',title:'成為更好的產品設計師',emoji:'✦',description:'完成作品集改版與產品設計進修',category:'工作',deadline:'2026-12-31',manual:null,milestones:[{title:'完成 UX 進階課程',done:true,weight:30},{title:'主導一項完整產品改版',done:true,weight:35},{title:'整理並發布作品集',done:false,weight:35}]},
    {id:'g2',title:'建立穩定的運動習慣',emoji:'⌁',description:'每週運動三次，累積 150 次訓練',category:'生活',deadline:'2026-12-31',manual:null,milestones:[{title:'完成 50 次訓練',done:true,weight:30},{title:'完成 100 次訓練',done:false,weight:35},{title:'完成 150 次訓練',done:false,weight:35}]},
    {id:'g3',title:'提升英文溝通能力',emoji:'文',description:'完成進階課程並能自然進行會話',category:'學習',deadline:'2026-12-31',manual:null,milestones:[{title:'完成 B1 線上課程',done:true,weight:40},{title:'每週英文對話練習',done:false,weight:30},{title:'完成英文簡報分享',done:false,weight:30}]}
  ],
  customCategories:[],
  deadlines:[],
  habits:[{id:'habit-exercise',title:'運動',frequency:'weekly',target:3,checkIns:[],goalId:'g2',goalTarget:150,isExample:true}],
  settings:{eventReminder:true,taskReminder:true,reminderMinutes:10}
};
let state,hasSavedState=false;
try { const savedState=localStorage.getItem('dayform-state');if(savedState){state=JSON.parse(savedState);hasSavedState=true}else state=structuredClone(initialState); } catch { state=structuredClone(initialState); }
state.events=state.events||[];state.events.forEach(event=>{if(!event.date)event.date=todayISO});state.deadlines=state.deadlines||[];state.habits=Array.isArray(state.habits)?state.habits:(hasSavedState?[]:structuredClone(initialState.habits||[]));
function isLegacyInjectedExample(habit){return habit?.isExample===undefined&&habit?.id==='habit-exercise'&&habit?.title==='運動'&&habit?.frequency==='weekly'&&Number(habit?.target)===3&&habit?.goalId==='g2'&&Number(habit?.goalTarget)===150&&!(habit?.checkIns||[]).length}
if(hasSavedState)state.habits=state.habits.filter(habit=>!isLegacyInjectedExample(habit));
let hasAutoScrolledToNow=false;let taskTab='today',categoryFilter='all',modalType=null,editingId=null,notificationTimers=[];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let themePreference='auto';
try{const savedTheme=localStorage.getItem('dayform-theme');if(['auto','dark','light'].includes(savedTheme))themePreference=savedTheme}catch{}
function applyTheme(){
 const hour=new Date().getHours(),dark=themePreference==='dark'||(themePreference==='auto'&&(hour>=18||hour<6));
 document.documentElement.dataset.theme=dark?'dark':'light';
 const select=$('#themeSelect');
 if(select)select.value=themePreference;
}function renderGreeting(user = window.dayformUser || null) {
 const language=window.dayformLocale?.()||'zh-Hant';
 const t=value=>window.dayformTranslate?.(value)||value;
 const hour=new Date().getHours();
 const greetingKey=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
 const greeting=language==='zh-Hant'?(hour<12?'早安':hour<18?'午安':'晚安'):t(greetingKey);
 const fullName=String(user?.displayName?.trim()||user?.email?.split('@')[0]||'').trim();
 const name=fullName.split(/\s+/)[0];
 $('#welcomeGreeting').textContent=greeting+(name?(language==='zh-Hant'?'，':', ')+name:'');
 const avatar=Array.from(fullName)[0]||(language==='zh-Hant'?'日':'D');
 $('#profileName').textContent=user?.displayName||(language==='zh-Hant'?'訪客':t('Guest'));
 $('#profileDetail').textContent=user?.email||(language==='zh-Hant'?'個人工作區':t('Personal workspace'));
 $('#profileAvatar').textContent=avatar;
 $('#topAvatar').textContent=avatar;
}
const localSave=()=>localStorage.setItem('dayform-state',JSON.stringify(state));
const save=()=>{localSave();window.dayformState=state;window.dispatchEvent(new CustomEvent('dayform-state-changed',{detail:{state}}))};
window.dayformState=state;
window.addEventListener('dayform-add-ai-event',e=>{const event=e.detail?.event;if(!event)return;state.events.push(event);save();render()});
window.addEventListener('dayform-refresh',()=>render());
window.addEventListener('dayform-cloud-state',event=>{if(!event.detail?.state)return;state={...structuredClone(initialState),...event.detail.state};state.events=state.events||[];state.events.forEach(item=>{if(!item.date)item.date=todayISO});state.deadlines=state.deadlines||[];state.habits=Array.isArray(event.detail.state.habits)?event.detail.state.habits:[];state.habits=state.habits.filter(habit=>!isLegacyInjectedExample(habit));window.dayformState=state;render()});
window.addEventListener('dayform-auth-changed',event=>{const user=event.detail?.user||null;window.dayformUser=user;renderGreeting(user);if(user){const local=localStorage.getItem('dayform-state');if(local)window.dispatchEvent(new CustomEvent('dayform-local-state-ready',{detail:{state:JSON.parse(local)}}))}});
function toast(message,error=false,action=null){const node=document.createElement('div');node.className='toast'+(error?' error':'');const copy=document.createElement('span');copy.textContent=message;node.append(copy);if(action){const button=document.createElement('button');button.type='button';button.className='toast-action';button.textContent=window.dayformTranslate?.('復原')||'復原';button.addEventListener('click',()=>{node.remove();action()});node.append(button)}$('#toastRegion').append(node);setTimeout(()=>node.remove(),action?8000:3000)}
function milestonePct(goal){const milestones=goal.milestones||[],weight=milestones.reduce((sum,m)=>sum+(Number(m.weight)||0),0);return weight?Math.round(milestones.reduce((sum,m)=>sum+(m.done?(Number(m.weight)||0):0),0)/weight*100):0}
function pct(goal){const linked=(state.habits||[]).filter(habit=>habit.goalId===goal.id&&Number(habit.goalTarget)>0);const baseline=goal.habitBase!==null&&goal.habitBase!==undefined?Number(goal.habitBase):goal.manual!==null&&goal.manual!==undefined?Number(goal.manual):milestonePct(goal);if(linked.length){const ratio=linked.reduce((sum,habit)=>sum+Math.min(1,(habit.checkIns||[]).length/Math.max(1,Number(habit.goalTarget)||1)),0)/linked.length;return Math.round(Math.max(0,Math.min(100,baseline+(100-baseline)*ratio)))}return goal.manual!==null&&goal.manual!==undefined?Math.max(0,Math.min(100,Number(goal.manual))):milestonePct(goal)}
function renderDate(){
 const d=new Date(selectedDate+'T12:00:00');
 const locale=window.dayformIntlLocale?.()||'zh-TW';
 const weekday=new Intl.DateTimeFormat(locale,{weekday:'long'}).format(d);
 const todayChip=$('.today-chip');
 if(todayChip)todayChip.textContent=selectedDate===toLocalISODate()?(window.dayformTranslate?.('今天')||'Today'):new Intl.DateTimeFormat(locale,{month:'numeric',day:'numeric'}).format(d); $('#headerDate').textContent=new Intl.DateTimeFormat(locale,{year:'numeric',month:'long',day:'numeric'}).format(d);
 $('#longDate').textContent=new Intl.DateTimeFormat(locale,{weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(d);
 const greeting=window.dayformTranslate?.('A good day ahead')||'A good day ahead';
 const hour=new Date().getHours(),dayIcon=hour>=18||hour<6?'☾':'☀';
 document.querySelector('.eyebrow').innerHTML='<span class="sun-icon">'+dayIcon+'</span>'+weekday+' · '+esc(greeting);
 $('#scheduleDate').textContent=new Intl.DateTimeFormat(locale,{month:'short',day:'numeric'}).format(d)+' · '+weekday;
}
function renderStats(){const done=state.tasks.filter(t=>t.done).length,total=state.tasks.length,progress=total?Math.round(done/total*100):0;$('#doneStat').textContent=done;$('#totalStat').textContent=total;$('#dailyProgress').style.width=progress+'%';$('#progressCaption').textContent=progress>=80?'太棒了，繼續保持':progress>=40?'保持節奏':'一步一步來';$('#taskCount').textContent=state.tasks.filter(t=>!t.done).length;$('#tabTodayCount').textContent=state.tasks.filter(t=>!t.done).length;
 const goals=state.goals;$('#goalStat').textContent=(goals.length?Math.round(goals.reduce((s,g)=>s+pct(g),0)/goals.length):0)+'%';$('#miniGoals').innerHTML=goals.slice(0,3).map(g=>`<i style="flex:${Math.max(pct(g),8)}" title="${esc(g.title)} ${pct(g)}%"></i>`).join('');
 const counts={'生活':0,'工作':0,'學習':0};state.tasks.forEach(t=>counts[t.category]=(counts[t.category]||0)+1);state.events.forEach(e=>counts[e.category]=(counts[e.category]||0)+1);$('#allCount').textContent=state.tasks.length+state.events.length;$$('.category-filter').forEach(button=>{const count=button.querySelector('.cat-total');if(count)count.textContent=button.dataset.filter==='all'?state.tasks.length+state.events.length:(counts[button.dataset.filter]||0)});}
function renderTimeline() {
 const root = $('#timeline');
 const hourHeight = Number.parseFloat(getComputedStyle(root).getPropertyValue('--hour-height')) || 48;
 const now = new Date();
 const currentDate = toLocalISODate(now);
 const isToday = selectedDate === currentDate;
 const nowMin = now.getHours() * 60 + now.getMinutes();
 const nowTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
 const hours = Array.from({length: 24}, (_, i) => i);
 root.innerHTML = hours.map(hour => {
  const time = String(hour).padStart(2, '0') + ':00';
  const events = state.events
   .filter(e => !e.cancelled && (e.date || currentDate) === selectedDate && Number((e.time || '').slice(0, 2)) === hour)
   .sort((a, b) => a.time.localeCompare(b.time));
  let inner = events.map(e => {
   const color = e.category === '生活' ? 'orange' : e.category === '學習' ? 'violet' : '';
   const [startHour, startMinute] = String(e.time || '00:00').split(':').map(Number);
   const startMin = startHour * 60 + startMinute;
   const [endHour, endMinute] = String(e.end || '').split(':').map(Number);
   let durationMinutes = e.end ? endHour * 60 + endMinute - startMin : 60;
   if (durationMinutes <= 0) durationMinutes += 24 * 60;
   durationMinutes = Math.max(15, durationMinutes);
   const top = (startMin - hour * 60) / 60 * hourHeight;
   const height = Math.max(18, durationMinutes / 60 * hourHeight);
   const compact = height < 38 ? ' compact' : ''; const cancelledClass=e.cancelled?' cancelled':'';
   return '<div class="event-card ' + color + compact + cancelledClass + '" style="top:' + top + 'px;height:' + height + 'px" data-event="' + esc(e.id) + '" tabindex="0" role="button" aria-haspopup="dialog" aria-label="' + esc(e.title + '，' + e.time + '–' + (e.end || '')) + '"><div class="event-copy"><div class="event-title">' + esc(e.title) + '</div><div class="event-meta">' + esc(e.cancelled?'課程已停課':(e.place || e.category)) + '</div></div><span class="event-time">' + esc(e.time) + ' – ' + esc(e.end || '') + '</span></div>';
  }).join('');
  if (isToday && nowMin >= hour * 60 && nowMin < (hour + 1) * 60) {
   inner += '<div class="now-line" style="top:' + ((nowMin - hour * 60) / 60 * hourHeight) + 'px"><span class="now-label">現在</span></div>';
  }
  return '<div class="time-row"><span class="time-label">' + time + '</span><div class="time-slot">' + inner + '</div></div>';
 }).join('');
 root.querySelectorAll('.event-card').forEach(card=>{const activate=()=>openModal('event',card.dataset.event);card.addEventListener('click',activate);card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate()}})});
 const upcoming = state.events
  .filter(e => !e.cancelled && (e.date || currentDate) === selectedDate && (selectedDate > currentDate || (isToday && e.time >= nowTime)))
  .sort((a, b) => a.time.localeCompare(b.time));
 $('#remainingCount').textContent = (isToday ? '今日' : '當日') + ' ' + upcoming.length + ' 個行程';
 $('#eventRemaining').textContent = upcoming.length + ' 個行程';
 const next = upcoming[0];
 if (next) {
  $('#nextTime').textContent = next.time;
  $('#nextEvent').textContent = next.title + ' · ' + (next.place || next.category);
 } else {
  $('#nextTime').textContent = '—';
  $('#nextEvent').textContent = isToday ? '今天的行程都完成了' : '當日沒有待辦行程';
 }
  if(isToday&&!hasAutoScrolledToNow&&window.matchMedia('(max-width:820px)').matches){
   const nowLine=root.querySelector('.now-line');
   if(nowLine){hasAutoScrolledToNow=true;requestAnimationFrame(()=>nowLine.scrollIntoView({behavior:'smooth',block:'center'}))}
  }}
function toggleCourseOccurrence(id){const event=state.events.find(item=>item.id===id);if(!event||!event.recurring)return;event.cancelled=!event.cancelled;closeModal();render();scheduleNotifications();toast(event.cancelled?'已標記本堂停課':'已恢復本堂課程')}function taskIsOverdue(task){
 if(task.done||!/^([01]\d|2[0-3]):[0-5]\d$/.test(task.due||''))return false;
 const today=toLocalISODate(),dueDate=task.date||task.dueDate;
 const now=new Date(),nowTime=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
 if(dueDate){if(dueDate<today)return true;if(dueDate>today)return false;return task.due<nowTime}
 return selectedDate===today&&task.due<nowTime;
}
function taskIsDueSoon(task){
 if(task.done||selectedDate!==toLocalISODate())return false;
 const dueDate=task.date||task.dueDate;
 if(dueDate&&dueDate!==toLocalISODate())return false;
 const parts=(task.due||'').split(':').map(Number);
 if(parts.length!==2||parts.some(Number.isNaN))return false;
 const due=parts[0]*60+parts[1],now=new Date(),current=now.getHours()*60+now.getMinutes();
 return due>=current&&due<=current+120;
}
function filteredTasks(){
 let list=state.tasks;
 if(taskTab==='today')list=list.filter(t=>!t.done);
 else if(taskTab==='done')list=list.filter(t=>t.done);
 else list=list.filter(taskIsDueSoon);
 if(categoryFilter!=='all')list=list.filter(t=>t.category===categoryFilter);
 return list;
}
function eventBounds(event){
 const parse=value=>{if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value||''))return null;const parts=value.split(':').map(Number);return parts[0]*60+parts[1]};
 const start=parse(event.time);if(start===null)return null;
 let end=parse(event.end);if(end===null)end=start+60;else if(end<=start)end+=1440;
 return {start,end};
}
function readableDuration(minutes){
 return window.dayformFormatDuration?.(minutes) || String(minutes)+' 分鐘';
}
function renderWeeklyReview(){
 const t=value=>window.dayformTranslate?.(value)||value;
 const locale=window.dayformIntlLocale?.()||'zh-TW';
 const start=new Date(selectedDate+'T12:00:00');
 start.setDate(start.getDate()-((start.getDay()+6)%7));
 const today=toLocalISODate();
 const now=new Date(),nowMinutes=now.getHours()*60+now.getMinutes();
 const days=[];
 const categoryMinutes={'學習':0,'工作':0,'生活':0};
 for(let index=0;index<7;index++){
  const date=new Date(start);date.setDate(start.getDate()+index);
  const iso=toLocalISODate(date);
  const events=state.events.filter(event=>!event.cancelled&&(event.date||today)===iso);
  const intervals=events.map(event=>({event,bounds:eventBounds(event)})).filter(item=>item.bounds);
  const ordered=intervals.map(item=>item.bounds).sort((a,b)=>a.start-b.start);
  let overlapCount=0;
  for(let i=0;i<ordered.length;i++)for(let j=i+1;j<ordered.length&&ordered[j].start<ordered[i].end;j++)overlapCount++;
  const merged=[];
  ordered.forEach(interval=>{
   const last=merged[merged.length-1];
   if(last&&interval.start<=last.end)last.end=Math.max(last.end,interval.end);
   else merged.push({start:interval.start,end:interval.end});
  });
  const minutes=merged.reduce((sum,item)=>sum+Math.max(0,Math.min(1440,item.end)-Math.max(0,item.start)),0);
  intervals.forEach(item=>{const category=item.event.category;if(categoryMinutes[category]!==undefined)categoryMinutes[category]+=Math.max(0,item.bounds.end-item.bounds.start)});
  const dayStart=iso<today?22*60:iso===today?Math.max(8*60,nowMinutes):8*60;
  const gaps=[];let cursor=dayStart;
  merged.forEach(interval=>{
   const blockStart=Math.min(22*60,Math.max(dayStart,interval.start)),blockEnd=Math.min(22*60,interval.end);
   if(blockStart>cursor&&blockStart-cursor>=60)gaps.push({date:iso,start:cursor,end:blockStart,duration:blockStart-cursor});
   cursor=Math.max(cursor,blockEnd);
  });
  if(22*60-cursor>=60)gaps.push({date:iso,start:cursor,end:22*60,duration:22*60-cursor});
  const weekday=new Intl.DateTimeFormat(locale,{weekday:'short'}).format(date);
  days.push({date:iso,weekday,minutes,overlapCount,gaps,heavy:minutes>=480||overlapCount>0});
 }
 const rangeFormatter=new Intl.DateTimeFormat(locale,{month:'short',day:'numeric'});
 const weekEnd=new Date(start);weekEnd.setDate(start.getDate()+6);
 $('#weeklyRange').textContent=rangeFormatter.format(start)+' – '+rangeFormatter.format(weekEnd);
 const total=days.reduce((sum,day)=>sum+day.minutes,0);
 const weekStartISO=toLocalISODate(start),weekEndISO=toLocalISODate(weekEnd);
 const eventCount=state.events.filter(event=>{const date=event.date||today;return date>=weekStartISO&&date<=weekEndISO}).length;
 const sidebarTotal=$('#weeklySidebarTotal');if(sidebarTotal)sidebarTotal.textContent=readableDuration(total);
 const sidebarEvents=$('#weeklySidebarEvents');if(sidebarEvents)sidebarEvents.textContent=String(eventCount);
 const sidebarLabel=$('#weeklySidebarEventsLabel');if(sidebarLabel)sidebarLabel.textContent=t('行程');
 const busiest=days.reduce((best,day)=>day.minutes>best.minutes?day:best,days[0]);
 $('#weeklyTotal').textContent=t('本週已安排')+' '+readableDuration(total);
 const heavyCount=days.filter(day=>day.heavy).length;
 const allGaps=days.flatMap(day=>day.gaps).sort((a,b)=>b.duration-a.duration||a.date.localeCompare(b.date));
 const stats=[
  [t('最忙的一天'),busiest.minutes?busiest.weekday+' · '+readableDuration(busiest.minutes):t('尚無排程')],
  [t('安排偏滿的日子'),String(heavyCount)],
  [t('一小時以上空檔'),String(allGaps.length)]
 ];
 $('#weeklyStats').innerHTML=stats.map(item=>'<article class="weekly-stat"><small>'+esc(item[0])+'</small><b>'+esc(item[1])+'</b></article>').join('');
 const scale=Math.max(60,...days.map(day=>day.minutes));
 $('#weeklyBars').innerHTML=days.map(day=>{
  const height=day.minutes?Math.max(6,Math.round(day.minutes/scale*100)):3;
  const stateLabel=day.heavy?t('安排偏滿'):t('還有餘裕');
  return '<button type="button" class="weekly-day'+(day.date===selectedDate?' selected':'')+'" data-week-date="'+day.date+'" title="'+esc(day.weekday+' · '+readableDuration(day.minutes)+' · '+stateLabel)+'"><span class="weekly-day-name">'+esc(day.weekday)+'</span><span class="weekly-bar-track"><i style="height:'+height+'%"></i></span><b>'+esc(day.minutes?readableDuration(day.minutes):'—')+'</b><small>'+esc(stateLabel)+'</small></button>';
 }).join('');
 $('#weeklyBars').querySelectorAll('[data-week-date]').forEach(button=>button.addEventListener('click',()=>{selectedDate=button.dataset.weekDate;render()}));
 $('#weeklyCategories').innerHTML=Object.entries(categoryMinutes).map(entry=>'<span class="weekly-category '+esc(entry[0])+'"><i></i>'+esc(t(entry[0]))+' <b>'+esc(readableDuration(entry[1]))+'</b></span>').join('');
 if(allGaps.length){
  $('#weeklyGaps').innerHTML=allGaps.slice(0,4).map(gap=>{
   const date=new Date(gap.date+'T12:00:00');
   const weekday=new Intl.DateTimeFormat(locale,{weekday:'short'}).format(date);
   const line=weekday+' '+String(Math.floor(gap.start/60)).padStart(2,'0')+':'+String(gap.start%60).padStart(2,'0')+'–'+String(Math.floor(gap.end/60)).padStart(2,'0')+':'+String(gap.end%60).padStart(2,'0');
   return '<span class="weekly-gap">'+esc(line)+' <b>'+esc(readableDuration(gap.duration))+'</b></span>';
  }).join('');
 }else $('#weeklyGaps').innerHTML='<p class="weekly-empty">'+esc(t('這週沒有尚未安排的一小時以上空檔。'))+'</p>';
}
function renderTasks(){
 const root=$('#taskList'),tasks=filteredTasks();
 if(!tasks.length){root.innerHTML='<div class="empty-state"><span class="empty-icon">✧</span><span>'+(taskTab==='done'?'完成的任務會出現在這裡':'目前沒有任務，享受一點留白吧。')+'</span></div>';return}
 root.innerHTML=tasks.map(t=>{
  const overdue=taskIsOverdue(t);
  const taskClass='task-row'+(t.done?' completed':'');
  const dueClass='task-due'+(overdue?' overdue':'');
  const overduePrefix=window.dayformTranslate?.('逾期 ·')||'逾期 ·';
  const dueLabel=(overdue?overduePrefix+' ':'')+esc(t.due);
  const checkLabel=esc(t.done?'取消完成 ':'完成 ')+esc(t.title);
  const priority=t.priority==='high'?'<i class="priority-mark high" title="高優先級"></i>':'<i class="priority-mark" title="一般優先級"></i>';
  return '<div class="'+taskClass+'"><input type="checkbox" class="task-check" '+(t.done?'checked':'')+' data-toggle-task="'+esc(t.id)+'" aria-label="'+checkLabel+'"><div class="task-copy"><div class="task-title">'+esc(t.title)+'</div><div class="task-meta"><span class="task-category '+esc(t.category)+'">'+esc(t.category)+'</span><span class="'+dueClass+'">'+dueLabel+'</span></div></div>'+priority+'<button class="task-more" data-edit-task="'+esc(t.id)+'" title="編輯任務">···</button></div>';
 }).join('');
 root.querySelectorAll('[data-toggle-task]').forEach(el=>el.addEventListener('change',()=>toggleTask(el.dataset.toggleTask)));
 root.querySelectorAll('[data-edit-task]').forEach(el=>el.addEventListener('click',()=>openModal('task',el.dataset.editTask)));
}
function renderGoals(){const root=$('#goalsGrid'),t=value=>window.dayformTranslate?.(value)||value;root.innerHTML=state.goals.map(g=>{const value=pct(g),completed=(g.milestones||[]).filter(m=>m.done).length,linked=(state.habits||[]).filter(habit=>habit.goalId===g.id),habitSummary=linked.length?linked.map(habit=>(habit.checkIns||[]).length+'/'+(habit.goalTarget||0)).join(' · '):'',description=[g.description||`${completed}/${(g.milestones||[]).length} 個里程碑完成`,habitSummary?t('累積打卡目標次數')+': '+habitSummary:''].filter(Boolean).join(' · ');return `<article class="goal-card" data-goal="${esc(g.id)}" tabindex="0"><div class="goal-top"><span class="goal-emoji">${esc(g.emoji||'✦')}</span><span class="goal-name">${esc(g.title)}</span><span class="goal-percent">${value}%</span></div><div class="goal-description">${esc(description)}${g.manual!==null&&g.manual!==undefined?` · 手動調整`:''}</div><div class="goal-progress"><span style="width:${value}%"></span></div></article>`}).join('')||'<div class="empty-state">新增第一個年度目標，開始規劃你的方向。</div>';root.querySelectorAll('.goal-card').forEach(card=>{card.addEventListener('click',()=>openModal('goal',card.dataset.goal));card.addEventListener('keydown',e=>{if(e.key==='Enter')openModal('goal',card.dataset.goal)})});$('.nav-count').textContent=state.goals.length}
function renderDeadlines(){
 const root=$('#deadlineList');
 if(!root)return;
 const t=value=>window.dayformTranslate?.(value)||value;
 const locale=window.dayformIntlLocale?.()||'zh-TW';
 const today=toLocalISODate();
 const group=item=>item.done?2:item.date<today?1:0;
 const items=(state.deadlines||[]).slice().sort((a,b)=>group(a)-group(b)||a.date.localeCompare(b.date));
 if(!items.length){root.innerHTML='<p class="deadline-empty">'+esc(t('尚未新增截止日。'))+'</p>';return}
 const relative=new Intl.RelativeTimeFormat(locale,{numeric:'auto'});
 const dateFormat=new Intl.DateTimeFormat(locale,{year:'numeric',month:'short',day:'numeric'});
 root.innerHTML=items.map(item=>{
  const days=Math.round((new Date(item.date+'T12:00:00')-new Date(today+'T12:00:00'))/86400000);
  const urgency=item.done?'completed':days<0?'overdue':days<=1?'urgent':days<=7?'soon':'normal';
  const countdown=item.done?t('已完成'):relative.format(days,'day');
  const type=t(item.type==='exam'?'Exam':'Assignment');
  const dateLabel=dateFormat.format(new Date(item.date+'T12:00:00'));
  const toggleLabel=t(item.done?'取消完成':'標記完成');
  return '<article class="deadline-card'+(item.done?' completed':'')+'" data-deadline="'+esc(item.id)+'"><div class="deadline-kind">'+esc(type)+'</div><div class="deadline-copy"><b>'+esc(item.title)+'</b><small>'+esc(dateLabel)+(item.description?' · '+esc(item.description):'')+'</small></div><strong class="deadline-countdown '+urgency+'">'+esc(countdown)+'</strong><div class="deadline-actions"><button type="button" class="deadline-complete" data-toggle-deadline="'+esc(item.id)+'" aria-label="'+esc(toggleLabel)+'" title="'+esc(toggleLabel)+'">'+esc(toggleLabel)+'</button><button type="button" class="deadline-delete" data-delete-deadline="'+esc(item.id)+'" aria-label="'+esc(t('刪除截止日'))+'">×</button></div></article>';
 }).join('');
 root.querySelectorAll('[data-toggle-deadline]').forEach(button=>button.addEventListener('click',()=>{
  const item=(state.deadlines||[]).find(value=>value.id===button.dataset.toggleDeadline);
  if(item)item.done=!item.done;
  render();
 }));
 root.querySelectorAll('[data-delete-deadline]').forEach(button=>button.addEventListener('click',()=>{const index=(state.deadlines||[]).findIndex(item=>item.id===button.dataset.deleteDeadline);if(index<0)return;const item=state.deadlines.splice(index,1)[0];render();toast('項目已刪除',false,()=>{state.deadlines.splice(Math.min(index,state.deadlines.length),0,item);render();toast('已復原')})}));
}
function deleteCustomCategory(category){const index=state.customCategories.indexOf(category);if(index<0)return;const previousFilter=categoryFilter,affected=[];state.customCategories.splice(index,1);['tasks','events','goals'].forEach(collection=>(state[collection]||[]).forEach(item=>{if(item.category===category){affected.push({collection,id:item.id,category:item.category});item.category='生活'}}));if(categoryFilter===category)categoryFilter='all';render();toast('分類已刪除，相關項目已移至生活',false,()=>{state.customCategories.splice(Math.min(index,state.customCategories.length),0,category);affected.forEach(entry=>{const item=(state[entry.collection]||[]).find(value=>value.id===entry.id);if(item)item.category=entry.category});categoryFilter=previousFilter;render();toast('已復原')})}
function renderCategories(){const root=$('.category-list');root.querySelectorAll('[data-custom-category]').forEach(row=>row.remove());state.customCategories.forEach(category=>{const row=document.createElement('div');row.className='custom-category-row';row.dataset.customCategory='true';const button=document.createElement('button');button.type='button';button.className='category-filter';button.dataset.filter=category;const dot=document.createElement('span');dot.className='category-dot';dot.style.background='#aa91b5';const label=document.createElement('span');label.className='category-name';label.textContent=category;const count=document.createElement('span');count.className='cat-total';button.append(dot,label,count);const remove=document.createElement('button');remove.type='button';remove.className='category-delete';remove.dataset.deleteCategory=category;remove.textContent='×';const removeLabel=(window.dayformTranslate?.('刪除分類')||'刪除分類')+': '+category;remove.setAttribute('aria-label',removeLabel);remove.title=removeLabel;row.append(button,remove);root.append(row)})}
function shiftISODate(iso,days){const date=new Date(iso+'T12:00:00');date.setDate(date.getDate()+days);return toLocalISODate(date)}
function weekStartISO(iso){const date=new Date(iso+'T12:00:00');date.setDate(date.getDate()-((date.getDay()+6)%7));return toLocalISODate(date)}
function habitWeekCount(habit,start=weekStartISO(toLocalISODate())){const next=shiftISODate(start,7);return (habit.checkIns||[]).filter(day=>day>=start&&day<next).length}
function habitStreak(habit){const today=toLocalISODate(),days=new Set(habit.checkIns||[]);if(habit.frequency==='daily'){let cursor=days.has(today)?today:shiftISODate(today,-1),count=0;while(days.has(cursor)){count++;cursor=shiftISODate(cursor,-1)}return count}const target=Math.max(1,Number(habit.target)||1);let monday=weekStartISO(today);if(habitWeekCount(habit,monday)<target)monday=shiftISODate(monday,-7);let count=0;while(habitWeekCount(habit,monday)>=target){count++;monday=shiftISODate(monday,-7)}return count}
function renderHabits(){const root=$('#habitsList');if(!root)return;const t=value=>window.dayformTranslate?.(value)||value;if(!state.habits?.length){root.innerHTML='<p class="habit-empty">'+esc(t('尚未新增習慣，先從每天一小步開始。'))+'</p>';return}const today=toLocalISODate();root.innerHTML=state.habits.map(habit=>{const checked=(habit.checkIns||[]).includes(today),weekCount=habitWeekCount(habit),weeklyTarget=habit.frequency==='daily'?7:Math.max(1,Number(habit.target)||1),streak=habitStreak(habit),goal=state.goals.find(item=>item.id===habit.goalId),count=(habit.checkIns||[]).length,frequency=habit.frequency==='daily'?t('每天'):t('每週')+(habit.target?' · '+habit.target+'×':''),streakLabel=t(habit.frequency==='daily'?'連續天數':'連續週數'),buttonLabel=t(checked?'撤銷今日打卡':'打卡');return `<article class="habit-card" data-habit="${esc(habit.id)}"><div class="habit-card-head"><div class="habit-card-title"><h3>${esc(habit.title)}</h3><small>${esc(frequency)}</small></div><div class="habit-streak"><b>🔥 ${streak}</b><small>${esc(streakLabel)}</small></div></div><div class="habit-week-row"><span>${esc(t('本週'))}</span><b>${weekCount}/${weeklyTarget}</b></div><div class="habit-progress"><span style="width:${Math.min(100,weekCount/weeklyTarget*100)}%"></span></div>${goal?`<div class="habit-goal">${esc(t('連結年度目標'))}: ${esc(goal.title)} · ${count}/${Number(habit.goalTarget)||0}</div>`:''}<div class="habit-card-actions"><button type="button" class="habit-checkin${checked?' checked':''}" data-check-habit="${esc(habit.id)}" aria-pressed="${checked}">${checked?'✓ ':''}${esc(buttonLabel)}</button><button type="button" class="habit-edit" data-edit-habit="${esc(habit.id)}">${esc(t('編輯'))}</button></div></article>`}).join('')}
function searchableEntries(){const dateAliases=value=>searchDateAliases(value),t=value=>window.dayformTranslate?.(value)||value,entries=[];state.tasks.forEach(item=>entries.push({type:'task',id:item.id,title:item.title,detail:[t('任務'),t(item.category||''),item.due].filter(Boolean).join(' · '),haystack:[item.title,item.category,item.due]}));state.events.forEach(item=>entries.push({type:'event',id:item.id,title:item.title,detail:[t('行程'),item.date,item.time,item.end,item.place].filter(Boolean).join(' · '),haystack:[item.title,item.place,item.category,...dateAliases(item.date),item.time,item.end]}));(state.deadlines||[]).forEach(item=>entries.push({type:'deadline',id:item.id,title:item.title,detail:[t('截止項目'),item.date,item.description].filter(Boolean).join(' · '),haystack:[item.title,...dateAliases(item.date),item.description,item.type]}));state.goals.forEach(item=>entries.push({type:'goal',id:item.id,title:item.title,detail:[t('年度目標'),item.description,item.deadline].filter(Boolean).join(' · '),haystack:[item.title,item.description,item.category,...dateAliases(item.deadline)]}));(state.habits||[]).forEach(item=>{const goal=state.goals.find(value=>value.id===item.goalId);entries.push({type:'habit',id:item.id,title:item.title,detail:[t('習慣打卡'),item.frequency==='daily'?t('每天'):t('每週'),goal?.title].filter(Boolean).join(' · '),haystack:[item.title,item.frequency,goal?.title]})});return entries}
function searchDateAliases(value){const match=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!match)return value?[value]:[];const month=Number(match[2]),day=Number(match[3]),paddedMonth=String(month).padStart(2,'0'),paddedDay=String(day).padStart(2,'0');return [...new Set([value,`${month}/${day}`,`${month}/${paddedDay}`,`${paddedMonth}/${paddedDay}`,`${month}月${day}日`,`${month}月${day}號`,`${month}月${day}`])]}
function hideSearchResults(){const field=$('#globalSearch'),results=$('#searchResults');if(results)results.hidden=true;if(field)field.setAttribute('aria-expanded','false')}
function renderSearch(){const field=$('#globalSearch'),results=$('#searchResults');if(!field||!results)return;const query=field.value.trim().toLocaleLowerCase().replace(/\s+/g,'');if(!query){hideSearchResults();return}const matches=searchableEntries().filter(entry=>entry.haystack.map(value=>String(value||'')).join(' ').toLocaleLowerCase().replace(/\s+/g,'').includes(query)),t=value=>window.dayformTranslate?.(value)||value;results.innerHTML=matches.length?matches.slice(0,10).map(entry=>`<button type="button" class="search-result" role="option" data-search-type="${entry.type}" data-search-id="${esc(entry.id)}"><span class="search-result-kind">${esc(t(({task:'任務',event:'行程',deadline:'截止項目',goal:'年度目標',habit:'習慣打卡'})[entry.type]))}</span><span class="search-result-copy"><b>${esc(entry.title)}</b><small>${esc(entry.detail)}</small></span></button>`).join(''):'<div class="search-no-results">'+esc(t('找不到符合的項目'))+'</div>';results.hidden=false;field.setAttribute('aria-expanded','true')}
function openSearchResult(type,id){hideSearchResults();$('#globalSearch').value='';const item=type==='task'?state.tasks.find(value=>value.id===id):type==='event'?state.events.find(value=>value.id===id):type==='deadline'?(state.deadlines||[]).find(value=>value.id===id):type==='goal'?state.goals.find(value=>value.id===id):(state.habits||[]).find(value=>value.id===id);if(!item)return;if(type==='task'){openModal('task',id);return}if(type==='event'){selectedDate=item.date||toLocalISODate();render();openModal('event',id);return}if(type==='goal'){document.querySelector(`[data-goal="${CSS.escape(id)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});openModal('goal',id);return}const selector=type==='deadline'?'#deadlineList .deadline-card':'#habitsList .habit-card',card=$$ (selector).find(node=>node.dataset[type==='deadline'?'deadline':'habit']===id);if(card){card.classList.add('search-hit');card.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>card.classList.remove('search-hit'),1800)}}
function suggestedHabitGoalTarget(goalId){const goal=state.goals.find(item=>item.id===goalId);if(!goal)return 30;const text=[goal.title,goal.description,...(goal.milestones||[]).map(item=>item.title)].join(' '),numbers=[...text.matchAll(/\d+/g)].map(match=>Number(match[0])).filter(value=>value>=10&&value<=10000);return numbers.length?Math.max(...numbers):30}
function openHabitModal(id=null){const item=id?state.habits.find(habit=>habit.id===id):null,t=value=>window.dayformTranslate?.(value)||value;$('#habitForm').reset();$('#habitForm').dataset.id=item?.id||'';$('#habitModalTitle').textContent=t(item?'編輯習慣':'新增習慣');$('#habitTitle').value=item?.title||'';$('#habitFrequency').value=item?.frequency||'daily';$('#habitWeeklyTarget').value=item?.target||3;$('#habitGoalId').innerHTML='<option value="">'+esc(t('不連結'))+'</option>'+state.goals.map(goal=>`<option value="${esc(goal.id)}">${esc(goal.title)}</option>`).join('');$('#habitGoalId').value=item?.goalId||'';$('#habitGoalTarget').value=item?.goalTarget||suggestedHabitGoalTarget(item?.goalId||'');$('#habitDelete').hidden=!item;$('#habitBackdrop').hidden=false;updateHabitFormFields();$('#habitTitle').focus()}
function updateHabitFormFields(){const weekly=$('#habitFrequency').value==='weekly',hasGoal=Boolean($('#habitGoalId').value);$('#habitWeeklyTargetField').hidden=!weekly;$('#habitWeeklyTarget').disabled=!weekly;$('#habitWeeklyTarget').required=weekly;$('#habitGoalTargetField').hidden=!hasGoal;$('#habitGoalTarget').disabled=!hasGoal;$('#habitGoalTarget').required=hasGoal;if(hasGoal&&!$('#habitGoalTarget').value)$('#habitGoalTarget').value=suggestedHabitGoalTarget($('#habitGoalId').value)}
function closeHabitModal(){$('#habitBackdrop').hidden=true}
function saveHabit(data,id){const existing=id?state.habits.find(habit=>habit.id===id):null,oldGoal=existing?state.goals.find(goal=>goal.id===existing.goalId):null,oldProgress=oldGoal?pct(oldGoal):null,newGoal=state.goals.find(goal=>goal.id===data.goalId),newGoalId=newGoal?.id||null;if(oldGoal&&oldGoal.id!==newGoalId&&!state.habits.some(habit=>habit.id!==id&&habit.goalId===oldGoal.id)){oldGoal.manual=oldProgress;delete oldGoal.habitBase}if(newGoal&&oldGoal?.id!==newGoal.id&&!state.habits.some(habit=>habit.id!==id&&habit.goalId===newGoal.id)){newGoal.habitBase=pct(newGoal);newGoal.manual=null}const habit={id:id||crypto.randomUUID(),title:data.title.trim(),frequency:data.frequency,target:data.frequency==='weekly'?Math.max(1,Math.min(7,Number(data.target)||1)):1,checkIns:existing?.checkIns||[],goalId:newGoalId,goalTarget:newGoalId?Math.max(1,Number(data.goalTarget)||30):0};if(existing)state.habits=state.habits.map(value=>value.id===id?habit:value);else state.habits.push(habit)}
function toggleHabitCheckin(id){const habit=state.habits.find(item=>item.id===id);if(!habit)return;const today=toLocalISODate(),index=(habit.checkIns||[]).indexOf(today);habit.checkIns=habit.checkIns||[];if(index>=0)habit.checkIns.splice(index,1);else habit.checkIns.push(today);render();toast(index>=0?'撤銷今日打卡':'已打卡')}
function deleteHabit(id){const index=state.habits.findIndex(item=>item.id===id);if(index<0)return;const habit=state.habits[index],goal=state.goals.find(item=>item.id===habit.goalId),goalState=goal?{manual:goal.manual,habitBase:goal.habitBase,progress:pct(goal)}:null;state.habits.splice(index,1);if(goalState&&!state.habits.some(item=>item.goalId===goal.id)){goal.manual=goalState.progress;delete goal.habitBase}closeHabitModal();render();toast('習慣已刪除',false,()=>{state.habits.splice(Math.min(index,state.habits.length),0,habit);if(goal){goal.manual=goalState.manual;if(goalState.habitBase===undefined)delete goal.habitBase;else goal.habitBase=goalState.habitBase}render();toast('已復原')})}
function render(){renderDate();renderCategories();renderStats();renderTimeline();renderTasks();renderGoals();renderWeeklyReview();renderDeadlines();renderHabits();renderSearch();$$('.category-filter').forEach(b=>b.classList.toggle('selected',b.dataset.filter===categoryFilter));save()}
function toggleTask(id){const task=state.tasks.find(t=>t.id===id);if(!task)return;task.done=!task.done;if(task.done&&task.goalId){const goal=state.goals.find(g=>g.id===task.goalId);if(goal){const milestone=goal.milestones.find(m=>!m.done);if(milestone){milestone.done=true;goal.manual=null;toast(`任務完成！「${milestone.title}」里程碑已更新。`)}else toast('任務已完成，做得好！')}else toast('任務已完成，做得好！')}else toast(task.done?'任務已完成，做得好！':'已將任務移回待辦');render()}
function field(label,name,value='',type='text',options=null,full=false,placeholder='',required=false){let input,req=required?' required':'';if(options){input='<select id="'+name+'" name="'+name+'"'+req+'>'+options.map(o=>'<option value="'+esc(o.value)+'" '+(String(value)===String(o.value)?'selected':'')+'>'+esc(o.label)+'</option>').join('')+'</select>'}else if(type==='textarea'){input='<textarea id="'+name+'" name="'+name+'" placeholder="'+esc(placeholder)+'"'+req+'>'+esc(value)+'</textarea>'}else input='<input id="'+name+'" name="'+name+'" type="'+type+'" value="'+esc(value)+'" placeholder="'+esc(placeholder)+'" '+(type==='number'?'min="0" max="100"':'')+req+'>';return '<div class="form-field '+(full?'full':'')+'"><label for="'+name+'">'+label+'</label>'+input+'</div>'}
function openModal(type,id=null){modalType=type;editingId=id;const item=id?(type==='task'?state.tasks.find(x=>x.id===id):type==='event'?state.events.find(x=>x.id===id):state.goals.find(x=>x.id===id)):null;$('#modalBackdrop').hidden=false;$('#formFields').innerHTML='';$('#entryForm').dataset.type=type;$('#entryForm').dataset.id=id||'';const isEdit=!!item;$('#modalTitle').textContent=(isEdit?'編輯':'新增')+({task:'任務',event:'行程',goal:'年度目標'}[type]);$('#modalKicker').textContent=({task:'STAY ON TRACK',event:'MAKE ROOM FOR IT',goal:'THINK LONG TERM'}[type]);const catOptions=[{value:'生活',label:'生活'},{value:'工作',label:'工作'},{value:'學習',label:'學習'},...state.customCategories.map(c=>({value:c,label:c}))];let html='<div class="field-grid">';if(type==='task'){html+=field('任務名稱','title',item?.title||'','text',null,true,'例如：準備週會簡報',true);html+=field('分類','category',item?.category||'工作','',catOptions);html+=field('到期時間','due',item?.due||'17:00','time');html+=field('優先級','priority',item?.priority||'normal','',[{value:'normal',label:'一般'},{value:'high',label:'重要'}]);html+=field('連結年度目標','goalId',item?.goalId||'','',[{value:'',label:'不連結'},...state.goals.map(g=>({value:g.id,label:g.title}))],true)}else if(type==='event'){html+=field('行程名稱','title',item?.title||'','text',null,true,'例如：專案討論會',true);html+=field('分類','category',item?.category||'工作','',catOptions);html+=field('日期','date',item?.date||selectedDate,'date');html+=field('開始時間','time',item?.time||'10:00','time');html+=field('結束時間','end',item?.end||'11:00','time');html+=field('地點／備註','place',item?.place||'','text',null,true,'例如：會議室 A')}else{html+=field('目標名稱','title',item?.title||'','text',null,true,'例如：完成個人作品集',true);html+=field('分類','category',item?.category||'生活','',catOptions);html+=field('目標期限','deadline',item?.deadline||'2026-12-31','date');html+=field('手動完成度（可留空）','manual',item?.manual??'','number',null,false,'0–100');html+=field('目標說明','description',item?.description||'','text',null,true,'說說這個目標對你的意義');html+='<div class="form-field full"><label for="milestones">里程碑（每行一個，前面加 ✓ 表示已完成）</label><textarea id="milestones" name="milestones" placeholder="✓ 完成初步研究\n完成第一版草稿\n提交最終成果">'+esc(item?.milestones.map(m=>(m.done?'✓ ':'')+m.title).join('\n')||'')+'</textarea></div>'}html+='</div>';$('#formFields').innerHTML=html;$('#modalBackdrop').querySelector('.modal-actions').innerHTML=`${isEdit?'<button type="button" class="cancel-button delete-entry" id="deleteEntry">刪除</button>':''}<button type="button" class="cancel-button" id="modalCancel">取消</button><button class="submit-button" type="submit">儲存</button>`;$('#modalCancel').onclick=closeModal;const del=$('#deleteEntry');if(del)del.onclick=()=>deleteEntry(type,id);if(type==='event'&&item?.recurring){const occurrence=document.createElement('button');occurrence.type='button';occurrence.className='cancel-button';occurrence.textContent=window.dayformTranslate?.(item.cancelled?'恢復本堂':'本次停課')||(item.cancelled?'恢復本堂':'本次停課');occurrence.onclick=()=>toggleCourseOccurrence(id);$('#modalBackdrop').querySelector('.modal-actions').prepend(occurrence)}setTimeout(()=>$('#formFields input')?.focus(),50)}
function closeModal(){$('#modalBackdrop').hidden=true;modalType=null;editingId=null}
function closeCategoryModal(){$('#categoryBackdrop').hidden=true}
function deleteEntry(type,id){const collection=type==='task'?'tasks':type==='event'?'events':type==='deadline'?'deadlines':'goals',items=state[collection]||[],index=items.findIndex(item=>item.id===id);if(index<0)return;const item=items.splice(index,1)[0],goalLinks=type==='goal'?state.tasks.filter(task=>task.goalId===id).map(task=>[task.id,task.goalId]):[];if(type==='goal')state.tasks.forEach(task=>{if(task.goalId===id)task.goalId=null});closeModal();render();toast('項目已刪除',false,()=>{state[collection].splice(Math.min(index,state[collection].length),0,item);goalLinks.forEach(([taskId,goalId])=>{const task=state.tasks.find(entry=>entry.id===taskId);if(task)task.goalId=goalId});render();toast('已復原')})}
function closeDeadlineModal(){$('#deadlineBackdrop').hidden=true}
$('#addCategory').addEventListener('click',()=>{$('#categoryForm').reset();$('#categoryBackdrop').hidden=false;$('#categoryName').focus()});
$('#categoryClose').addEventListener('click',closeCategoryModal);$('#categoryCancel').addEventListener('click',closeCategoryModal);$('#categoryBackdrop').addEventListener('click',event=>{if(event.target===$('#categoryBackdrop'))closeCategoryModal()});
$('#categoryForm').addEventListener('submit',event=>{event.preventDefault();const name=$('#categoryName').value.trim();if(!name){toast('請輸入分類名稱',true);$('#categoryName').focus();return}if(name.length>12){toast('分類名稱最多 12 個字',true);$('#categoryName').focus();return}if(['生活','工作','學習'].includes(name)||state.customCategories.includes(name)){toast('這個分類已存在。',true);$('#categoryName').focus();return}state.customCategories.push(name);categoryFilter=name;closeCategoryModal();render();toast('已新增分類')});
$('#addHabit').addEventListener('click',()=>openHabitModal());
$('#habitClose').addEventListener('click',closeHabitModal);$('#habitCancel').addEventListener('click',closeHabitModal);$('#habitBackdrop').addEventListener('click',event=>{if(event.target===$('#habitBackdrop'))closeHabitModal()});
$('#habitFrequency').addEventListener('change',updateHabitFormFields);$('#habitGoalId').addEventListener('change',()=>{$('#habitGoalTarget').value=$('#habitGoalId').value?suggestedHabitGoalTarget($('#habitGoalId').value):30;updateHabitFormFields()});
$('#habitDelete').addEventListener('click',()=>deleteHabit($('#habitForm').dataset.id));
$('#habitForm').addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget,data=Object.fromEntries(new FormData(form).entries()),id=form.dataset.id;if(!String(data.title||'').trim()){toast('請輸入習慣名稱',true);$('#habitTitle').focus();return}saveHabit(data,id);closeHabitModal();render();toast(id?'習慣已更新':'習慣已新增')});
$('#habitsList').addEventListener('click',event=>{const check=event.target.closest('[data-check-habit]'),edit=event.target.closest('[data-edit-habit]');if(check)toggleHabitCheckin(check.dataset.checkHabit);else if(edit)openHabitModal(edit.dataset.editHabit)});
$('#globalSearch').addEventListener('input',renderSearch);$('#globalSearch').addEventListener('keydown',event=>{if(event.key==='Escape')hideSearchResults();if(event.key==='Enter'&&!$('#searchResults').hidden){const first=$('#searchResults').querySelector('[data-search-type]');if(first){event.preventDefault();first.click()}}});
$('#searchResults').addEventListener('click',event=>{const result=event.target.closest('[data-search-type]');if(result)openSearchResult(result.dataset.searchType,result.dataset.searchId)});
document.addEventListener('click',event=>{if(!event.target.closest('.global-search'))hideSearchResults()});$('#addDeadline').addEventListener('click',()=>{$('#deadlineForm').reset();$('#deadlineDate').value=toLocalISODate();$('#deadlineBackdrop').hidden=false;$('#deadlineTitle').focus()});
$('#deadlineClose').addEventListener('click',closeDeadlineModal);
$('#deadlineCancel').addEventListener('click',closeDeadlineModal);
$('#deadlineBackdrop').addEventListener('click',e=>{if(e.target===$('#deadlineBackdrop'))closeDeadlineModal()});
$('#deadlineForm').addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget,data=Object.fromEntries(new FormData(form).entries()),title=String(data.title||'').trim();if(!title){toast('請輸入截止項目名稱',true);$('#deadlineTitle').focus();return}state.deadlines=state.deadlines||[];state.deadlines.push({id:crypto.randomUUID(),title,date:data.date,type:data.type,description:(data.description||'').trim(),done:false});closeDeadlineModal();render();toast('截止日已新增')});
$('#entryForm').addEventListener('submit',e=>{e.preventDefault();const type=e.currentTarget.dataset.type,id=e.currentTarget.dataset.id,form=new FormData(e.currentTarget),data=Object.fromEntries(form.entries());if(!String(data.title||'').trim()){toast('請輸入項目名稱',true);return}if(type==='event'){const toMinutes=value=>/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value||'')?Number(value.slice(0,2))*60+Number(value.slice(3,5)):null;const start=toMinutes(data.time),end=toMinutes(data.end);if(!data.date||start===null||end===null){toast('請輸入日期與完整時間',true);return}if(end<=start){toast('結束時間必須晚於開始時間',true);return}const conflict=state.events.find(existing=>{if(existing.id===id||existing.cancelled||(existing.date||todayISO)!==data.date)return false;const otherStart=toMinutes(existing.time),rawEnd=toMinutes(existing.end);if(otherStart===null)return false;const otherEnd=rawEnd===null?otherStart+60:rawEnd<=otherStart?rawEnd+1440:rawEnd;return start<otherEnd&&end>otherStart});if(conflict){toast('該時段與既有行程重疊',true);return}}if(type==='task'){const item={id:id||crypto.randomUUID(),title:data.title.trim(),category:data.category,due:data.due,priority:data.priority,done:id?state.tasks.find(t=>t.id===id).done:false,goalId:data.goalId||null};if(id)state.tasks=state.tasks.map(x=>x.id===id?item:x);else state.tasks.push(item)}else if(type==='event'){const existing=id?state.events.find(x=>x.id===id):null;const item={id:id||crypto.randomUUID(),title:data.title.trim(),category:data.category,time:data.time,end:data.end,place:data.place,date:data.date,recurring:!!existing?.recurring,courseKey:existing?.courseKey||null,cancelled:!!existing?.cancelled};if(id)state.events=state.events.map(x=>x.id===id?item:x);else state.events.push(item)}else{const milestones=(data.milestones||'').split('\n').map(s=>s.trim()).filter(Boolean).map((line,i)=>({title:line.replace(/^✓\s*/,''),done:line.startsWith('✓'),weight:Math.floor(100/Math.max(1,(data.milestones||'').split('\n').filter(x=>x.trim()).length))}));const item={id:id||crypto.randomUUID(),title:data.title.trim(),category:data.category,deadline:data.deadline,description:data.description,emoji:id?state.goals.find(g=>g.id===id).emoji:'✦',manual:data.manual===''?null:Number(data.manual),habitBase:id&&data.manual===''?state.goals.find(g=>g.id===id).habitBase:null,milestones};if(id)state.goals=state.goals.map(x=>x.id===id?item:x);else state.goals.push(item)}closeModal();render();toast(id?'已更新':'已新增')});
function openSettings(){$('#settingsBackdrop').hidden=false;updatePermission();$('#eventReminder').checked=state.settings.eventReminder;$('#taskReminder').checked=state.settings.taskReminder;$('#reminderMinutes').value=state.settings.reminderMinutes}
function updatePermission(){const supported='Notification'in window;$('#permissionText').textContent=!supported?'此瀏覽器不支援通知':Notification.permission==='granted'?'通知已啟用，可以收到頁面開啟時的提醒。':Notification.permission==='denied'?'通知權限已封鎖，請至瀏覽器設定中允許。':'開啟提醒，別錯過重要行程。';$('#permissionButton').textContent=Notification.permission==='granted'?'通知已啟用':'啟用通知權限';$('#permissionButton').disabled=!supported||Notification.permission==='granted'}
function scheduleNotifications(){notificationTimers.forEach(clearTimeout);notificationTimers=[];if(!('Notification'in window)||Notification.permission!=='granted')return;const now=new Date();if(state.settings.eventReminder){state.events.filter(event=>!event.cancelled).forEach(event=>{const [h,m]=event.time.split(':').map(Number);const target=new Date((event.date||todayISO)+'T'+event.time+':00');target.setMinutes(target.getMinutes()-Number(state.settings.reminderMinutes));const delay=target-now;if(delay>0&&delay<86400000)notificationTimers.push(setTimeout(()=>new Notification('行程即將開始',{body:`${event.title} · ${event.time}`} ),delay))})}if(state.settings.taskReminder){state.tasks.filter(t=>!t.done).forEach(task=>{const [h,m]=task.due.split(':').map(Number);const target=new Date();target.setHours(h,m,0,0);const delay=target-now;if(delay>0&&delay<86400000)notificationTimers.push(setTimeout(()=>new Notification('任務到期提醒',{body:task.title}),delay))})}}
$('#permissionButton').addEventListener('click',async()=>{if(!('Notification'in window)){toast('此瀏覽器不支援通知',true);return}try{await Notification.requestPermission();updatePermission();scheduleNotifications();toast(Notification.permission==='granted'?'通知已啟用':'尚未允許通知')}catch{toast('無法取得通知權限',true)}});
$('#themeSelect').addEventListener('change',e=>{
 themePreference=e.target.value;
 try{localStorage.setItem('dayform-theme',themePreference)}catch{}
 applyTheme();
});
$('#eventReminder').addEventListener('change',e=>{state.settings.eventReminder=e.target.checked;save();scheduleNotifications()});$('#taskReminder').addEventListener('change',e=>{state.settings.taskReminder=e.target.checked;save();scheduleNotifications()});$('#reminderMinutes').addEventListener('change',e=>{state.settings.reminderMinutes=Number(e.target.value);save();scheduleNotifications()});
$('#notificationBell').onclick=openSettings;$('#settingsClose').onclick=()=>$('#settingsBackdrop').hidden=true;$('#settingsBackdrop').addEventListener('click',e=>{if(e.target===$('#settingsBackdrop'))$('#settingsBackdrop').hidden=true});$('#modalClose').onclick=closeModal;$('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal()});$('#addTaskTop').onclick=$('#addTaskBottom').onclick=()=>openModal('task');$('#addEventTop').onclick=()=>openModal('event');$('#addGoalBtn').onclick=()=>openModal('goal');
$$('.task-tab').forEach(tab=>tab.addEventListener('click',()=>{taskTab=tab.dataset.taskTab;$$('.task-tab').forEach(x=>x.classList.toggle('active',x===tab));renderTasks()}));$('.category-list').addEventListener('click',event=>{const remove=event.target.closest('[data-delete-category]');if(remove){deleteCustomCategory(remove.dataset.deleteCategory);return}const button=event.target.closest('.category-filter');if(!button)return;categoryFilter=button.dataset.filter;renderTasks();$$('.category-filter').forEach(item=>item.classList.toggle('selected',item===button))});$('#taskFilterBtn').onclick=()=>{categoryFilter=categoryFilter==='all'?'工作':'all';renderTasks();$$('.category-filter').forEach(x=>x.classList.toggle('selected',x.dataset.filter===categoryFilter));toast(categoryFilter==='all'?'已顯示全部分類':'已篩選工作任務')};
$('#prevDay').onclick=()=>{const d=new Date(`${selectedDate}T12:00:00`);d.setDate(d.getDate()-1);selectedDate=toLocalISODate(d);render()};$('#nextDay').onclick=()=>{const d=new Date(`${selectedDate}T12:00:00`);d.setDate(d.getDate()+1);selectedDate=toLocalISODate(d);render()};$('#viewCalendar').onclick=()=>$('#weeklyReview').scrollIntoView({behavior:'smooth',block:'start'});$('#allGoalsBtn').onclick=()=>toast('目前顯示你的年度目標');$('#profileBtn').onclick=()=>toast('個人工作區設定正在規劃中');
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeHabitModal();$('#settingsBackdrop').hidden=true;hideSearchResults()}if(e.key.toLowerCase()==='n'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&$('#modalBackdrop').hidden){e.preventDefault();openModal('task')}});
window.addEventListener('dayform-language-changed',()=>{renderGreeting();render();applyTheme()});
renderGreeting();applyTheme();render();scheduleNotifications();
let timelineDate = toLocalISODate();
setInterval(() => {
 applyTheme();
 const currentDate = toLocalISODate();
 renderGreeting();
 if (currentDate !== timelineDate) {
  const wasViewingToday = selectedDate === timelineDate;
  timelineDate = currentDate;
  if (wasViewingToday) selectedDate = currentDate;
  render();
  scheduleNotifications();
 } else {
  renderTimeline();
 }
}, 60000);
const SCHOOL_CSV_URL = '../Downloads/課表_1151.csv';
const TW_HOLIDAYS_2026 = new Set(['2026-01-01','2026-02-16','2026-02-17','2026-02-18','2026-02-19','2026-02-20','2026-02-27','2026-04-03','2026-04-06','2026-05-01','2026-06-19','2026-09-25','2026-09-28','2026-10-09','2026-10-26']);
const TW_HOLIDAYS_2027 = new Set(['2027-01-01','2027-02-05','2027-02-08','2027-02-09','2027-02-10','2027-02-11','2027-02-12','2027-02-26','2027-04-05','2027-04-06','2027-04-30','2027-06-09','2027-09-15','2027-09-24','2027-09-27','2027-10-10']);
function isNationalHoliday(iso){const year=Number(iso.slice(0,4));return (year===2026?TW_HOLIDAYS_2026:year===2027?TW_HOLIDAYS_2027:new Set()).has(iso)}
let importedCourses = [];
const weekdayMap={'週日':0,'週天':0,'星期日':0,'星期天':0,'周日':0,'周天':0,'日':0,'天':0,'sun':0,'sunday':0,'0':0,'7':0,'週一':1,'星期一':1,'周一':1,'一':1,'mon':1,'monday':1,'1':1,'週二':2,'星期二':2,'周二':2,'二':2,'tue':2,'tues':2,'tuesday':2,'2':2,'週三':3,'星期三':3,'周三':3,'三':3,'wed':3,'wednesday':3,'3':3,'週四':4,'星期四':4,'周四':4,'四':4,'thu':4,'thur':4,'thurs':4,'thursday':4,'4':4,'週五':5,'星期五':5,'周五':5,'五':5,'fri':5,'friday':5,'5':5,'週六':6,'星期六':6,'周六':6,'六':6,'sat':6,'saturday':6};
function parseScheduleCsv(text) {
 const rows=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/).map(line=>{const out=[];let cell='',quoted=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quoted&&line[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(ch===','&&!quoted){out.push(cell.trim());cell=''}else cell+=ch}out.push(cell.trim());return out});
 if(rows.length<2)throw new Error('CSV 中沒有課程資料');
 const headers=rows.shift().map(x=>x.replace(/^\uFEFF/,'').trim()),col=name=>headers.indexOf(name);
 for(const name of ['星期','時間','課程名稱'])if(col(name)<0)throw new Error('缺少必要欄位：'+name);
 return rows.filter(r=>r.some(Boolean)).map((r,i)=>{
  const day=(r[col('星期')]||'').trim(),weekday=weekdayMap[day.toLowerCase().replace(/\s+/g,'')];
  const times=(r[col('時間')]||'').match(/(\d{1,2}:\d{2})\s*[-–~至]\s*(\d{1,2}:\d{2})/),title=(r[col('課程名稱')]||'').trim();
  if(!Number.isInteger(weekday)||!times||!title)throw new Error('第 '+(i+2)+' 列的星期、時間或課程名稱格式有誤');
  if(times[2]<=times[1])throw new Error('第 '+(i+2)+' 列的結束時間必須晚於開始時間');
  return {day,weekday,period:r[col('節次')]||'',time:times[1].padStart(5,'0'),end:times[2].padStart(5,'0'),title,teacher:r[col('授課教師')]||'',place:r[col('教室')]||''};
 });
}
function showImportModal(courses){importedCourses=courses.map(c=>({...c,courseKey:`${c.weekday}-${c.time}-${c.title}`}));$('#importPreviewCount').textContent=`課程預覽 · ${courses.length} 堂`;$('#importPreview').innerHTML=courses.map(c=>`<article class="import-course"><span class="import-day">${esc(c.day)}</span><div class="import-course-main"><b>${esc(c.title)}</b><small>${esc(c.teacher)}${c.teacher&&c.place?' · ':''}${esc(c.place)}${c.period?' · 第 '+esc(c.period)+' 節':''}</small></div><span class="import-course-time">${esc(c.time)}<br>${esc(c.end)}</span></article>`).join('');const form=$('#scheduleImportForm');form.dataset.conflictsConfirmed='';$('#importConflictNotice').hidden=true;$('#importConflictNotice').innerHTML='';$('#importSubmit').textContent=window.dayformTranslate?.('匯入課程行程')||'匯入課程行程';const start=form.elements.termStart,end=form.elements.termEnd;if(!start.value)start.value='2026-09-14';if(!end.value)end.value='2027-01-15';$('#scheduleImportBackdrop').hidden=false;}
function importScheduleFile(file){
 if(!file)return;
 const reader=new FileReader();
 reader.onload=()=>{
  try{let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(reader.result)}catch{text=new TextDecoder('big5').decode(reader.result)}showImportModal(parseScheduleCsv(text))}
  catch(err){toast(err.message||'課表讀取失敗，請檢查 CSV 格式',true)}
 };
 reader.onerror=()=>toast('無法讀取選取的檔案',true);
 reader.readAsArrayBuffer(file);
}
function closeImportModal(){$('#scheduleImportBackdrop').hidden=true}
$('#importScheduleBtn').addEventListener('click',()=>$('#scheduleFileInput').click());
$('#downloadScheduleTemplate').addEventListener('click',event=>{
 event.preventDefault();
 const content='\uFEFF星期,時間,課程名稱,授課教師,教室,節次\r\n週一,09:00-10:50,統計學,,,1\r\n';
 const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='課表範本.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('#scheduleFileInput').addEventListener('change',e=>{importScheduleFile(e.target.files[0]);e.target.value=''});
$('#importClose').addEventListener('click',closeImportModal);$('#importCancel').addEventListener('click',closeImportModal);$('#scheduleImportBackdrop').addEventListener('click',e=>{if(e.target===$('#scheduleImportBackdrop'))closeImportModal()});
function findImportConflicts(generated,retained){
 const overlaps=(a,b)=>{if(b.cancelled||(b.date||todayISO)!==a.date)return false;const first=eventBounds(a),second=eventBounds(b);return Boolean(first&&second&&first.start<second.end&&first.end>second.start)};
 const conflicts=[],seen=[];
 generated.forEach(course=>{retained.forEach(event=>{if(overlaps(course,event))conflicts.push({course,event})});seen.forEach(event=>{if(overlaps(course,event))conflicts.push({course,event})});seen.push(course)});
 return conflicts;
}
$('#scheduleImportForm').addEventListener('change',()=>{
 const form=$('#scheduleImportForm');form.dataset.conflictsConfirmed='';
 $('#importConflictNotice').hidden=true;$('#importSubmit').textContent=window.dayformTranslate?.('匯入課程行程')||'匯入課程行程';
});
$('#scheduleImportForm').addEventListener('submit',e=>{
 e.preventDefault();
 const form=e.currentTarget,start=form.elements.termStart.value,end=form.elements.termEnd.value,skip=$('#skipHolidays').checked;
 if(start>end){toast('學期結束日期需晚於開始日期',true);return}
 const generated=[],cursor=new Date(start+'T12:00:00'),last=new Date(end+'T12:00:00');
 while(cursor<=last){
  const iso=toLocalISODate(cursor);
  if(!(skip&&isNationalHoliday(iso))){const wd=cursor.getDay();for(const course of importedCourses)if(course.weekday===wd)generated.push({id:crypto.randomUUID(),title:course.title,time:course.time,end:course.end,place:[course.place,course.teacher].filter(Boolean).join(' · '),category:'學習',date:iso,recurring:true,courseKey:course.courseKey})}
  cursor.setDate(cursor.getDate()+1);
 }
 const keys=new Set(generated.map(event=>event.date+'|'+event.courseKey));
 const retained=state.events.filter(event=>!event.recurring||!keys.has(event.date+'|'+event.courseKey));
 const conflicts=findImportConflicts(generated,retained),notice=$('#importConflictNotice');
 if(conflicts.length&&!form.dataset.conflictsConfirmed){
  const t=value=>window.dayformTranslate?.(value)||value;
  notice.innerHTML='<b>'+esc(t('匯入時段有衝突'))+'</b><ul>'+conflicts.slice(0,8).map(item=>'<li>'+esc(item.course.date+' '+item.course.time+'–'+item.course.end+' '+item.course.title+' ↔ '+item.event.title+' '+item.event.time+'–'+item.event.end)+'</li>').join('')+'</ul>';
  if(conflicts.length>8)notice.innerHTML+='<small>'+esc(t('其餘衝突也會一併匯入'))+'</small>';
  notice.hidden=false;form.dataset.conflictsConfirmed='true';$('#importSubmit').textContent=t('確認仍要匯入');return;
 }
 const cancelled=new Set(state.events.filter(event=>event.recurring&&event.cancelled).map(event=>event.date+'|'+event.courseKey));
 generated.forEach(event=>{if(cancelled.has(event.date+'|'+event.courseKey))event.cancelled=true});
 const updating=(state.terms||[]).some(term=>term.start===start&&term.end===end)||state.events.some(event=>event.recurring&&event.date>=start&&event.date<=end);
 state.events=retained.concat(generated);
 state.terms=(state.terms||[]).filter(term=>term.start!==start||term.end!==end);
 state.terms.push({id:crypto.randomUUID(),start,end,skipHolidays:skip,courses:importedCourses.length});
 closeImportModal();render();
 toast(updating?'已更新 '+generated.length+' 個課程行程':'已匯入 '+importedCourses.length+' 門課，共建立 '+generated.length+' 個課程行程');
});







