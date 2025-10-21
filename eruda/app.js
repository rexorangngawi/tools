/*! ErudaV2 Pro — ErudaV2 by Rex (Pro/Ultra Network Capture) v1.0 */
(function(){
  if(window.__erudaV2_pro_loaded) return; window.__erudaV2_pro_loaded = true;
  // --- config ---
  var AUTO_OPEN_ON_DEBUG = false; // if ?debug=true will auto open gear
  var ALLOW_PUBLIC = true; // public bookmarklet by default
  // --- css ---
  var css = "/* ErudaV2 Pro styles */\n:root{--panel:#0b1220;--bg:#07101a;--text:#e6eef6;--muted:#9aa6b2;--accent:#1f8fff}\n.erudav2-gear{position:fixed;right:12px;bottom:12px;z-index:2147483646;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--accent);box-shadow:0 6px 18px rgba(0,0,0,.35);cursor:pointer}\n.erudav2-panel{position:fixed;right:0;top:0;height:100vh;width:760px;z-index:2147483645;display:flex;flex-direction:column;background:var(--panel);color:var(--text);box-shadow:0 4px 30px rgba(0,0,0,.6);font-family:Inter,system-ui,Arial;font-size:13px}\n.erudav2-hidden{display:none}\n.erudav2-header{display:flex;align-items:center;justify-content:space-between;padding:8px;border-bottom:1px solid rgba(255,255,255,.03)}\n.erudav2-tabs button{background:transparent;border:0;color:var(--muted);padding:6px 8px;margin-right:4px;cursor:pointer}\n.erudav2-tabs button.active{color:var(--text);border-bottom:2px solid var(--accent)}\n.erudav2-body{flex:1;overflow:auto;padding:10px}\n.erudav2-log{padding:6px;border-radius:6px;background:linear-gradient(#07101a,#061018);min-height:200px;overflow:auto}\n.erudav2-log .item{padding:4px 6px;font-family:ui-monospace,monospace}\n.erudav2-controls{display:flex;gap:8px}\n.erudav2-network-list,.erudav2-tree,.erudav2-storage{background:rgba(255,255,255,.02);padding:8px;border-radius:6px;min-height:120px;overflow:auto}\n.erudav2-footer{padding:8px;border-top:1px solid rgba(255,255,255,.03);text-align:right;color:var(--muted)}\n.erudav2-button{background:transparent;color:var(--text);border:1px solid rgba(255,255,255,.03);padding:6px 8px;border-radius:6px;cursor:pointer}\n.erudav2-panel .ep-split{display:flex;gap:8px}\n.erudav2-panel textarea{width:100%;min-height:120px;background:#07101a;border:1px solid rgba(255,255,255,.03);color:var(--text);padding:8px;border-radius:6px}\n.erudav2-network-row{padding:6px;border-bottom:1px dashed rgba(255,255,255,.03);font-family:ui-monospace,monospace}\n.erudav2-network-row .meta{color:var(--muted);font-size:12px}\n";

  function injectStyle(cssText){
    var s = document.createElement('style');
    s.id = 'erudav2-pro-styles';
    s.appendChild(document.createTextNode(cssText));
    document.head.appendChild(s);
  }

  // SVG gear (placeholder - replace if desired)
  var userSVG = '<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" fill="white" opacity="0.95"/><path d="M19.4 13.4a7.9 7.9 0 0 0 .1-2.8l2-1.6-2-3.4-2.4.5a8.2 8.2 0 0 0-1.7-1L14.7 1h-5.4L8.8 4.1a8.2 8.2 0 0 0-1.7 1L4.8 4.6 2.8 8l2 1.6a7.9 7.9 0 0 0 .1 2.8l-2 1.6 2 3.4 2.4-.5c.5.6 1.1 1.1 1.7 1L9.3 23h5.4l.6-3.1c.6-.1 1.2-.5 1.7-1l2.4.5 2-3.4-2-1.6z" fill="rgba(0,0,0,0.15)"/></svg>';

  injectStyle(css);

  function createGear(){
    if(document.getElementById('erudav2-gear')) return document.getElementById('erudav2-gear');
    var g = document.createElement('div');
    g.className = 'erudav2-gear'; g.id = 'erudav2-gear'; g.title='ErudaV2 by Rex — Open';
    g.innerHTML = userSVG;
    document.body.appendChild(g);
    return g;
  }

  // --- Network recorder (comprehensive) ---
  var recorder = {
    records: [],
    add: function(rec){ this.records.unshift(rec); if(this.onadd) try{ this.onadd(rec);}catch(e){} },
    find: function(id){ return this.records.find(r=>r.id===id); },
    clear: function(){ this.records = []; if(this.onclear) this.onclear(); }
  };

  // Util
  function genId(){ return Math.random().toString(36).slice(2,9); }
  function nowISO(){ return (new Date()).toISOString(); }
  function safeString(v){ try{ if(typeof v==='string') return v; if(v===undefined) return 'undefined'; if(v===null) return 'null'; if(typeof v==='object') return JSON.stringify(v); return String(v);}catch(e){return String(v);} }

  // XHR hook
  (function(){
    var _XHR = window.XMLHttpRequest;
    function HookedXHR(){
      var xhr = new _XHR();
      var id = genId(), method='', url=''; var start=0, reqHeaders={};
      var _open = xhr.open; xhr.open = function(m,u){ method = m; url = u; return _open.apply(xhr, arguments); };
      var _setRequestHeader = xhr.setRequestHeader; xhr.setRequestHeader = function(k,v){ try{ reqHeaders[k]=v;}catch(e){} return _setRequestHeader.apply(xhr, arguments); };
      var _send = xhr.send; xhr.send = function(body){ start = Date.now(); try{ recorder.add({id:id,type:'xhr',method:method,url:url,startedDateTime:nowISO(),request:{headers:reqHeaders,body:body},status:null,duration:null,response:null}) }catch(e){} return _send.apply(xhr, arguments); };
      xhr.addEventListener('readystatechange', function(){
        try{
          if(xhr.readyState===4){
            var rec = recorder.find(id) || {};
            rec.status = xhr.status; rec.duration = Date.now()-start;
            try{ rec.response = {headers: 'n/a', body: xhr.responseType==='text' || xhr.responseType==='' ? xhr.responseText : '[binary]'} }catch(e){ rec.response = {body:'[cannot read]'} }
            recorder.add(rec);
          }
        }catch(e){}
      });
      return xhr;
    }
    window.XMLHttpRequest = HookedXHR;
  })();

  // fetch hook
  (function(){
    var _fetch = window.fetch.bind(window);
    window.fetch = function(resource, init){
      var id = genId(), method = (init && init.method) || 'GET', url = (typeof resource==='string'?resource:(resource && resource.url)||''), start = Date.now();
      var reqBody = (init && init.body) ? init.body : null;
      recorder.add({id:id,type:'fetch',method:method,url:url,startedDateTime:nowISO(),request:{headers:(init && init.headers)||{},body:reqBody},status:null,duration:null,response:null});
      return _fetch(resource, init).then(function(res){
        var clone = res.clone && res.clone();
        return (clone && clone.text ? clone.text().catch(()=>'[body not available]') : Promise.resolve('[no-text]')).then(function(bodyText){
          var rec = recorder.find(id) || {};
          rec.status = res.status; rec.duration = Date.now()-start;
          rec.response = {statusText: res.statusText, headers: (function(){ var h={}; try{ res.headers.forEach(function(v,k){ h[k]=v }); }catch(e){} return h; })(), body: bodyText};
          recorder.add(rec);
          return res;
        }).catch(function(err){
          var rec = recorder.find(id)||{}; rec.status=0; rec.duration=Date.now()-start; rec.response={error:String(err)}; recorder.add(rec); return res;
        });
      }).catch(function(err){
        var rec = recorder.find(id)||{}; rec.status=0; rec.duration=Date.now()-start; rec.error = String(err); recorder.add(rec); throw err;
      });
    };
  })();

  // sendBeacon
  (function(){
    if(navigator.sendBeacon){
      var _sendBeacon = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = function(url, data){
        var id = genId(), start=Date.now();
        recorder.add({id:id,type:'beacon',method:'POST',url:url,startedDateTime:nowISO(),request:{body:data},status:null,duration:null});
        try{ var ok = _sendBeacon(url,data); recorder.add({id:id, status: ok?204:0, duration: Date.now()-start}); return ok; }catch(e){ recorder.add({id:id,status:0,duration:Date.now()-start,error:String(e)}); throw e; }
      };
    }
  })();

  // Image src observer - captures GET requests via setting src on Image elements
  (function(){
    try{
      var Img = window.Image;
      function HookedImage(){ var img = new Img(); Object.defineProperty(img,'src',{ set: function(v){ var id=genId(); recorder.add({id:id,type:'image',method:'GET',url:v,startedDateTime:nowISO()}); return HTMLImageElement.prototype.__lookupSetter__('src').call(img,v); }, get: function(){ return HTMLImageElement.prototype.__lookupGetter__('src').call(img); } }); return img; }
      try{ window.Image = HookedImage; }catch(e){}
    }catch(e){}
  })();

  // Resource load observer (link/script tags)
  (function(){
    var origCreateElement = document.createElement.bind(document);
    document.createElement = function(tagName){
      var el = origCreateElement(tagName);
      try{
        if(/script|img|link/i.test(tagName)){
          var _setSrc = function(v){ try{ recorder.add({id:genId(),type:tagName.toLowerCase(),method:'GET',url:v,startedDateTime:nowISO()}); }catch(e){} if(tagName.toLowerCase()==='link') return HTMLLinkElement.prototype.__lookupSetter__('href').call(el,v); return el.setAttribute('src',v); };
          if(tagName.toLowerCase()==='link'){ Object.defineProperty(el,'href',{ set:function(v){ _setSrc(v); return HTMLLinkElement.prototype.__lookupSetter__('href').call(el,v); }, get:function(){ return HTMLLinkElement.prototype.__lookupGetter__('href').call(el); } }); }
          else { Object.defineProperty(el,'src',{ set:function(v){ _setSrc(v); return HTMLImageElement.prototype.__lookupSetter__('src').call(el,v); }, get:function(){ return HTMLImageElement.prototype.__lookupGetter__('src').call(el); } }); }
        }
      }catch(e){}
      return el;
    };
  })();

  // WebSocket observer
  (function(){
    if(window.WebSocket){
      var _WS = window.WebSocket;
      function HookedWS(url, protocols){
        var id = genId(); var ws = protocols ? new _WS(url, protocols) : new _WS(url);
        recorder.add({id:id,type:'websocket',url:url,startedDateTime:nowISO()});
        try{
          var _send = ws.send;
          ws.send = function(data){ recorder.add({id:genId(),type:'websocket-send',parent:id,body:String(data),startedDateTime:nowISO()}); return _send.apply(ws,arguments); };
          ws.addEventListener('message', function(ev){ recorder.add({id:genId(),type:'websocket-recv',parent:id,body:String(ev && ev.data),startedDateTime:nowISO()}); });
        }catch(e){}
        return ws;
      }
      window.WebSocket = HookedWS;
    }
  })();

  // EventSource (Server-Sent Events)
  (function(){
    if(window.EventSource){
      var _ES = window.EventSource;
      function HookedES(url, opts){
        var es = new _ES(url, opts); var id = genId();
        recorder.add({id:id,type:'eventsource',url:url,startedDateTime:nowISO()});
        es.addEventListener('message', function(ev){ recorder.add({id:genId(),type:'eventsource-message',parent:id,data:String(ev.data),startedDateTime:nowISO()}); });
        return es;
      }
      window.EventSource = HookedES;
    }
  })();

  // Form submit capture
  (function(){ document.addEventListener('submit', function(e){ try{ var f = e.target; var fd = new FormData(f); var obj = {}; fd.forEach(function(v,k){ if(obj[k]){ if(Array.isArray(obj[k])) obj[k].push(v); else obj[k] = [obj[k], v]; } else obj[k]=v }); recorder.add({id:genId(),type:'form',method:(f.method||'GET').toUpperCase(),url:(f.action||location.href),startedDateTime:nowISO(),request:{form:obj}}); }catch(e){} }, true); })();

  // Performance observer for resource timing (captures loaded resources)
  (function(){
    try{
      if(window.PerformanceObserver){
        var po = new PerformanceObserver(function(list){ list.getEntries().forEach(function(ent){ if(ent.entryType==='resource'){ try{ recorder.add({id:genId(),type:'resource-timing',name:ent.name,initiatorType:ent.initiatorType,transferSize:ent.transferSize,startTime:ent.startTime,duration:ent.duration,startedDateTime:nowISO()}); }catch(e){} } }); });
        po.observe({entryTypes:['resource']});
      }
    }catch(e){}
  })();

  // --- UI & Viewer ---
  function buildUI(){
    if(document.getElementById('erudav2-panel')) return document.getElementById('erudav2-panel');
    var panel = document.createElement('div'); panel.id='erudav2-panel'; panel.className='erudav2-panel erudav2-hidden';
    panel.innerHTML = '<div class="erudav2-header"><div style="display:flex;align-items:center;gap:12px"><strong>ErudaV2 by Rex — PRO</strong><div class="erudav2-tabs" id="erudav2-tabs"><button data-panel="console" class="active">Console</button><button data-panel="network">Network</button><button data-panel="requests">Requests</button><button data-panel="resources">Resources</button><button data-panel="elements">Elements</button><button data-panel="storage">Storage</button><button data-panel="performance">Performance</button><button data-panel="sources">Sources</button><button data-panel="features">Features</button></div></div><div class="erudav2-controls"><label style="color:var(--muted)"><input type="checkbox" id="erudav2-theme"> Auto</label><button id="erudav2-close" class="erudav2-button">Close</button></div></div><div class="erudav2-body" id="erudav2-body"><div id="panel-console" class="panel-section"><div class="erudav2-log" id="erudav2-log"></div><div style="display:flex;gap:8px;margin-top:8px"><input id="erudav2-input" placeholder="Type JS (use $_ for last result)" style="flex:1;padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,.04);background:rgba(255,255,255,.02);color:var(--text)"><button id="erudav2-run" class="erudav2-button">Run</button><button id="erudav2-clear" class="erudav2-button">Clear</button></div></div><div id="panel-network" class="panel-section erudav2-hidden"><div style="display:flex;gap:8px;align-items:center;margin-bottom:8px"><button id="erudav2-net-clear" class="erudav2-button">Clear</button><button id="erudav2-export-har" class="erudav2-button">Export HAR</button><input id="erudav2-filter" placeholder="Filter URL / method" style="flex:1;padding:6px;border-radius:6px;border:1px solid rgba(255,255,255,.04);background:rgba(255,255,255,.02);color:var(--text)"></div><div class="erudav2-network-list" id="erudav2-network-list"></div></div><div id="panel-requests" class="panel-section erudav2-hidden"><div style="display:flex;gap:8px;margin-bottom:8px"><button id="erudav2-replay" class="erudav2-button">Replay Selected</button><button id="erudav2-edit" class="erudav2-button">Edit & Resend</button></div><div class="erudav2-network-list" id="erudav2-requests-list"></div></div><div id="panel-resources" class="panel-section erudav2-hidden"><div class="erudav2-network-list" id="erudav2-resources-list"></div></div><div id="panel-elements" class="panel-section erudav2-hidden" style="margin-top:8px"><div style="margin-bottom:8px"><button id="erudav2-inspect" class="erudav2-button">Inspect</button></div><div class="erudav2-tree" id="erudav2-tree"></div></div><div id="panel-storage" class="panel-section erudav2-hidden"><div style="display:flex;gap:8px;margin-bottom:8px"><button data-store="local" class="erudav2-button store-btn active">Local</button><button data-store="session" class="erudav2-button store-btn">Session</button><button data-store="indexeddb" class="erudav2-button store-btn">IndexedDB</button><button data-store="cookies" class="erudav2-button store-btn">Cookies</button></div><div class="erudav2-storage" id="erudav2-storage-list"></div></div><div id="panel-performance" class="panel-section erudav2-hidden"><div style="display:flex;gap:12px"><div>FPS: <span id="erudav2-fps">—</span></div><div>Mem: <span id="erudav2-mem">—</span></div></div><canvas id="erudav2-perf" width="700" height="80" style="margin-top:8px"></canvas></div><div id="panel-sources" class="panel-section erudav2-hidden"><div class="erudav2-network-list" id="erudav2-sources-list"></div><pre id="erudav2-sources-view" style="white-space:pre-wrap;max-height:400px;overflow:auto;margin-top:8px;background:#07101a;padding:8px;border-radius:6px"></pre></div><div id="panel-features" class="panel-section erudav2-hidden"><h4>ErudaV2 PRO — Features</h4><ul><li>All-request capture: XHR, fetch, beacon, websockets, resources, form submits</li><li>Replay & edit requests (same-origin/CORS)</li><li>Request inspector: headers, body, response preview</li><li>IndexedDB / SessionStorage / LocalStorage / Cookies viewer</li><li>Performance timeline & resource timing</li><li>Console REPL + history & $_</li></ul></div></div><div class="erudav2-footer">ErudaV2 PRO — by Rex</div>';
    document.body.appendChild(panel);

    // wiring tabs
    var tabButtons = panel.querySelectorAll('.erudav2-tabs button');
    var sections = panel.querySelectorAll('.panel-section');
    tabButtons.forEach(function(b){ b.addEventListener('click', function(){ tabButtons.forEach(x=>x.classList.remove('active')); b.classList.add('active'); var sel=b.getAttribute('data-panel'); sections.forEach(s=>s.classList.add('erudav2-hidden')); var target = panel.querySelector('#panel-'+sel); if(target) target.classList.remove('erudav2-hidden'); }) });

    // console hook
    var logEl = panel.querySelector('#erudav2-log');
    function appendLog(msg, cls){ try{ var d=document.createElement('div'); d.className='item '+(cls||''); d.textContent='['+new Date().toLocaleTimeString()+'] '+msg; logEl.appendChild(d); logEl.scrollTop = logEl.scrollHeight; }catch(e){} }
    ['log','info','warn','error','debug'].forEach(function(m){ var orig=console[m].bind(console); console[m]=function(){ try{ appendLog(Array.from(arguments).map(a=>safeString(a)).join(' '), m==='warn'?'warn':m==='error'?'error':''); }catch(e){}; orig.apply(console, arguments); }; });

    // console eval
    var input = panel.querySelector('#erudav2-input'); var runBtn = panel.querySelector('#erudav2-run'); var clearBtn = panel.querySelector('#erudav2-clear'); var lastEval;
    function runInput(){ var code=input.value.trim(); if(!code) return; try{ var res=eval(code); lastEval=res; window.$_ = res; appendLog('=> '+safeString(res)); }catch(e){ appendLog('Error: '+e,'error'); } input.value=''; }
    runBtn.addEventListener('click', runInput); input.addEventListener('keydown', function(e){ if(e.key==='Enter') runInput(); }); clearBtn.addEventListener('click', function(){ logEl.innerHTML=''; });

    // network UI
    var netList = panel.querySelector('#erudav2-network-list'); var filterInput = panel.querySelector('#erudav2-filter');
    function renderRecord(rec){
      var el = document.createElement('div'); el.className='erudav2-network-row'; el.dataset.id = rec.id;
      el.innerHTML = '<div><strong>'+ (rec.method||rec.type||'') + ' ' + (rec.url||rec.name||'') + '</strong></div><div class="meta">'+ (rec.status || '') + ' • ' + (rec.duration?rec.duration+'ms':'') + ' • ' + (rec.type||'') + ' • ' + rec.startedDateTime + '</div>';
      el.addEventListener('click', function(){ showDetail(rec.id); panel.querySelectorAll('.erudav2-network-row').forEach(x=>x.style.background=''); el.style.background='rgba(255,255,255,0.02)'; });
      return el;
    }

    recorder.onadd = function(rec){ try{ var f = filterInput.value.trim().toLowerCase(); if(!f || (rec.url && rec.url.toLowerCase().includes(f)) || (rec.method && rec.method.toLowerCase().includes(f))){ var node = renderRecord(rec); netList.prepend(node); } }catch(e){} };
    recorder.onclear = function(){ netList.innerHTML=''; };

    filterInput.addEventListener('input', function(){ var f=filterInput.value.trim().toLowerCase(); netList.innerHTML=''; recorder.records.forEach(function(r){ if(!f || (r.url && r.url.toLowerCase().includes(f)) || (r.method && r.method.toLowerCase().includes(f))) netList.appendChild(renderRecord(r)); }); });

    panel.querySelector('#erudav2-net-clear').addEventListener('click', function(){ recorder.clear(); });

    // requests tab
    var reqList = panel.querySelector('#erudav2-requests-list');
    function refreshRequests(){ reqList.innerHTML=''; recorder.records.filter(r=>r.type==='xhr' || r.type==='fetch' || r.type==='beacon').forEach(function(r){ var el = renderRecord(r); reqList.appendChild(el); }); }
    panel.querySelector('#erudav2-replay').addEventListener('click', function(){ var sel = panel.querySelector('.erudav2-network-row[style*="rgba(255,255,255,0.02)"]'); if(!sel) return alert('Select a request first'); var id=sel.dataset.id; var rec = recorder.find(id); if(rec){ try{ if(rec.method && rec.url){ fetch(rec.url, { method: rec.method, headers: rec.request && rec.request.headers || {}, body: rec.request && rec.request.body || undefined, mode:'cors' }).then(r=>alert('Replayed — response status '+r.status)).catch(e=>alert('Replay failed: '+e)); } }catch(e){ alert('Replay error: '+e); } } });

    panel.querySelector('#erudav2-edit').addEventListener('click', function(){ var sel = panel.querySelector('.erudav2-network-row[style*="rgba(255,255,255,0.02)"]'); if(!sel) return alert('Select a request first'); var id=sel.dataset.id; var rec = recorder.find(id); if(!rec) return; var newBody = prompt('Edit request body (JSON/text). Leave empty to keep original', rec.request && rec.request.body? (typeof rec.request.body==='string'?rec.request.body:JSON.stringify(rec.request.body)): ''); if(newBody!==null){ fetch(rec.url, { method: rec.method, headers: rec.request && rec.request.headers || {}, body: newBody }).then(r=>{ alert('Resent — status '+r.status); }).catch(e=>alert('Resend failed: '+e)); } });

    panel.querySelector('#erudav2-export-har').addEventListener('click', function(){ try{ var har = {log:{version:'1.2',creator:{name:'ErudaV2 PRO',version:'1.0'},entries: recorder.records.map(function(r){ return {startedDateTime: r.startedDateTime || nowISO(), time: r.duration || 0, request:{method: r.method || 'GET', url: r.url || r.name || ''}, response:{status: r.status || 0}}; })}}; var blob = new Blob([JSON.stringify(har,null,2)],{type:'application/json'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='erudav2-pro.har'; a.click(); URL.revokeObjectURL(a.href); }catch(e){ alert('Export failed: '+e); } });

    // show detail panel (simple modal)
    function showDetail(id){
      var rec = recorder.find(id); if(!rec) return;
      var win = window.open('','_blank','noopener');
      win.document.title = 'ErudaV2 Request — '+id;
      var pre = win.document.createElement('pre'); pre.style.whiteSpace='pre-wrap'; pre.style.fontFamily='monospace'; pre.textContent = JSON.stringify(rec, null, 2);
      win.document.body.appendChild(pre);
    }

    // resources panel: show performance entries
    var resList = panel.querySelector('#erudav2-resources-list');
    recorder.onadd = function(rec){ try{ // append to resources if resource timing or resource types
        if(rec.type==='resource-timing' || ['img','script','link','resource'].includes(rec.type)) { var node = document.createElement('div'); node.className='item'; node.textContent = (rec.name||rec.url||'') + ' • ' + (rec.initiatorType||rec.type||'') + ' • ' + (rec.transferSize||''); resList.prepend(node); }
        // also keep network list updated via netList handler above
      }catch(e){} };

    // elements inspect (reuse simpler logic)
    var inspectBtn = panel.querySelector('#erudav2-inspect'); var tree = panel.querySelector('#erudav2-tree');
    var selecting=false, highlighted=null;
    inspectBtn.addEventListener('click', function(){ selecting=!selecting; inspectBtn.textContent = selecting? 'Stop' : 'Inspect'; if(selecting) document.body.addEventListener('pointerdown', onPick, true); else document.body.removeEventListener('pointerdown', onPick, true); });
    function onPick(e){ e.preventDefault(); e.stopPropagation(); selecting=false; inspectBtn.textContent='Inspect'; document.body.removeEventListener('pointerdown', onPick, true); var el=e.target; if(highlighted){ highlighted.style.outline = highlighted.__eruda_old_o||''; delete highlighted.__eruda_old_o; } highlighted = el; highlighted.__eruda_old_o = highlighted.style.outline || ''; highlighted.style.outline = '3px solid rgba(31,143,255,0.95)'; showTree(el); }
    function showTree(el){ tree.innerHTML=''; function nodeFor(e,depth){ var nd=document.createElement('div'); nd.className='item'; nd.textContent = '<'+e.tagName.toLowerCase() + (e.id? (' #' + e.id):'') + (e.className?(' .'+e.className.split(' ').join('.')):'') + '>'; nd.addEventListener('click', function(ev){ ev.stopPropagation(); if(highlighted){ highlighted.style.outline = highlighted.__eruda_old_o||''; } highlighted = e; highlighted.__eruda_old_o = highlighted.style.outline || ''; highlighted.style.outline='3px solid rgba(31,143,255,0.95)'; }); if(depth>0 && e.children && e.children.length){ var sub=document.createElement('div'); sub.style.paddingLeft='10px'; Array.from(e.children).slice(0,30).forEach(function(c){ sub.appendChild(nodeFor(c, depth-1)); }); nd.appendChild(sub);} return nd;} tree.appendChild(nodeFor(el,4)); }

    // storage: local/session/indexeddb/cookies viewer (basic)
    var storeBtns = panel.querySelectorAll('.store-btn'); var storeList = panel.querySelector('#erudav2-storage-list');
    storeBtns.forEach(function(b){ b.addEventListener('click', function(){ storeBtns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); showStore(b.getAttribute('data-store')); }); });
    function showStore(kind){
      storeList.innerHTML='';
      if(kind==='local'){ for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i), v=localStorage.getItem(k); var r=document.createElement('div'); r.className='item'; r.textContent = k+' = '+v; storeList.appendChild(r); } }
      else if(kind==='session'){ for(var i=0;i<sessionStorage.length;i++){ var k=sessionStorage.key(i), v=sessionStorage.getItem(k); var r=document.createElement('div'); r.className='item'; r.textContent = k+' = '+v; storeList.appendChild(r); } }
      else if(kind==='cookies'){ var cookies=document.cookie.split(';').map(s=>s.trim()).filter(Boolean); cookies.forEach(function(c){ var r=document.createElement('div'); r.className='item'; r.textContent=c; storeList.appendChild(r); }); }
      else if(kind==='indexeddb'){ var d = document.createElement('div'); d.textContent = 'IndexedDB list (loading...)'; storeList.appendChild(d); try{ var req = indexedDB.databases ? indexedDB.databases() : Promise.resolve([]); req.then(function(dbs){ storeList.innerHTML=''; dbs.forEach(function(db){ var r=document.createElement('div'); r.className='item'; r.textContent = db.name + ' — ' + (db.version||'v?'); storeList.appendChild(r); }); }).catch(function(e){ storeList.innerHTML='Error listing IndexedDB: '+e; }); }catch(e){ storeList.innerHTML='IndexedDB not accessible: '+e; } }
    }

    // performance
    (function perfLoop(){ var fpsEl = panel.querySelector('#erudav2-fps'), memEl = panel.querySelector('#erudav2-mem'), canvas = panel.querySelector('#erudav2-perf'), ctx = canvas.getContext('2d'); var last = performance.now(), frames=0; function tick(now){ frames++; var dt = now - last; if(dt>=500){ var fps = Math.round((frames/dt)*1000); fpsEl.textContent = fps; frames=0; last=now; ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='rgba(31,143,255,0.9)'; var h = Math.max(1, Math.min(canvas.height, fps)); ctx.fillRect(0, canvas.height - h, canvas.width, h); } if(performance && performance.memory) memEl.textContent = Math.round(performance.memory.usedJSHeapSize/1024/1024)+' MB'; else memEl.textContent='n/a'; requestAnimationFrame(tick); } requestAnimationFrame(tick); })();

    // sources: gather scripts
    function gatherSources(){ var sl=panel.querySelector('#erudav2-sources-list'), view=panel.querySelector('#erudav2-sources-view'); sl.innerHTML=''; view.textContent=''; var scripts=Array.from(document.scripts); scripts.forEach(function(s,idx){ var item=document.createElement('div'); item.className='item'; item.textContent = s.src ? 'script: '+s.src : 'inline #'+(idx+1); item.addEventListener('click', async function(){ sl.querySelectorAll('.selected').forEach(n=>n.classList.remove('selected')); item.classList.add('selected'); var content=''; if(s.src){ try{ var res = await fetch(s.src, {cache:'no-store'}); content = await res.text(); }catch(e){ content = 'Could not fetch: '+e; } } else content = s.textContent; view.textContent = content; }); sl.appendChild(item); }); }
    gatherSources();

    // close button
    panel.querySelector('#erudav2-close').addEventListener('click', function(){ panel.classList.add('erudav2-hidden'); });

    // expose API
    window.ErudaV2Pro = {
      open: function(){ panel.classList.remove('erudav2-hidden'); },
      close: function(){ panel.classList.add('erudav2-hidden'); },
      toggle: function(){ panel.classList.toggle('erudav2-hidden'); },
      getRecords: function(){ return recorder.records.slice(); },
      clearRecords: function(){ recorder.clear(); }
    };

    return panel;
  }

  var gear = createGear();
  var panel = null;
  gear.addEventListener('click', function(){ if(!panel) panel = buildUI(); panel.classList.toggle('erudav2-hidden'); });

  // auto open if ?debug=true
  try{ if(location.search.indexOf('debug=true')!==-1 || AUTO_OPEN_ON_DEBUG) gear.click(); }catch(e){}

  console.log('ErudaV2 PRO injected — call window.ErudaV2Pro.toggle()');

})();
