(function(){
  // Modal + draft persistence + submit spinner + append to table
  const MODAL_ID = 'app-modal';
  const FORM_ID = 'app-form';
  const DRAFT_KEY = 'jobFormDraft_v1';
  const JOBS_KEY = 'jobs_v1';
  let appsCache = [];

  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  function openModal(){
    const modal = document.getElementById(MODAL_ID);
    if(!modal) return;
    modal.classList.remove('hidden');
    const form = document.getElementById(FORM_ID);
    if(form) form.removeAttribute('data-edit-id');
    loadDraftToForm();
  }

  function closeModal(){
    const modal = document.getElementById(MODAL_ID);
    if(!modal) return;
    modal.classList.add('hidden');
  }

  function saveDraftFromForm(){
    const form = document.getElementById(FORM_ID);
    if(!form) return;
    const data = {};
    Array.from(form.elements).forEach(el=>{
      if(!el.name) return;
      if(el.type==='file') return; // skip files in draft
      if(el.type==='checkbox') data[el.name]=el.checked;
      else data[el.name]=el.value;
    });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  }

  function loadDraftToForm(){
    const raw = localStorage.getItem(DRAFT_KEY);
    if(!raw) return;
    let data;
    try{ data = JSON.parse(raw); }catch(e){ return; }
    const form = document.getElementById(FORM_ID);
    if(!form) return;
    Array.from(form.elements).forEach(el=>{
      if(!el.name) return;
      if(!(el.name in data)) return;
      try{
        if(el.type==='checkbox') el.checked = !!data[el.name];
        else el.value = data[el.name];
      }catch(e){}
    });
  }

  function appendJobToTable(obj){
    console.log('appendJobToTable called with:', obj);
    const tbody = document.querySelector('#apps-table tbody');
    if(!tbody){ console.error('Table body #apps-table tbody not found'); return; }
    // ensure table is visible (in case board/table toggle hides it)
    const tableWrap = document.getElementById('table-wrap');
    if(tableWrap && tableWrap.classList.contains('hidden')) tableWrap.classList.remove('hidden');

    // normalize status string if present
    if(obj && obj.status && typeof obj.status === 'string') obj.status = obj.status.trim();
    const tr = document.createElement('tr');
    const idAttr = obj.id ? ` data-id="${obj.id}"` : '';
    tr.setAttribute('data-id', obj.id || ('local-' + (obj._localId||Date.now())));
    tr.innerHTML = `
      <td><input type="checkbox"/></td>
      <td class="col-title">${escapeHtml(obj.title||'')}</td>
      <td class="col-company">${escapeHtml(obj.company||'')}</td>
      <td class="col-location">${escapeHtml(obj.location||'')}</td>
      <td class="col-contact">${escapeHtml(obj.contact||'')}</td>
      <td class="col-email">${escapeHtml(obj.email||'')}</td>
      <td class="col-status">${escapeHtml(obj.status||'')}</td>
      <td class="col-date">${escapeHtml(obj.dateApplied||'')}</td>
      <td class="col-notes">${escapeHtml(obj.notes||'')}</td>
      <td class="col-actions">
        <button class="edit-job control-btn">Edit</button>
        <button class="delete-job control-btn">Delete</button>
      </td>
    `;
    tbody.insertBefore(tr, tbody.firstChild);
    // keep appsCache in sync
    try{
      const matchIdx = appsCache.findIndex(a => (a.id && obj.id && String(a.id)===String(obj.id)) || (a._localId && obj._localId && String(a._localId)===String(obj._localId)));
      if(matchIdx === -1) appsCache.unshift(obj); else appsCache[matchIdx] = obj;
      refreshStatusCounters();
    }catch(e){}
  }

  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function saveJob(obj){
    const raw = localStorage.getItem(JOBS_KEY);
    let arr = [];
    try{ arr = raw?JSON.parse(raw):[]; }catch(e){ arr = []; }
    if(!obj.id){
      obj._localId = obj._localId || Date.now();
    }
    const idx = arr.findIndex(x => (x.id && obj.id && x.id==obj.id) || (x._localId && obj._localId && x._localId==obj._localId));
    if(idx>=0) arr[idx] = obj; else arr.unshift(obj);
    localStorage.setItem(JOBS_KEY, JSON.stringify(arr));
  }

  function updateRow(idOrLocal, obj){
    const tbody = document.querySelector('#apps-table tbody');
    if(!tbody) return;
    const tr = tbody.querySelector(`[data-id="${idOrLocal}"]`);
    if(!tr) return;
    tr.querySelector('.col-title').textContent = obj.title || '';
    tr.querySelector('.col-company').textContent = obj.company || '';
    const contactEl = tr.querySelector('.col-contact'); if(contactEl) contactEl.textContent = obj.contact || '';
    const emailEl = tr.querySelector('.col-email'); if(emailEl) emailEl.textContent = obj.email || '';
    tr.querySelector('.col-location').textContent = obj.location || '';
    tr.querySelector('.col-status').textContent = obj.status || '';
    tr.querySelector('.col-date').textContent = obj.dateApplied || '';
    const notesEl = tr.querySelector('.col-notes'); if(notesEl) notesEl.textContent = obj.notes || '';
    // update cache
    try{
      const idx = appsCache.findIndex(a => (a.id && obj.id && String(a.id)===String(obj.id)) || (a._localId && obj._localId && String(a._localId)===String(obj._localId)) || (String(a.id)===String(idOrLocal)) || (('local-'+String(a._localId))===String(idOrLocal)) );
      if(idx >= 0){
        appsCache[idx] = Object.assign({}, appsCache[idx], obj);
      }
      refreshStatusCounters();
    }catch(e){}
  }

  function removeRow(idOrLocal){
    const tbody = document.querySelector('#apps-table tbody');
    if(!tbody) return;
    const tr = tbody.querySelector(`[data-id="${idOrLocal}"]`);
    if(tr) tr.remove();
    try{
      appsCache = appsCache.filter(a => {
        const aid = a.id?String(a.id):null;
        const lid = a._localId?('local-'+String(a._localId)):null;
        return !( (aid && String(aid)===String(idOrLocal)) || (lid && String(lid)===String(idOrLocal)) );
      });
      refreshStatusCounters();
    }catch(e){}
  }

  function refreshStatusCounters(){
    const map = {
      'Saved': 'counter-bookmarked',
      'Applied': 'counter-applied',
      'Interview': 'counter-interviewing',
      'Offer': 'counter-negotiating',
      'Rejected': null,
      'Accepted': 'counter-accepted'
    };
    const counts = {
      'counter-bookmarked': 0,
      'counter-applying': 0,
      'counter-applied': 0,
      'counter-interviewing': 0,
      'counter-negotiating': 0,
      'counter-accepted': 0
    };
    try{
      appsCache.forEach(a=>{
        const s = (a.status||'').toString();
        const cid = map[s] || null;
        if(cid && counts.hasOwnProperty(cid)) counts[cid]++;
      });
      Object.keys(counts).forEach(k=>{
        const el = document.querySelector('#' + k + ' .count');
        if(el) el.textContent = counts[k] || '0';
      });
    }catch(e){}
  }

  function handleSubmit(e){
    e.preventDefault();
    const form = document.getElementById(FORM_ID);
    if(!form) return;
    const submitBtn = document.getElementById('form-submit');
    if(submitBtn.disabled) return;

    // collect form data (skip files)
    const data = {};
    Array.from(form.elements).forEach(el=>{ if(el.name && el.type!=='file') data[el.name]=el.type==='checkbox'?el.checked:el.value; });

    // show inline spinner inside button
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="jobs-spinner" style="display:inline-block;width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;animation:spin 0.8s linear infinite;margin-right:8px;vertical-align:middle;"></span> Saving...';

    // detect edit mode
    const editId = form.getAttribute('data-edit-id');
    const apiBase = window.__API_BASE__ || '';
    const apiUrl = apiBase ? (apiBase + '/api/apps') : '/api/apps';
    const isLocalEdit = editId && String(editId).startsWith('local-');
    const method = editId && !isLocalEdit ? 'PUT' : 'POST';
    const targetUrl = (editId && !isLocalEdit) ? (apiUrl + '/' + editId) : apiUrl;

    const formData = new FormData();
    Array.from(form.elements).forEach(el=>{
      if(!el.name) return;
      if(el.type === 'file'){
        Array.from(el.files || []).forEach(f=> formData.append('attachments', f));
      } else {
        formData.append(el.name, el.type==='checkbox'? (el.checked? '1':'0') : el.value || '');
      }
    });

    (async function(){
      let saved = false;
      try{
        if(!isLocalEdit){
          console.log('Saving to API at', targetUrl);
          const resp = await fetch(targetUrl, { method: method, body: formData });
          if(resp.ok){
            const body = await resp.json();
            if(editId && !isLocalEdit){
              updateRow(editId, body);
            } else {
              appendJobToTable(body);
            }
            saved = true;
            console.log('Saved to API:', body);
          } else {
            console.warn('API responded with status', resp.status);
          }
        }
      }catch(err){
        console.error('Error saving to API', err);
      }

      if(!saved){
        try{
          if(editId){
            // update local record
            data.id = data.id || null;
            if(isLocalEdit){
              const localId = String(editId).replace(/^local-/, '');
              data._localId = Number(localId) || data._localId || Date.now();
              saveJob(data);
              updateRow(editId, data);
            } else {
              data._localId = data._localId || Date.now();
              saveJob(data);
              updateRow(editId, data);
            }
          } else {
            saveJob(data);
            appendJobToTable(data);
          }
          console.log('Saved locally as fallback', data);
        }catch(err){
          console.error('Fallback save failed', err);
          alert('Failed to save job. See console for details.');
        }
      }

      // restore button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;

      // clear draft after successful save
      try{ localStorage.removeItem(DRAFT_KEY); }catch(e){}

      // clear edit flag
      form.removeAttribute('data-edit-id');

      // close modal
      closeModal();
    })();
  }

  function clearDraft(){
    try{ localStorage.removeItem(DRAFT_KEY); }catch(e){}
    const form = document.getElementById(FORM_ID);
    if(!form) return;
    Array.from(form.elements).forEach(el=>{
      if(!el.name) return;
      if(el.type==='checkbox') el.checked = false;
      else if(el.tagName.toLowerCase()==='select') el.selectedIndex = 0;
      else el.value = '';
    });
  }

  function install(){
    // attach open handler
    const btn = document.getElementById('btn-add');
    if(btn) btn.addEventListener('click', openModal);

    // attach close handlers
    $all('.modal-close').forEach(b=>b.addEventListener('click', closeModal));

    // save draft on input change
    const form = document.getElementById(FORM_ID);
    if(form){
      form.addEventListener('input', function(){ saveDraftFromForm(); });
      form.addEventListener('change', function(){ saveDraftFromForm(); });
      form.addEventListener('submit', handleSubmit);
    }

    // clear draft button
    const clearBtn = document.getElementById('clear-draft');
    if(clearBtn) clearBtn.addEventListener('click', clearDraft);

    // try to load from API, fallback to localStorage
    (async function(){
      const apiBase = window.__API_BASE__ || '';
      const apiUrl = apiBase ? (apiBase + '/api/apps') : '/api/apps';
      let loaded = false;
      try{
        const resp = await fetch(apiUrl);
        if(resp.ok){
          const arr = await resp.json();
          appsCache = Array.isArray(arr)?arr.slice():[];
          const tbody = document.querySelector('#apps-table tbody'); if(tbody) tbody.innerHTML = '';
          appsCache.forEach(j=>appendJobToTable(j));
          loaded = true;
        }
      }catch(e){}
      if(!loaded){
        try{
          const raw = localStorage.getItem(JOBS_KEY);
          const arr = raw?JSON.parse(raw):[];
          appsCache = Array.isArray(arr)?arr.slice():[];
          const tbody = document.querySelector('#apps-table tbody'); if(tbody) tbody.innerHTML = '';
          appsCache.forEach(j=>appendJobToTable(j));
        }catch(e){}
      }
      refreshStatusCounters();
    })();

    // add spinner keyframes to document if not present
    if(!document.getElementById('jobs-spinner-style')){
      const s = document.createElement('style');
      s.id = 'jobs-spinner-style';
      s.textContent = `@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`;
      document.head.appendChild(s);
    }

    // delegate edit/delete from table
    const tbody = document.querySelector('#apps-table tbody');
    if(tbody){
      tbody.addEventListener('click', function(e){
        const editBtn = e.target.closest('.edit-job');
        if(editBtn){
          const tr = editBtn.closest('tr');
          const id = tr && tr.getAttribute('data-id');
          openForEdit(id);
          return;
        }
        const delBtn = e.target.closest('.delete-job');
        if(delBtn){
          const tr = delBtn.closest('tr');
          const id = tr && tr.getAttribute('data-id');
          handleDelete(id);
          return;
        }
      });
    }
  }

  function openForEdit(id){
    if(!id) return;
    const form = document.getElementById(FORM_ID);
    if(!form) return;
    // attempt API GET first
    (async function(){
      const apiBase = window.__API_BASE__ || '';
      const apiUrl = apiBase ? (apiBase + '/api/apps/' + id) : ('/api/apps/' + id);
      try{
        const resp = await fetch(apiUrl);
        if(resp.ok){
          const body = await resp.json();
          populateForm(form, body);
          form.setAttribute('data-edit-id', id);
          document.getElementById(MODAL_ID).classList.remove('hidden');
          return;
        }
      }catch(e){}
      // fallback: find in localStorage
      try{
        const raw = localStorage.getItem(JOBS_KEY);
        const arr = raw?JSON.parse(raw):[];
        const item = arr.find(x => (x.id && String(x.id)===String(id)) || (x._localId && String('local-'+x._localId)===String(id)) );
        if(item){ populateForm(form, item); form.setAttribute('data-edit-id', id); document.getElementById(MODAL_ID).classList.remove('hidden'); }
      }catch(e){}
    })();
  }

  function populateForm(form, data){
    Array.from(form.elements).forEach(el=>{
      if(!el.name) return;
      try{ if(el.type==='checkbox') el.checked = !!data[el.name]; else el.value = data[el.name]||''; }catch(e){}
    });
  }

  async function handleDelete(id){
    if(!id) return;
    // try API
    const apiBase = window.__API_BASE__ || '';
    const apiUrl = apiBase ? (apiBase + '/api/apps/' + id) : ('/api/apps/' + id);
    let deleted = false;
    try{
      const resp = await fetch(apiUrl, { method: 'DELETE' });
      if(resp.ok) deleted = true;
    }catch(e){}
    if(!deleted){
      // remove from localStorage
      try{
        const raw = localStorage.getItem(JOBS_KEY);
        let arr = raw?JSON.parse(raw):[];
        arr = arr.filter(x => !( (x.id && String(x.id)===String(id)) || (x._localId && String('local-'+x._localId)===String(id)) ));
        localStorage.setItem(JOBS_KEY, JSON.stringify(arr));
      }catch(e){}
    }
    removeRow(id);
  }

  // init on DOM ready
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', install); else install();
})();
