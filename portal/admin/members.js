const MEMBER_DEMO = [
  {id:'demo-1',membershipNumber:'WMC/01234',staffId:'STF001',fullName:'Adebayo Member',workEmail:'member1@example.test',phoneNumber:'+234 800 000 0001',department:'Operations',dateJoined:'2023-02-01',status:'Active',portalAccess:'Activated'},
  {id:'demo-2',membershipNumber:'WMC/01235',staffId:'STF002',fullName:'Chioma Member',workEmail:'member2@example.test',phoneNumber:'+234 800 000 0002',department:'Technology',dateJoined:'2024-05-12',status:'Active',portalAccess:'Activated'},
  {id:'demo-3',membershipNumber:'WMC/01236',staffId:'STF003',fullName:'Tunde Member',workEmail:'member3@example.test',phoneNumber:'+234 800 000 0003',department:'Finance',dateJoined:'2025-01-20',status:'Active',portalAccess:'Not activated'},
  {id:'demo-4',membershipNumber:'WMC/01237',staffId:'STF004',fullName:'Fatima Member',workEmail:'member4@example.test',phoneNumber:'+234 800 000 0004',department:'Risk',dateJoined:'2022-09-04',status:'Suspended',portalAccess:'Activated'}
];

const state = { page:1, pageSize:25, totalPages:1, search:'', status:'', access:'', demo:false, selected:null };
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const fmtDate = value => value ? new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${value}T00:00:00`)) : '—';
const statusClass = value => String(value || '').toLowerCase().replace(/\s+/g,'-');

function setBusy(button, busy, label){
  if(!button) return;
  if(busy){button.dataset.label=button.textContent;button.disabled=true;button.textContent=label||'Working…'}
  else{button.disabled=false;button.textContent=button.dataset.label||button.textContent}
}

function openModal(id){$(id).classList.remove('hidden');document.body.classList.add('modal-open')}
function closeModal(id){$(id).classList.add('hidden');if(document.querySelectorAll('.modal-backdrop:not(.hidden)').length===0)document.body.classList.remove('modal-open')}

document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>closeModal(btn.dataset.close)));
document.querySelectorAll('.modal-backdrop').forEach(backdrop=>backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModal(backdrop.id)}));

function rowHtml(m){
  const access = m.portalAccess || 'Not activated';
  return `<tr>
    <td><strong>${esc(m.membershipNumber)}</strong><small class="table-sub">${esc(m.staffId||'No staff ID')}</small></td>
    <td><strong>${esc(m.fullName)}</strong><small class="table-sub">${esc(m.workEmail)}</small></td>
    <td>${esc(m.department||'—')}</td>
    <td><span class="access-pill ${access==='Activated'?'ready':'waiting'}">${esc(access)}</span></td>
    <td><span class="status ${statusClass(m.status)}">${esc(m.status)}</span></td>
    <td><button class="text-btn" type="button" data-view-member="${esc(m.id)}">View</button></td>
  </tr>`;
}

async function ensureAdmin(){
  if(WEMACOOP_PORTAL.demoMode){state.demo=true;$('demoBanner').classList.remove('hidden');$('adminName').textContent='Portal Administrator';$('adminInitials').textContent='PA';return true}
  try{
    const me=await PortalApi.me();
    if(me.role!=='Admin'){location.href='login.html';return false}
    if(me.mustChangePassword){location.href='../change-password.html';return false}
    $('adminName').textContent=me.fullName;$('adminInitials').textContent=me.fullName.split(' ').map(x=>x[0]).slice(0,2).join('');
    return true;
  }catch(e){location.href='login.html';return false}
}

async function loadMembers(){
  $('memberRows').innerHTML='<tr><td colspan="6">Loading…</td></tr>';
  if(state.demo){
    let rows=MEMBER_DEMO.filter(x=>!state.search||[x.membershipNumber,x.fullName,x.workEmail,x.staffId,x.department].join(' ').toLowerCase().includes(state.search.toLowerCase()));
    if(state.status)rows=rows.filter(x=>x.status===state.status);
    if(state.access)rows=rows.filter(x=>state.access==='activated'?x.portalAccess==='Activated':x.portalAccess!=='Activated');
    state.totalPages=1;renderMembers(rows,rows.length);return;
  }
  try{
    const q=new URLSearchParams({page:String(state.page),pageSize:String(state.pageSize)});
    if(state.search)q.set('search',state.search);if(state.status)q.set('status',state.status);if(state.access)q.set('access',state.access);
    const d=await PortalApi.request(`/admin/members?${q}`);
    state.totalPages=d.totalPages||1;renderMembers(d.items||[],d.total||0);
  }catch(e){showMessage($('pageMessage'),e.message,'error');$('memberRows').innerHTML='<tr><td colspan="6">Could not load members.</td></tr>'}
}

function renderMembers(rows,total){
  $('memberRows').innerHTML=rows.length?rows.map(rowHtml).join(''):'<tr><td colspan="6"><div class="empty-state">No members match the current filters.</div></td></tr>';
  $('memberCount').textContent=`${Number(total).toLocaleString()} member record${total===1?'':'s'}`;
  $('pageInfo').textContent=`Page ${state.page} of ${state.totalPages}`;
  $('prevPage').disabled=state.page<=1;$('nextPage').disabled=state.page>=state.totalPages;
  document.querySelectorAll('[data-view-member]').forEach(btn=>btn.addEventListener('click',()=>openMember(btn.dataset.viewMember)));
}

async function loadAudit(){
  if(state.demo){$('auditRows').innerHTML=`<div class="audit-item"><span>MemberUpdated</span><div><strong>Member WMC/01234 was updated.</strong><small>Portal Administrator · Today</small></div></div><div class="audit-item"><span>ActivationSent</span><div><strong>Activation invitation generated for WMC/01236.</strong><small>Portal Administrator · Yesterday</small></div></div>`;return}
  try{
    const rows=await PortalApi.request('/admin/members/audit?take=20');
    $('auditRows').innerHTML=rows.length?rows.map(x=>`<div class="audit-item"><span>${esc(x.action)}</span><div><strong>${esc(x.summary)}</strong><small>${esc(x.actorName||'Administrator')} · ${new Date(x.createdAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'})}</small></div></div>`).join(''):'<div class="empty-state">No member administration activity yet.</div>';
  }catch(e){$('auditRows').innerHTML='<div class="empty-state">Audit activity could not be loaded.</div>'}
}

function resetMemberForm(){
  $('memberForm').reset();$('memberId').value='';$('memberModalTitle').textContent='Add member';$('saveMember').textContent='Save member';$('memberFormMessage').className='form-message';$('memberFormMessage').textContent='';
}

$('addMember').addEventListener('click',()=>{resetMemberForm();openModal('memberModal');$('membershipNumber').focus()});
$('importOpen').addEventListener('click',()=>{if(state.demo)return showMessage($('pageMessage'),'CSV import is disabled in design preview mode.','info');$('importForm').reset();$('importMessage').className='form-message';openModal('importModal')});

$('memberForm').addEventListener('submit',async e=>{
  e.preventDefault();
  if(state.demo)return showMessage($('memberFormMessage'),'Changes are disabled in design preview mode.','info');
  const id=$('memberId').value;
  const body={membershipNumber:$('membershipNumber').value.trim(),staffId:$('staffId').value.trim()||null,fullName:$('fullName').value.trim(),workEmail:$('workEmail').value.trim(),phoneNumber:$('phoneNumber').value.trim()||null,department:$('department').value.trim()||null,dateJoined:$('dateJoined').value||null};
  setBusy($('saveMember'),true,'Saving…');
  try{
    await PortalApi.request(id?`/admin/members/${id}`:'/admin/members',{method:id?'PUT':'POST',body:JSON.stringify(body)});
    closeModal('memberModal');showMessage($('pageMessage'),id?'Member details updated.':'Member added to the cooperative register.','success');await loadMembers();await loadAudit();
  }catch(err){const detail=err.details?.errors;const suffix=Array.isArray(detail)?` ${detail.join(' ')}`:'';showMessage($('memberFormMessage'),`${err.message}${suffix}`,'error')}
  finally{setBusy($('saveMember'),false)}
});

$('importForm').addEventListener('submit',async e=>{
  e.preventDefault();const file=$('memberCsv').files[0];if(!file)return showMessage($('importMessage'),'Choose a CSV file first.','error');
  const button=e.currentTarget.querySelector('button[type=submit]');setBusy(button,true,'Importing…');
  try{
    const form=new FormData();form.append('file',file);
    const result=await PortalApi.request('/admin/members/import',{method:'POST',body:form});
    showMessage($('importMessage'),result.message,'success');state.page=1;await loadMembers();await loadAudit();setTimeout(()=>closeModal('importModal'),900);
  }catch(err){const errors=err.details?.errors;showMessage($('importMessage'),errors?.length?`${err.message} ${errors.slice(0,5).join(' ')}`:err.message,'error')}
  finally{setBusy(button,false)}
});

async function openMember(id){
  state.selected=id;$('memberDrawer').classList.add('open');$('memberDrawer').setAttribute('aria-hidden','false');$('drawerBackdrop').classList.remove('hidden');$('memberDetailBody').innerHTML='<div class="empty-state">Loading member…</div>';$('drawerMessage').className='form-message';
  if(state.demo){const m=MEMBER_DEMO.find(x=>x.id===id);return renderDetail({member:m,access:{activated:m.portalAccess==='Activated',isActive:m.status==='Active',isLocked:false,lastLoginAt:'2026-08-29T17:20:00Z'},audit:[]})}
  try{renderDetail(await PortalApi.request(`/admin/members/${id}`))}catch(e){showMessage($('drawerMessage'),e.message,'error')}
}

function closeDrawer(){$('memberDrawer').classList.remove('open');$('memberDrawer').setAttribute('aria-hidden','true');$('drawerBackdrop').classList.add('hidden');state.selected=null}
$('drawerClose').addEventListener('click',closeDrawer);$('drawerBackdrop').addEventListener('click',closeDrawer);

function renderDetail(d){
  const m=d.member,a=d.access||{};$('detailName').textContent=m.fullName;$('detailNumber').textContent=m.membershipNumber;
  $('memberDetailBody').innerHTML=`
    <section class="detail-section">
      <div class="detail-grid">
        <div><span>Email</span><strong>${esc(m.workEmail||'—')}</strong></div><div><span>Staff ID</span><strong>${esc(m.staffId||'—')}</strong></div>
        <div><span>Department</span><strong>${esc(m.department||'—')}</strong></div><div><span>Date joined</span><strong>${fmtDate(m.dateJoined)}</strong></div>
        <div><span>Phone</span><strong>${esc(m.phoneNumber||'—')}</strong></div><div><span>Member status</span><strong>${esc(m.status)}</strong></div>
      </div>
      <button class="secondary-compact full" id="editSelected" type="button">Edit member details</button>
    </section>
    <section class="detail-section">
      <h3>Portal access</h3>
      <div class="portal-state ${a.activated?'ready':'waiting'}"><strong>${a.activated?'Account activated':'Not yet activated'}</strong><span>${a.activated?(a.isLocked?'Account currently locked':a.isActive?'Portal access enabled':'Portal access disabled'):'Member can be sent an activation invitation.'}</span></div>
      <div class="detail-actions">
        ${!a.activated?'<button type="button" data-member-action="activation">Send activation</button>':''}
        ${a.activated?'<button type="button" data-member-action="password-reset">Send password reset</button><button type="button" data-member-action="unlock">Unlock account</button>':''}
      </div>
      ${a.lastLoginAt?`<p class="detail-note">Last login: ${new Date(a.lastLoginAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'})}</p>`:''}
    </section>
    <section class="detail-section">
      <h3>Membership status</h3>
      <div class="status-actions">
        <button type="button" class="${m.status==='Active'?'selected':''}" data-status-action="Active">Active</button>
        <button type="button" class="${m.status==='Suspended'?'selected':''}" data-status-action="Suspended">Suspend</button>
        <button type="button" class="${m.status==='Exited'?'selected':''}" data-status-action="Exited">Mark exited</button>
      </div>
      <p class="detail-note">Status changes disable or restore linked portal access. Records are retained for audit and financial history.</p>
    </section>
    <section class="detail-section">
      <h3>Recent audit</h3>
      <div class="drawer-audit">${(d.audit||[]).length?(d.audit||[]).map(x=>`<div><strong>${esc(x.action)}</strong><span>${esc(x.summary)}</span><small>${new Date(x.createdAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'})}</small></div>`).join(''):'<p class="detail-note">No recorded administrative changes yet.</p>'}</div>
    </section>`;

  $('editSelected').addEventListener('click',()=>editMember(m));
  document.querySelectorAll('[data-member-action]').forEach(btn=>btn.addEventListener('click',()=>memberAction(btn.dataset.memberAction,btn)));
  document.querySelectorAll('[data-status-action]').forEach(btn=>btn.addEventListener('click',()=>changeStatus(btn.dataset.statusAction,btn)));
}

function editMember(m){
  resetMemberForm();$('memberModalTitle').textContent='Edit member';$('saveMember').textContent='Update member';$('memberId').value=m.id;$('membershipNumber').value=m.membershipNumber||'';$('staffId').value=m.staffId||'';$('fullName').value=m.fullName||'';$('workEmail').value=m.workEmail||'';$('phoneNumber').value=m.phoneNumber||'';$('department').value=m.department||'';$('dateJoined').value=m.dateJoined||'';openModal('memberModal');
}

async function memberAction(action,button){
  if(state.demo)return showMessage($('drawerMessage'),'Portal access actions are disabled in design preview mode.','info');
  const labels={activation:'Sending…','password-reset':'Sending…',unlock:'Unlocking…'};setBusy(button,true,labels[action]);
  try{const r=await PortalApi.request(`/admin/members/${state.selected}/${action}`,{method:'POST'});showMessage($('drawerMessage'),r.message,'success');await openMember(state.selected);await loadAudit();await loadMembers()}
  catch(e){showMessage($('drawerMessage'),e.message,'error')}finally{setBusy(button,false)}
}

async function changeStatus(status,button){
  if(state.demo)return showMessage($('drawerMessage'),'Status changes are disabled in design preview mode.','info');
  const reason=status==='Active'?'Reactivated by administrator':status==='Suspended'?'Suspended by administrator':'Marked as exited by administrator';
  setBusy(button,true,'Saving…');
  try{const r=await PortalApi.request(`/admin/members/${state.selected}/status`,{method:'POST',body:JSON.stringify({status,reason})});showMessage($('drawerMessage'),r.message,'success');await openMember(state.selected);await loadMembers();await loadAudit()}
  catch(e){showMessage($('drawerMessage'),e.message,'error')}finally{setBusy(button,false)}
}

let searchTimer;
$('memberSearch').addEventListener('input',e=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{state.search=e.target.value.trim();state.page=1;loadMembers()},280)});
$('statusFilter').addEventListener('change',e=>{state.status=e.target.value;state.page=1;loadMembers()});
$('accessFilter').addEventListener('change',e=>{state.access=e.target.value;state.page=1;loadMembers()});
$('prevPage').addEventListener('click',()=>{if(state.page>1){state.page--;loadMembers()}});$('nextPage').addEventListener('click',()=>{if(state.page<state.totalPages){state.page++;loadMembers()}});

document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(x=>closeModal(x.id));closeDrawer()}});
document.querySelectorAll('[data-admin-logout]').forEach(b=>b.addEventListener('click',async()=>{try{await PortalApi.logout()}catch{}location.href='login.html'}));

(async()=>{if(await ensureAdmin()){await Promise.all([loadMembers(),loadAudit()]);const id=new URLSearchParams(location.search).get('id');if(id)openMember(id)}})();
