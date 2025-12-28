/* Simple Application Tracker
   - Stores data in localStorage under key 'applications'
   - Supports Kanban drag/drop and a table view
   - Attachments are stored as data URLs (demo only)
*/
(function(){
  const STORAGE_KEY = 'applications_v1';
  const STATUSES = ['Saved','Applied','Interview','Offer','Rejected'];

  function qs(s,el=document){return el.querySelector(s)}
  function qsa(s,el=document){return Array.from(el.querySelectorAll(s))}

  let state = { apps: [] };

  function load(){
    try{ state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {apps:[]} }catch(e){ state={apps:[]} }
  }
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }

  function id(){ return 'a'+Math.random().toString(36).slice(2,9) }

  function render(){ renderBoard(); renderTable(); }

  function renderBoard(){
    const board = qs('#board');
    board.innerHTML = '';
    STATUSES.forEach(status=>{
      const col = document.createElement('div'); col.className='col';
      col.dataset.status = status;
      col.innerHTML = `<h3>${status}</h3><div class="dropzone" data-status="${status}"></div>`;
      const drop = col.querySelector('.dropzone');
      const list = state.apps.filter(a=>a.status===status);
      list.forEach(a=> drop.appendChild(cardNode(a)));
      addDropHandlers(drop);
      board.appendChild(col);
    })
  }

  function cardNode(a){
    const card = document.createElement('div'); card.className='card'; card.draggable=true; card.dataset.id = a.id;
    card.innerHTML = `<strong>${escapeHtml(a.title||'Untitled')}</strong><div class="meta">${escapeHtml(a.company||'')}</div>`;
    if(a.attachments && a.attachments.length){
      const att = document.createElement('div'); att.className='attachments';
      a.attachments.forEach(at=>{ const it = document.createElement('div'); it.className='attachment-item'; it.textContent = at.name; att.appendChild(it) });
      card.appendChild(att);
    }
    card.addEventListener('dragstart', e=>{ card.classList.add('dragging'); e.dataTransfer.setData('text/plain', a.id) });
    card.addEventListener('dragend', e=>{ card.classList.remove('dragging') });
    card.addEventListener('dblclick', ()=> openEdit(a.id));
    return card;
  }

  function addDropHandlers(drop){
    drop.addEventListener('dragover', e=>{ e.preventDefault(); drop.classList.add('over') });
    drop.addEventListener('dragleave', e=>{ drop.classList.remove('over') });
    drop.addEventListener('drop', e=>{
      e.preventDefault(); drop.classList.remove('over');
      const idd = e.dataTransfer.getData('text/plain');
      const app = state.apps.find(x=>x.id===idd); if(!app) return;
      app.status = drop.dataset.status; save(); render();
    })
  }

  function renderTable(){
    const tbody = qs('#apps-table tbody');
    if(!tbody) return;
    tbody.innerHTML='';
    state.apps.forEach(a=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(a.title||'')}</td><td>${escapeHtml(a.company||'')}</td><td><a href="${escapeAttr(a.link||'')}" target="_blank">link</a></td><td>${escapeHtml(a.contact||'')}</td><td>${escapeHtml(a.email||'')}</td><td>${escapeHtml(a.dateApplied||'')}</td><td>${escapeHtml(a.followUp||'')}</td><td>${escapeHtml(a.status)}</td><td><button class="small" data-id="${a.id}">Edit</button></td>`;
      tbody.appendChild(tr);
    })
    qsa('button.small', tbody).forEach(btn=>btn.addEventListener('click', e=>openEdit(e.target.dataset.id)));
  }

  function openEdit(id){
    const app = state.apps.find(x=>x.id===id);
    if(!app) return openForm();
    openForm(app);
  }

  function openForm(app){
    const modal = qs('#app-modal');
    modal.classList.remove('hidden');
    const form = qs('#app-form');
    form.reset();
    form.dataset.id = app?app.id:'';
    ['title','company','link','contact','email','dateApplied','followUp','notes'].forEach(k=>{
      const el = qs('[name="'+k+'"]', form); if(!el) return; el.value = app? (app[k]||'') : '';
    });
    qs('[name="status"]', form).value = app?app.status:'Saved';
    const attWrap = qs('#existing-attachments'); attWrap.innerHTML='';
    (app&&app.attachments||[]).forEach((at,i)=>{ const d = document.createElement('div'); d.className='attachment-item'; d.textContent = at.name; attWrap.appendChild(d) });
  }

  function closeForm(){ qs('#app-modal').classList.add('hidden'); }

  function handleFormSubmit(e){
    e.preventDefault(); const f = e.target; const idv = f.dataset.id;
    const data = {}; ['title','company','link','contact','email','dateApplied','followUp','notes'].forEach(k=>{ data[k]= qs('[name="'+k+'"]', f).value });
    data.status = qs('[name="status"]', f).value || 'Saved';
    if(idv){ const app = state.apps.find(x=>x.id===idv); Object.assign(app,data); handleAttachments(f,idv); }
    else { data.id = id(); data.attachments = []; state.apps.push(data); handleAttachments(f,data.id); }
    save(); render(); closeForm();
  }

  function handleAttachments(form, appId){
    const files = qs('[name="attachments"]', form).files; if(!files || !files.length) return;
    const app = state.apps.find(x=>x.id===appId); if(!app) return;
    Array.from(files).forEach(file=>{
      const reader = new FileReader(); reader.onload = function(ev){
        app.attachments = app.attachments||[]; app.attachments.push({name:file.name,data:ev.target.result}); save(); render();
      }; reader.readAsDataURL(file);
    })
  }

  function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
  function escapeAttr(s){ return (s||'').replace(/"/g,'&quot;') }

  // UI wiring
  function init(){
    load(); render();
    qs('#btn-add').addEventListener('click', ()=>openForm());
    qs('#modal-close').addEventListener('click', closeForm);
    qs('#app-form').addEventListener('submit', handleFormSubmit);
    qs('#view-toggle').addEventListener('click', ()=>{
      document.body.classList.toggle('show-table'); qs('#view-toggle').textContent = document.body.classList.contains('show-table')? 'Board View' :'Table View';
      qs('#board-wrap').classList.toggle('hidden'); qs('#table-wrap').classList.toggle('hidden');
    });
    // allow clicking edit from table after render
  }

  // boot
  document.addEventListener('DOMContentLoaded', init);
  window.Tracker = { state, STATUSES };
})();
