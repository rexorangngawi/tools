/*!
 * ErudaV2 Mobile+ (v2.5) — ErudaV2 by Rex
 * Single-file loader (dark theme, mobile-first bottom drawer, bookmarklet-ready)
 * Save as eruda-v2-mobile.js and host (e.g. GitHub Pages)
 */
(function(){
  if(window.__erudaV2_mobile_loaded) { console.log('ErudaV2 Mobile already loaded'); return; }
  window.__erudaV2_mobile_loaded = true;

  const PANEL_ID = 'erudav2-mobile-panel';
  const GEAR_ID  = 'erudav2-mobile-gear';
  const STYLE_ID = 'erudav2-mobile-styles';

  /* ===========================
     Styles (mobile-first, dark)
     =========================== */
  const css = `
:root{--panel:#07101a;--muted:#9aa6b2;--accent:#1f8fff;--text:#e6eef6}
#${PANEL_ID}{position:fixed;left:0;right:0;bottom:0;height:60vh;max-height:92vh;z-index:2147483647;display:flex;flex-direction:column;background:var(--panel);color:var(--text);font-family:Inter,system-ui,Arial,sans-serif;border-top-left-radius:12px;border-top-right-radius:12px;box-shadow:0 -10px 30px rgba(0,0,0,.6);transform:translateY(100%);transition:transform .26s cubic-bezier(.2,.9,.3,1);}
#${PANEL_ID}.open{transform:translateY(0)}
#${PANEL_ID} .header{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.03)}
#${PANEL_ID} .tabs{display:flex;gap:6px;overflow:auto}
#${PANEL_ID} .tabs button{background:transparent;border:0;color:var(--muted);padding:6px 10px;border-radius:8px;font-weight:600;white-space:nowrap}
#${PANEL_ID} .tabs button.active{color:var(--text);background:rgba(255,255,255,0.02)}
#${PANEL_ID} .body{flex:1;overflow:auto;padding:10px;-webkit-overflow-scrolling:touch}
#${PANEL_ID} .footer{padding:8px;text-align:right;border-top:1px solid rgba(255,255,255,.03);font-size:12px;color:var(--muted)}
#${PANEL_ID} .panel{display:none}
#${PANEL_ID} .panel.active{display:block}
#${PANEL_ID} .log{height:38vh;overflow:auto;background:linear-gradient(180deg,#071018,#061018);padding:8px;border-radius:8px;font-family:ui-monospace,monospace;font-size:13px}
#${PANEL_ID} .log .line{padding:4px 6px;border-radius:6px;margin-bottom:4px}
#${PANEL_ID} .controls{display:flex;gap:8px;margin-top:8px}
#${PANEL_ID} input[type=text],#${PANEL_ID} textarea{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.03);color:var(--text);padding:8px;border-radius:8px}
#${PANEL_ID} .list{background:rgba(255,255,255,0.02);padding:8px;border-radius:8px;max-height:42vh;overflow:auto}
#${PANEL_ID} .row{padding:8px;border-bottom:1px dashed rgba(255,255,255,0.03);font-family:ui-monospace,monospace;font-size:13px}
#${GEAR_ID}{position:fixed;right:12px;bottom:12px;z-index:2147483648;width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--accent);box-shadow:0 8px 30px rgba(0,0,0,.35);cursor:pointer}
#${GEAR_ID} svg{width:22px;height:22px;display:block}
@media(min-width:720px){ #${PANEL_ID}{left:auto;right:12px;bottom:12px;height:80vh;width:520px;border-radius:12px} }
`.trim();

  // inject style
  (function(){
    if(document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(s);
  })();

  // helper
  function $(sel, root){ return (root||document).querySelector(sel); }
  function createHtmlFrom(str){ const d=document.createElement('div'); d.innerHTML=str.trim(); return d.firstChild; }
  function safeString(v){ try{ if(typeof v==='string') return v; if(v===null) return 'null'; if(v===undefined) return 'undefined'; if(typeof v==='object') return JSON.stringify(v); return String(v);}catch(e){return String(v);} }

  /* ===========================
     Gear button
     =========================== */
  function createGear(){
    if(document.getElementById(GEAR_ID)) return document.getElementById(GEAR_ID);
    const g = document.createElement('div');
    g.id = GEAR_ID;
    g.title = 'ErudaV2 by Rex';
    g.innerHTML = '\
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">\
        <path fill="white" d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z"/>\
        <path fill="rgba(0,0,0,0.12)" d="M19.4 13.4a7.9 7.9 0 0 0 .1-2.8l2-1.6-2-3.4-2.4.5a8.2 8.2 0 0 0-1.7-1L14.7 1h-5.4L8.8 4.1a8.2 8.2 0 0 0-1.7 1L4.8 4.6 2.8 8l2 1.6a7.9 7.9 0 0 0 .1 2.8l-2 1.6 2 3.4 2.4-.5c.5.6 1.1 1.1 1.7 1L9.3 23h5.4l.6-3.1c.6-.1 1.2-.5 1.7-1l2.4.5 2-3.4-2-1.6z"/>\
      </svg>';
    document.body.appendChild(g);
    return g;
  }

  /* ===========================
     Panel DOM
     =========================== */
  function buildPanel(){
    if(document.getElementById(PANEL_ID)) return document.getElementById(PANEL_ID);
    const html = `
<div class="header">
  <div style="display:flex;align-items:center;gap:8px">
    <strong>ErudaV2 by Rex</strong>
    <div class="tabs" id="erudav2-tabs">
      <button data-panel="console" class="active">Console</button>
      <button data-panel="network">Network</button>
      <button data-panel="elements">Elements</button>
      <button data-panel="storage">Storage</button>
      <button data-panel="performance">Performance</button>
      <button data-panel="sources">Sources</button>
      <button data-panel="features">Features</button>
    </div>
  </div>
  <div style="display:flex;gap:8px;align-items:center">
    <button id="erudav2-close" class="erudav2-button">Close</button>
  </div>
</div>
<div class="body">
  <div id="panel-console" class="panel active">
    <div class="log" id="erudav2-log"></div>
    <div class="controls">
      <input id="erudav2-input" type="text" placeholder="Type JS and press Enter (use $_ for last)">
      <button id="erudav2-run" class="erudav2-button">Run</button>
    </div>
  </div>
  <div id="panel-network" class="panel">
    <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
      <button id="erudav2-net-clear" class="erudav2-button">Clear</button>
      <button id="erudav2-har" class="erudav2-button">Export HAR</button>
      <input id="erudav2-net-filter" type="text" placeholder="Filter URL/method" style="flex:1">
    </div>
    <div class="list" id="erudav2-network-list"></div>
  </div>
  <div id="panel-elements" class="panel">
    <div style="margin-bottom:8px"><button id="erudav2-inspect" class="erudav2-button">Inspect</button></div>
    <div class="list" id="erudav2-tree"></div>
  </div>
  <div id="panel-storage" class="panel">
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button data-store="local" class="erudav2-button store-btn active">Local</button>
      <button data-store="session" class="erudav2-button store-btn">Session</button>
      <button data-store="cookies" class="erudav2-button store-btn">Cookies</button>
    </div>
    <div class="list" id="erudav2-storage-list"></div>
  </div>
  <div id="panel-performance" class="panel">
    <div style="display:flex;gap:12px"><div>FPS: <span id="erudav2-fps">—</span></div><div>Mem: <span id="erudav2-mem">—</span></div></div>
    <canvas id="erudav2-perf" width="400" height="60" style="margin-top:8px;width:100%"></canvas>
  </div>
  <div id="panel-sources" class="panel">
    <div class="list" id="erudav2-sources-list"></div>
    <pre id="erudav2-sources-view" style="white-space:pre-wrap;max-height:40vh;overflow:auto;margin-top:8px;background:#07101a;padding:8px;border-radius:6px"></pre>
  </div>
  <div id="panel-features" class="panel">
    <div class="list"><strong>ErudaV2 Mobile+</strong><ul><li>All-request capture</li><li>Bottom drawer responsive UI</li><li>Console REPL + history ($_)</li><li>Storage viewer</li><li>Performance</li></ul></div>
  </div>
</div>
<div class="footer">ErudaV2 by Rex • Mobile+</div>
`.trim();

    const container = document.createElement('div');
    container.id = PANEL_ID;
    container.innerHTML = html;
    document.body.appendChild(container);

    // tabs wiring
    const tabs = container.querySelectorAll('.tabs button');
    const panels = container.querySelectorAll('.panel');
    tabs.forEach(btn => btn.addEventListener('click', function(){
      tabs.forEach(t=>t.classList.remove('active'));
      btn.classList.add('active');
      const sel = btn.getAttribute('data-panel');
      panels.forEach(p => p.classList.remove('active'));
      const target = container.querySelector('#panel-' + sel);
      if(target) target.classList.add('active');
    }));

    // close
    container.querySelector('#erudav2-close').addEventListener('click', ()=>container.classList.remove('open'));

    return container;
  }

  /* ===========================
     Console
     =========================== */
  function initConsole(panel){
    const log = $( '#erudav2-log', panel );
    const input = $( '#erudav2-input', panel );
    const run = $( '#erudav2-run', panel );

    function appendLine(txt, cls){
      try{
        const d = document.createElement('div'); d.className = 'line '+(cls||''); d.textContent = '['+new Date().toLocaleTimeString()+'] '+txt;
        log.appendChild(d);
        log.scrollTop = log.scrollHeight;
      }catch(e){}
    }

    ['log','info','warn','error','debug'].forEach(level=>{
      const orig = console[level].bind(console);
      console[level] = function(){
        try{ appendLine(Array.from(arguments).map(a=>safeString(a)).join(' '), level==='warn'?'warn':level==='error'?'error':''); }catch(e){}
        return orig.apply(console, arguments);
      };
    });

    run.addEventListener('click', runInput);
    input.addEventListener('keydown', function(e){ if(e.key === 'Enter') runInput(); });

    function runInput(){
      const code = input.value.trim();
      if(!code) return;
      try{
        const res = eval(code);
        window.$_ = res;
        appendLine('=> ' + safeString(res));
      }catch(err){
        appendLine('Error: ' + err, 'error');
      }
      input.value = '';
    }
  }

  /* ===========================
     Recorder (network + misc)
     =========================== */
  const Recorder = (function(){
    let recs = [];
    const listeners = { add: [], clear: [] };
    function notify(ev, data){ (listeners[ev]||[]).forEach(f=>{ try{ f(data); }catch(e){} }); }
    function add(r){ recs.unshift(r); notify('add', r); }
    function clear(){ recs = []; notify('clear'); }
    function all(){ return recs.slice(); }
    function on(ev, fn){ if(!listeners[ev]) listeners[ev]=[]; listeners[ev].push(fn); }
    return { add, clear, all, on };
  })();

  // XHR hook
  (function(){
    try{
      const _XHR = window.XMLHttpRequest;
      function HookedXHR(){
        const xhr = new _XHR();
        const id = 'xhr_' + Math.random().toString(36).slice(2,9);
        let method = '', url = '', start = 0, reqHeaders = {};
        const _open = xhr.open;
        xhr.open = function(m, u){
          method = m; url = u; return _open.apply(xhr, arguments);
        };
        const _set = xhr.setRequestHeader;
        xhr.setRequestHeader = function(k,v){ try{ reqHeaders[k]=v; }catch(e){} return _set.apply(xhr, arguments); };
        const _send = xhr.send;
        xhr.send = function(body){
          start = Date.now();
          try{ Recorder.add({ id, type: 'xhr', method, url, startedDateTime: (new Date()).toISOString(), request:{ headers: reqHeaders, body } }); }catch(e){}
          return _send.apply(xhr, arguments);
        };
        xhr.addEventListener('readystatechange', function(){
          try{
            if(xhr.readyState === 4){
              Recorder.add({ id, type:'xhr', method, url, status: xhr.status, duration: Date.now()-start, response: { body: (xhr.responseType === '' || xhr.responseType === 'text') ? xhr.responseText : '[binary]' } });
            }
          }catch(e){}
        });
        return xhr;
      }
      window.XMLHttpRequest = HookedXHR;
    }catch(e){}
  })();

  // fetch hook
  (function(){
    try{
      const _fetch = window.fetch.bind(window);
      window.fetch = function(resource, init){
        const id = 'fetch_' + Math.random().toString(36).slice(2,9);
        const method = (init && init.method) || 'GET';
        const url = (typeof resource === 'string') ? resource : (resource && resource.url) || '';
        const start = Date.now();
        const reqBody = (init && init.body) || null;
        Recorder.add({ id, type:'fetch', method, url, startedDateTime: (new Date()).toISOString(), request:{ headers:(init && init.headers)||{}, body:reqBody }});
        return _fetch(resource, init).then(function(res){
          try{
            const clone = res.clone && res.clone();
            if(clone && clone.text){
              return clone.text().then(function(body){
                Recorder.add({ id, type:'fetch', method, url, status: res.status, duration: Date.now()-start, response:{ statusText: res.statusText, headers:(function(){ const h={}; try{ res.headers.forEach((v,k)=>h[k]=v);}catch(e){} return h; })(), body }});
                return res;
              }).catch(function(){ Recorder.add({ id, type:'fetch', method, url, status: res.status, duration: Date.now()-start }); return res; });
            } else {
              Recorder.add({ id, type:'fetch', method, url, status: res.status, duration: Date.now()-start });
              return res;
            }
          }catch(e){ Recorder.add({ id, type:'fetch', method, url, status: res.status, duration: Date.now()-start, response:{ error: String(e) } }); return res; }
        }).catch(function(err){ Recorder.add({ id, type:'fetch', method, url, status:0, duration: Date.now()-start, error: String(err) }); throw err; });
      };
    }catch(e){}
  })();

  // sendBeacon
  (function(){
    try{ if(navigator.sendBeacon){
      const _send = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = function(url,data){
        const id = 'beacon_' + Math.random().toString(36).slice(2,9);
        Recorder.add({ id, type:'beacon', method:'POST', url, startedDateTime:(new Date()).toISOString(), request:{ body:data }});
        return _send(url,data);
      };
    } }catch(e){}
  })();

  // Image src + dynamic element creation
  (function(){
    try{
      const _Image = window.Image;
      window.Image = function(){
        const img = new _Image();
        try{
          Object.defineProperty(img, 'src', {
            set: function(v){
              Recorder.add({ id: 'img_' + Math.random().toString(36).slice(2,9), type:'image', method:'GET', url:v, startedDateTime:(new Date()).toISOString() });
              return HTMLImageElement.prototype.__lookupSetter__('src').call(img, v);
            },
            get: function(){ return HTMLImageElement.prototype.__lookupGetter__('src').call(img); }
          });
        }catch(e){}
        return img;
      };
    }catch(e){}
    // intercept createElement
    try{
      const origCreate = document.createElement.bind(document);
      document.createElement = function(tagName){
        const el = origCreate(tagName);
        try{
          const lc = (''+tagName).toLowerCase();
          if(lc === 'script' || lc === 'img' || lc === 'link'){
            if(lc === 'link'){
              Object.defineProperty(el, 'href', {
                set: function(v){ Recorder.add({ id:'res_'+Math.random().toString(36).slice(2,9), type:'link', method:'GET', url:v, startedDateTime:(new Date()).toISOString() }); return HTMLLinkElement.prototype.__lookupSetter__('href').call(el, v); },
                get: function(){ return HTMLLinkElement.prototype.__lookupGetter__('href').call(el); }
              });
            } else {
              Object.defineProperty(el, 'src', {
                set: function(v){ Recorder.add({ id:'res_'+Math.random().toString(36).slice(2,9), type:lc, method:'GET', url:v, startedDateTime:(new Date()).toISOString() }); return HTMLImageElement.prototype.__lookupSetter__('src').call(el, v); },
                get: function(){ return HTMLImageElement.prototype.__lookupGetter__('src').call(el); }
              });
            }
          }
        }catch(e){}
        return el;
      };
    }catch(e){}
  })();

  // WebSocket
  (function(){
    try{
      if(window.WebSocket){
        const _WS = window.WebSocket;
        function HookedWS(url, protocols){
          const ws = protocols ? new _WS(url, protocols) : new _WS(url);
          const id = 'ws_'+Math.random().toString(36).slice(2,9);
          Recorder.add({ id, type:'websocket', url, startedDateTime:(new Date()).toISOString() });
          try{
            const _send = ws.send;
            ws.send = function(data){ Recorder.add({ id:'ws-send-'+Math.random().toString(36).slice(2,9), type:'websocket-send', parent:id, body:String(data), startedDateTime:(new Date()).toISOString() }); return _send.apply(ws, arguments); };
            ws.addEventListener('message', function(ev){ Recorder.add({ id:'ws-recv-'+Math.random().toString(36).slice(2,9), type:'websocket-recv', parent:id, body:String(ev.data), startedDateTime:(new Date()).toISOString() }); });
          }catch(e){}
          return ws;
        }
        window.WebSocket = HookedWS;
      }
    }catch(e){}
  })();

  // PerformanceObserver resource timing
  (function(){
    try{
      if(window.PerformanceObserver){
        const po = new PerformanceObserver(function(list){
          list.getEntries().forEach(function(ent){
            if(ent.entryType === 'resource'){
              Recorder.add({ id:'rt_'+Math.random().toString(36).slice(2,9), type:'resource-timing', name:ent.name, initiatorType:ent.initiatorType, transferSize:ent.transferSize, duration:ent.duration, startedDateTime:(new Date()).toISOString() });
            }
          });
        });
        po.observe({ entryTypes: ['resource'] });
      }
    }catch(e){}
  })();

  // form submit capture
  document.addEventListener('submit', function(e){
    try{
      const f = e.target;
      const fd = new FormData(f);
      const obj = {};
      fd.forEach((v,k)=>{
        if(obj[k]){ if(Array.isArray(obj[k])) obj[k].push(v); else obj[k] = [obj[k], v]; }
        else obj[k] = v;
      });
      Recorder.add({ id:'form_'+Math.random().toString(36).slice(2,9), type:'form', method:(f.method||'GET').toUpperCase(), url:(f.action||location.href), startedDateTime:(new Date()).toISOString(), request:{ form: obj }});
    }catch(e){}
  }, true);

  /* ===========================
     UI init functions
     =========================== */
  function initNetworkUI(panel){
    const list = $('#erudav2-network-list', panel);
    const filter = $('#erudav2-net-filter', panel);
    const netClear = $('#erudav2-net-clear', panel);
    const exportHar = $('#erudav2-har', panel);

    function render(rec){
      try{
        const row = document.createElement('div'); row.className = 'row'; row.dataset.id = rec.id;
        row.innerHTML = '<div style="font-weight:600">'+(rec.method||rec.type||'')+' '+(rec.url||rec.name||'')+'</div><div style="color:var(--muted);font-size:12px">'+(rec.status||'')+' • '+(rec.duration?rec.duration+'ms':'')+' • '+(rec.type||'')+'</div>';
        row.addEventListener('click', function(){ showDetail(rec.id); panel.querySelectorAll('.row').forEach(x=>x.style.background=''); row.style.background='rgba(255,255,255,0.02)'; });
        list.prepend(row);
      }catch(e){}
    }

    Recorder.on('add', function(r){
      const f = (filter.value||'').trim().toLowerCase();
      if(!f || (r.url && r.url.toLowerCase().includes(f)) || (r.method && r.method.toLowerCase().includes(f))) render(r);
    });
    Recorder.on('clear', function(){ list.innerHTML=''; });

    netClear.addEventListener('click', function(){ Recorder.clear(); });

    exportHar.addEventListener('click', function(){
      try{
        const records = Recorder.all();
        const har = { log: { version: '1.2', creator: { name:'ErudaV2 Mobile', version:'2.5' }, entries: records.map(r => ({ startedDateTime: r.startedDateTime || (new Date()).toISOString(), time: r.duration || 0, request: { method: r.method || 'GET', url: r.url || r.name || '' }, response: { status: r.status || 0 } })) } };
        const blob = new Blob([JSON.stringify(har, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'erudav2-mobile.har'; a.click(); URL.revokeObjectURL(a.href);
      }catch(e){ alert('HAR export failed: '+e); }
    });

    // expose for debugging
    window.ErudaV2Recorder = Recorder;
  }

  function showDetail(id){
    const rec = Recorder.all().find(r=>r.id===id);
    if(!rec) return alert('Record not found');
    const w = window.open('','_blank');
    w.document.title = 'ErudaV2 — '+id;
    const pre = w.document.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.fontFamily = 'monospace';
    pre.textContent = JSON.stringify(rec, null, 2);
    w.document.body.appendChild(pre);
  }

  /* init elements, storage, performance, sources */
  function initElements(panel){
    const tree = $('#erudav2-tree', panel);
    const btn = $('#erudav2-inspect', panel);
    let selecting = false, highlighted = null;
    btn.addEventListener('click', function(){ selecting = !selecting; btn.textContent = selecting ? 'Stop' : 'Inspect'; if(selecting) document.body.addEventListener('pointerdown', onPick, true); else document.body.removeEventListener('pointerdown', onPick, true); });
    function onPick(e){ e.preventDefault(); e.stopPropagation(); selecting=false; btn.textContent='Inspect'; document.body.removeEventListener('pointerdown', onPick, true); const elmt = e.target; if(highlighted){ highlighted.style.outline = highlighted.__eruda_old_o || ''; delete highlighted.__eruda_old_o; } highlighted = elmt; highlighted.__eruda_old_o = highlighted.style.outline || ''; highlighted.style.outline = '3px solid rgba(31,143,255,0.95)'; showTree(elmt); }
    function showTree(rootEl){ tree.innerHTML=''; function nodeFor(e,depth){ const nd = document.createElement('div'); nd.className='row'; nd.textContent = '<'+e.tagName.toLowerCase() + (e.id?(' #' + e.id):'') + (e.className?(' .' + e.className.split(' ').join('.')):'') + '>'; nd.addEventListener('click', function(ev){ ev.stopPropagation(); if(highlighted){ highlighted.style.outline = highlighted.__eruda_old_o || ''; } highlighted = e; highlighted.__eruda_old_o = highlighted.style.outline || ''; highlighted.style.outline='3px solid rgba(31,143,255,0.95)'; }); if(depth>0 && e.children && e.children.length){ const sub = document.createElement('div'); sub.style.paddingLeft='10px'; Array.from(e.children).slice(0,20).forEach(c=> sub.appendChild(nodeFor(c, depth-1))); nd.appendChild(sub); } return nd; } tree.appendChild(nodeFor(rootEl,3)); }
  }

  function initStorage(panel){
    const btns = panel.querySelectorAll('.store-btn');
    const list = $('#erudav2-storage-list', panel);
    btns.forEach(b=> b.addEventListener('click', function(){ btns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); showStore(b.getAttribute('data-store')); }));
    function showStore(kind){
      list.innerHTML = '';
      if(kind === 'local'){ for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); const v = localStorage.getItem(k); const r = document.createElement('div'); r.className='row'; r.textContent = k + ' = ' + v; list.appendChild(r); } }
      else if(kind === 'session'){ for(let i=0;i<sessionStorage.length;i++){ const k = sessionStorage.key(i); const v = sessionStorage.getItem(k); const r = document.createElement('div'); r.className='row'; r.textContent = k + ' = ' + v; list.appendChild(r); } }
      else if(kind === 'cookies'){ const cookies = document.cookie.split(';').map(s=>s.trim()).filter(Boolean); cookies.forEach(c=>{ const r = document.createElement('div'); r.className='row'; r.textContent = c; list.appendChild(r); }); }
    }
  }

  function initPerformance(panel){
    const fpsEl = $('#erudav2-fps', panel), memEl = $('#erudav2-mem', panel), canvas = $('#erudav2-perf', panel);
    const ctx = canvas.getContext('2d');
    let last = performance.now(), frames = 0;
    function tick(now){ frames++; const dt = now - last; if(dt >= 500){ const fps = Math.round((frames/dt)*1000); fpsEl.textContent = fps; frames = 0; last = now; ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle = 'rgba(31,143,255,0.9)'; const h = Math.max(1, Math.min(canvas.height, fps)); ctx.fillRect(0, canvas.height - h, canvas.width, h); } if(performance && performance.memory) memEl.textContent = Math.round(performance.memory.usedJSHeapSize/1024/1024)+' MB'; else memEl.textContent='n/a'; requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
  }

  function initSources(panel){
    const list = $('#erudav2-sources-list', panel), view = $('#erudav2-sources-view', panel);
    list.innerHTML=''; view.textContent='';
    Array.from(document.scripts).forEach((s, idx)=>{
      const item = document.createElement('div'); item.className='row'; item.textContent = s.src ? 'script: ' + s.src : 'inline #' + (idx+1);
      item.addEventListener('click', async function(){ list.querySelectorAll('.selected').forEach(n=>n.classList.remove('selected')); item.classList.add('selected'); let content=''; if(s.src){ try{ const res = await fetch(s.src, { cache: 'no-store' }); content = await res.text(); }catch(e){ content = 'Could not fetch: ' + e; } } else content = s.textContent; view.textContent = content; });
      list.appendChild(item);
    });
  }

  /* ===========================
     Panel finish/setup
     =========================== */
  const gear = createGear();
  let panel = null;

  function openPanel(){
    if(!panel) panel = buildPanel();
    // init modules once
    if(!panel.__eruda_inited){
      initConsole(panel);
      initNetworkUI(panel);
      initElements(panel);
      initStorage(panel);
      initPerformance(panel);
      initSources(panel);
      panel.__eruda_inited = true;
    }
    panel.classList.add('open');
  }
  function togglePanel(){ if(!panel) openPanel(); else panel.classList.toggle('open'); }

  gear.addEventListener('click', function(){ togglePanel(); });

  // auto open if debug
  try{ if(location.search.indexOf('debug=true') !== -1) openPanel(); }catch(e){}

  // expose API
  window.ErudaV2Mobile = { open: openPanel, close: function(){ if(panel) panel.classList.remove('open'); }, toggle: togglePanel, recorder: Recorder };

  console.log('ErudaV2 Mobile+ v2.5 injected — use ErudaV2Mobile.toggle()');

})();
