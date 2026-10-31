'use strict';
(() => {
  const data = window.HAMBURGADA;
  const brl = cents => (cents / 100).toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
  const $ = selector => document.querySelector(selector);
  const KEY = 'hamburgada-20261031-control-v1';
  let status = {};
  let timer;
  const toast = text => { $('#toast').textContent=text; $('#toast').classList.add('visible'); clearTimeout(timer); timer=setTimeout(()=>$('#toast').classList.remove('visible'),4000); };
  function validateState(value) {
    if (!value || typeof value!=='object' || Array.isArray(value)) throw new Error('Controle inválido');
    const clean = {};
    for (const f of data.families) {
      const item = value[f.id];
      if (item && item.paid === true && typeof item.date==='string' && Number.isFinite(Date.parse(item.date))) clean[f.id]={paid:true,date:item.date};
    }
    return clean;
  }
  try { status=validateState(JSON.parse(localStorage.getItem(KEY)||'{}')); } catch { status={}; }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('Copiado! Agora cole no aplicativo do banco.'); }
    catch { const area=document.createElement('textarea');area.value=text;document.body.append(area);area.select();let ok=false;try{ok=document.execCommand('copy');}catch{}area.remove();if(ok)toast('Copiado!');else window.prompt('Copie este código:',text); }
  }
  function filter(id) {
    const family = data.families.find(f=>f.id===id);
    document.querySelectorAll('.card').forEach(card=>card.hidden=!!family && card.id!=='familia-'+id);
    document.querySelectorAll('.filters button').forEach(button=>button.setAttribute('aria-pressed', String(button.dataset.family===(family?.id||'all'))));
    $('#show-all').hidden=!family;
  }
  $('#family-filters').innerHTML='<button data-family="all" aria-pressed="true">Todas</button>'+data.families.map(f=>`<button data-family="${f.id}" aria-pressed="false">${f.name}</button>`).join('');
  $('#family-cards').innerHTML=data.families.map(f=>`<article class="card" id="familia-${f.id}" aria-labelledby="title-${f.id}"><div class="card-head"><div><h3 id="title-${f.id}">Família ${f.name}</h3><span>${f.people} pessoas no rateio</span></div><div class="family-initial" aria-hidden="true">${f.name[0]}</div></div><div class="card-body"><div class="card-total"><div><small>${f.id==='gutiara'?'Participação da família':'Valor a pagar pela família'}</small><strong>${brl(f.due)}</strong></div><span class="badge">${f.credit?'Salão abatido':'Cota da família'}</span></div>${f.credit?`<p class="credit">Cota de ${brl(f.gross)} − ${brl(f.credit)} já pagos pelo salão = <b>${brl(f.due)}</b>.</p>`:''}<div class="qr-area"><img src="${f.qr}" alt="QR Code Pix da família ${f.name}, valor ${brl(f.due)}" width="205" height="205"><span class="qr-caption">Família ${f.name} · ${brl(f.due)}</span><span class="qr-ref">Gutiara Aparecida de Almeida Ribeiro · Inter</span></div><div class="card-actions"><button class="button dark" data-pix="${f.id}" aria-label="Copiar Pix de ${brl(f.due)} da família ${f.name}">Copiar Pix com valor</button><button class="button outline" data-link="${f.id}">Link da família</button></div><details><summary>Ver código Pix Copia e Cola</summary><textarea class="payload" readonly aria-label="Pix Copia e Cola da família ${f.name}">${f.pix}</textarea></details>${f.id==='gutiara'?'<p class="own-note">Esta é a cota da própria recebedora. Não é necessário transferir para si; o QR Code fica disponível para identificar a participação da família.</p>':''}</div></article>`).join('');
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-copy-key'))copy(data.key);
    if(button.dataset.pix){const f=data.families.find(f=>f.id===button.dataset.pix);copy(f.pix);}
    if(button.dataset.link){const u=new URL(location.href);u.search='';u.searchParams.set('familia',button.dataset.link);u.hash='familias';copy(u.toString());}
    if(button.dataset.family){filter(button.dataset.family);const u=new URL(location.href);if(button.dataset.family==='all')u.searchParams.delete('familia');else u.searchParams.set('familia',button.dataset.family);history.replaceState(null,'',u);}
    if(button.dataset.toggle)toggle(button.dataset.toggle);
  });
  $('#show-all').addEventListener('click',()=>{$('[data-family="all"]').click();});
  function renderControl(){
    const received=data.families.filter(f=>f.id!=='gutiara' && status[f.id]?.paid).reduce((s,f)=>s+f.due,0);
    $('#received').textContent=brl(received);$('#pending').textContent=brl(data.transfer-received);
    $('#progress-fill').style.width=(received/data.transfer*100)+'%';$('.progress').setAttribute('aria-valuenow',String(received));
    $('#control-table tbody').innerHTML=data.families.map(f=>{const paid=status[f.id]?.paid;const own=f.id==='gutiara';const date=paid?new Date(status[f.id].date).toLocaleString('pt-BR'):'';return `<tr><th scope="row">${f.name}</th><td>${f.people}</td><td>${brl(f.gross)}</td><td>${f.credit?brl(f.credit):'—'}</td><td>${brl(f.due)}</td><td><button class="pay-toggle" data-toggle="${f.id}" aria-pressed="${!!paid}" aria-label="${paid?'Desmarcar pagamento':'Marcar como pago'}: família ${f.name}">${paid?'✓ '+(own?'Cota registrada':'Pago'):(own?'Registrar cota própria':'Marcar como pago')}</button>${paid?`<span class="pay-date">${date}</span>`:''}</td></tr>`;}).join('');
  }
  function toggle(id){
    const next={...status};if(next[id]?.paid)delete next[id];else next[id]={paid:true,date:new Date().toISOString()};
    try{localStorage.setItem(KEY,JSON.stringify(next));status=next;renderControl();toast(next[id]?'Registro salvo neste navegador.':'Marcação desfeita.');}catch{toast('Não foi possível salvar. Verifique o armazenamento do navegador.');}
  }
  function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('#export').addEventListener('click',()=>download('Hamburgada-controle.json',JSON.stringify({event:'Hamburgada-20261031',version:1,exportedAt:new Date().toISOString(),status},null,2),'application/json'));
  $('#import').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try{if(file.size>100000)throw new Error('Arquivo muito grande');const obj=JSON.parse(await file.text());if(obj.event!=='Hamburgada-20261031'||obj.version!==1)throw new Error('Este arquivo não pertence à Hamburgada');const restored=validateState(obj.status);if(!confirm('Restaurar este controle? As marcações atuais deste navegador serão substituídas.'))return;localStorage.setItem(KEY,JSON.stringify(restored));status=restored;renderControl();toast('Controle restaurado.');}catch(error){toast('Não foi possível restaurar: '+error.message);}finally{event.target.value='';}
  });
  $('#csv').addEventListener('click',()=>{const rows=[['Família','Pessoas','Cota (R$)','Salão já pago (R$)','Saldo (R$)','Controle','Data'],...data.families.map(f=>[f.name,f.people,(f.gross/100).toFixed(2).replace('.',','),(f.credit/100).toFixed(2).replace('.',','),(f.due/100).toFixed(2).replace('.',','),status[f.id]?.paid?'Pago / registrado':f.id==='gutiara'?'Cota própria':'Pendente',status[f.id]?.date||''])];download('Hamburgada-rateio.csv','\uFEFF'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n'),'text/csv;charset=utf-8');});
  $('#print').addEventListener('click',()=>window.print());
  renderControl();filter(new URLSearchParams(location.search).get('familia'));
})();
