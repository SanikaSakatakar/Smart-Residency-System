// SmartRes — Shared Utilities
const API = 'http://localhost:8081/api';

// ── Auth ────────────────────────────────────────────
function getToken(){ return localStorage.getItem('srToken'); }
function getUser(){ try{ return JSON.parse(localStorage.getItem('srUser')); }catch{ return null; } }

function checkAuth(allowed) {
  const t = getToken(), u = getUser();
  if (!t || !u) { window.location.href = '../index.html'; return null; }
  const roles = Array.isArray(allowed) ? allowed : [allowed];
  if (allowed && !roles.includes(u.role)) { window.location.href = '../index.html'; return null; }
  return u;
}
function logout(){ localStorage.clear(); window.location.href = '../index.html'; }

// ── API helpers ─────────────────────────────────────
async function apiFetch(method, path, body) {
  const opts = { method, headers: { 'Content-Type':'application/json', Authorization:`Bearer ${getToken()}` } };
  if (body !== undefined) opts.body = JSON.stringify(body);

  let r;
  try {
    r = await fetch(API + path, opts);
  } catch(e) {
    throw new Error('Cannot reach server — is the backend running on port 8081?');
  }

  if (r.status === 401) { logout(); return; }
  if (r.status === 403) throw new Error('Access denied — you do not have permission for this action');
  if (r.status === 404) throw new Error(`Endpoint not found: ${method} ${path} — backend may need to be rebuilt`);

  if (!r.ok) {
    let msg = `Server error (${r.status})`;
    try {
      const ct = r.headers.get('content-type')||'';
      const d = ct.includes('json') ? await r.json() : await r.text();
      msg = (typeof d==='object' && d.message) ? d.message : (typeof d==='string' && d.length < 300 ? d : msg);
    } catch(e) {}
    throw new Error(msg);
  }

  // 2xx — stream as text first, then parse (handles huge/partial JSON better)
  try {
    const text = await r.text();
    if (!text || text.trim() === '') return null;
    try {
      return JSON.parse(text);
    } catch(e) {
      // JSON parse failed — try to recover partial data
      console.warn(`JSON parse failed for ${path}:`, e.message);
      // If it looks like an array response that got truncated, return empty
      return null;
    }
  } catch(e) {
    return null;
  }
}
const get   = p      => apiFetch('GET', p);
const post  = (p,b)  => apiFetch('POST', p, b);
const put   = (p,b)  => apiFetch('PUT', p, b);
const patch = (p,b)  => apiFetch('PATCH', p, b);
const del   = p      => apiFetch('DELETE', p);

// ── Toasts ──────────────────────────────────────────
function ensureToastContainer(){
  if (!document.getElementById('toastWrap')){
    const d=document.createElement('div'); d.id='toastWrap'; d.className='toast-wrap';
    document.body.appendChild(d);
  }
}
function toast(title, msg='', type='info', ms=4500){
  ensureToastContainer();
  const icons={success:'✓',error:'✕',warn:'!',info:'i'};
  const el=document.createElement('div'); el.className='toast';
  el.innerHTML=`<div class="toast-ic ${type[0]}">${icons[type]||'i'}</div>
    <div style="flex:1"><div class="toast-title">${title}</div>${msg?`<div class="toast-msg">${msg}</div>`:''}</div>
    <button class="toast-x" onclick="this.closest('.toast').remove()">✕</button>`;
  document.getElementById('toastWrap').appendChild(el);
  setTimeout(()=>{ el.style.transition='opacity .3s,transform .3s'; el.style.opacity='0'; el.style.transform='translateX(12px)'; setTimeout(()=>el.remove(),300); }, ms);
}

// ── Modals ──────────────────────────────────────────
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }

// ── Formatters ──────────────────────────────────────
function fmt$( n ){ return '₹'+(+n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function fmtDate(d){ if(!d) return '—'; return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
function fmtDT(d){ if(!d) return '—'; return new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:true}); }
function fmtRel(d){
  if(!d) return '—';
  const s=Math.floor((Date.now()-new Date(d))/1000);
  if(s<60) return 'just now'; if(s<3600) return Math.floor(s/60)+'m ago';
  if(s<86400) return Math.floor(s/3600)+'h ago';
  return fmtDate(d);
}

// ── Badges ──────────────────────────────────────────
const BADGE_MAP={
  PAID:'bg-success',ACTIVE:'bg-success',APPROVED:'bg-success',RESOLVED:'bg-success',
  COMPLETED:'bg-success',INSIDE:'bg-success',OCCUPIED:'bg-success',
  PENDING:'bg-warning',IN_PROGRESS:'bg-warning',PARTIAL:'bg-warning',ASSIGNED:'bg-info',
  OVERDUE:'bg-danger',DENIED:'bg-danger',EXPIRED:'bg-danger',CRITICAL:'bg-danger',HIGH:'bg-danger',
  OPEN:'bg-info',EXITED:'bg-muted',
  MEDIUM:'bg-warning',LOW:'bg-muted',
  VACANT:'bg-muted',MAINTENANCE:'bg-purple',RESERVED:'bg-teal',
  ELECTRICITY:'bg-warning',WATER:'bg-info',GAS:'bg-danger',
};
function badge(s){ const c=BADGE_MAP[s]||'bg-muted'; return `<span class="badge ${c}">${s||'—'}</span>`; }

// ── Tables ──────────────────────────────────────────
function buildTable(headers, rows, empty='No data'){
  if(!rows||!rows.length) return `<div class="empty"><div class="empty-ic">📭</div><div class="empty-lbl">${empty}</div></div>`;
  return `<div class="tbl-wrap"><table>
    <thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c??'—'}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

// ── Loading ──────────────────────────────────────────
function loadingEl(){ return `<div class="loading"><div class="spin"></div> Loading…</div>`; }
function setLoading(id){ const e=document.getElementById(id); if(e) e.innerHTML=loadingEl(); }

// ── User setup ───────────────────────────────────────
function setupUser(){
  const u=getUser(); if(!u) return;
  const initials=(u.fullName||u.name||u.email||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  document.querySelectorAll('.sb-av').forEach(el=>el.textContent=initials);
  document.querySelectorAll('.sb-uname').forEach(el=>el.textContent=u.fullName||u.name||u.email);
  document.querySelectorAll('.sb-urole').forEach(el=>el.textContent=(u.role||'').replace('ROLE_','').replace(/_/g,' '));
}

// ── Clock ────────────────────────────────────────────
function startClock(){
  const el=document.getElementById('clock'); if(!el) return;
  const tick=()=>{ el.textContent=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); };
  tick(); setInterval(tick,1000);
}

// ── Sidebar page switcher ───────────────────────────
function showSection(id, btn, loaderFn){
  document.querySelectorAll('.page-sec').forEach(s=>s.classList.remove('active'));
  const sec=document.getElementById('sec-'+id);
  if(sec) sec.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const title=document.getElementById('page-title');
  if(title&&btn) title.textContent=btn.textContent.trim();
  if(loaderFn) loaderFn();
}

// ── WebSocket ─────────────────────────────────────────
let _stomp=null;
function connectWS(handler){
  if(typeof SockJS==='undefined'||typeof Stomp==='undefined') return;
  try{
    const sock=new SockJS('http://localhost:8081/api/ws');
    _stomp=Stomp.over(sock);
    _stomp.debug=null;
    _stomp.connect({Authorization:`Bearer ${getToken()}`}, ()=>{
      const u=getUser();
      _stomp.subscribe('/topic/admin/anomalies',m=>handler&&handler(JSON.parse(m.body),'anomaly'));
      _stomp.subscribe('/topic/security/alerts',m=>handler&&handler(JSON.parse(m.body),'security'));
      if(u) _stomp.subscribe(`/user/${u.email}/queue/notifications`,m=>handler&&handler(JSON.parse(m.body),'notif'));
    }, ()=>setTimeout(()=>connectWS(handler),6000));
  }catch(e){ console.warn('WS not available'); }
}
function wsHandler(data,type){
  const map={anomaly:['⚠️ Anomaly',`Flat ${data.flatId||''} — ${data.utilityType||''}`,'warn'],
    security:['🚪 Visitor Alert',`${data.visitorName||''}`,'info'],
    notif:['🔔 Notification',data.message||'','info']};
  const [t,m,tp]=map[type]||['Notification','','info'];
  toast(t,m,tp);
  const dot=document.getElementById('notif-dot'); if(dot) dot.style.display='block';
}
