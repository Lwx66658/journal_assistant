const icons = {
  grid: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M8 7h8M8 11h6"/></svg>',
  users: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18M7 16l4-5 3 3 5-7"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.55 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3v-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3h4v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.5 1H21v4h-.09a1.7 1.7 0 0 0-1.51 1Z"/></svg>',
  logout: '<svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M14 21h-4"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>',
  userPlus: '<svg viewBox="0 0 24 24"><path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6"/></svg>',
  dots: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></svg>'
};

let employees = [
  { id: 1, username: 'linmo', name: '林默', role: '责任编辑', avatar: '林', color: 'purple' },
  { id: 2, username: 'zhouxiao', name: '周晓', role: '文字编辑', avatar: '周', color: 'blue' },
  { id: 3, username: 'chenxu', name: '陈叙', role: '设计编辑', avatar: '陈', color: 'green' },
  { id: 4, username: 'xuyan', name: '许言', role: '审校编辑', avatar: '许', color: 'rose' },
  { id: 5, username: 'tangtang', name: '唐棠', role: '文字编辑', avatar: '唐', color: 'orange' }
];

let publications = [];
let currentPage = 'dashboard';
let searchTerm = '';
let currentEmployee = null;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let authToken = sessionStorage.getItem('kanxing_token');
async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...options.headers }
  });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') logout();
    throw new Error(result.error || '请求失败');
  }
  return result;
}
async function refreshData() {
  [employees, publications] = await Promise.all([api('/employees'), api('/publications')]);
}
function reportError(error) { showToast(error.message || '操作失败，请稍后重试'); }
const employeeById = id => employees.find(item => item.id === Number(id));
const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
const avatar = person => person ? `<i class="avatar avatar--${escapeHTML(person.color)}">${escapeHTML(person.avatar)}</i>` : '';
const cover = (pub, index = 0) => `<span class="book-cover cover-${Number(pub.cover ?? index % 5) % 5}">${escapeHTML(pub.title.slice(0,1))}</span>`;
const pubMain = (pub, index) => `<div class="pub-main">${cover(pub,index)}<span class="pub-copy"><strong>${escapeHTML(pub.title)}</strong><small>${escapeHTML(pub.code)} · ${escapeHTML(pub.type)}</small></span></div>`;
const employeeReportList = (pub, limit = 3) => pub.assignments.length
  ? `<div class="employee-report-list">${pub.assignments.slice(0,limit).map(a => { const p=employeeById(a.employeeId); return `<span class="employee-report-tag"><b>${escapeHTML(p?.name || '未知员工')}</b><i>${escapeHTML(a.topic || '尚未提交主题')}</i></span>`; }).join('')}${pub.assignments.length > limit ? `<small>+${pub.assignments.length-limit}</small>` : ''}</div>`
  : '<span class="unassigned-text">尚未分配员工</span>';
const filteredPublications = () => publications.filter(pub => !searchTerm || `${pub.title}${pub.code}${pub.type}${pub.assignments.map(a => `${employeeById(a.employeeId)?.name}${a.topic || ''}${a.note || ''}`).join('')}`.toLowerCase().includes(searchTerm.toLowerCase()));

function hydrateIcons(root = document) {
  $$('[data-icon]', root).forEach(el => { el.innerHTML = icons[el.dataset.icon] || ''; });
}

function showToast(message) {
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  $('#toastRoot').appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

function renderDashboard() {
  const allAssignments = publications.flatMap(pub => pub.assignments);
  const reportCount = allAssignments.filter(assignment => assignment.topic).length;
  const todayCount = allAssignments.filter(assignment => assignment.updatedAt?.startsWith(formatNow().slice(0, 10))).length;
  const missingCount = allAssignments.length - reportCount;
  return `
    <section class="welcome-row">
      <div><h2>早上好，内容管理员</h2><p>这里是今天的出版工作概览，当前已收到 ${reportCount} 份员工进度报告。</p></div>
      <div class="button-row"><button class="secondary-button" data-nav="progress">${icons.chart} 查看报告</button><button class="primary-button" data-action="create">${icons.plus} 创建书刊</button></div>
    </section>
    <section class="stats-grid">
      ${statCard('book','orange','书刊总数',publications.length,'本','当前项目')}
      ${statCard('users','blue','员工任务',allAssignments.length,'项',`涉及 ${new Set(allAssignments.map(a => a.employeeId)).size} 位员工`)}
      ${statCard('chart','amber','今日更新',todayCount,'份','员工最新提交')}
      ${statCard('grid','green','待填写主题',missingCount,'项','按员工任务统计',missingCount ? '' : 'up')}
    </section>
    <section class="dashboard-grid">
      <div class="panel">
        <div class="panel-header"><div><h3>近期书刊</h3><p>按截止时间查看员工最新报告</p></div><button class="text-button" data-nav="publications">查看全部 →</button></div>
        <div class="publication-list">${filteredPublications().slice(0,4).map((pub,i) => publicationRow(pub,i)).join('') || emptyState()}</div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><h3>最新动态</h3><p>团队最近的工作记录</p></div><button class="icon-button">${icons.dots}</button></div>
        <div class="activity-list">
          ${publications.flatMap(pub => pub.assignments.filter(a => a.updatedAt).map(a => ({ pub, assignment: a }))).sort((a,b) => b.assignment.updatedAt.localeCompare(a.assignment.updatedAt)).slice(0,4).map(({pub,assignment}) => { const person = employeeById(assignment.employeeId); return activity(person, person?.name || '员工', `更新了《${pub.title}》的进度`, assignment.updatedAt); }).join('') || '<p class="muted">暂无员工进度动态</p>'}
        </div>
      </div>
    </section>`;
}

function statCard(iconName, color, title, value, unit, note, noteClass='') {
  return `<article class="stat-card"><div class="stat-card__head"><span>${title}</span><span class="stat-icon stat-icon--${color}">${icons[iconName]}</span></div><strong class="stat-value">${value}<small style="font-size:11px;font-weight:500;margin-left:4px">${unit}</small></strong><span class="stat-note ${noteClass}">${note}</span></article>`;
}
function publicationRow(pub,index) {
  return `<article class="publication-row"><button type="button" class="publication-open" data-open="${pub.id}" aria-label="查看《${escapeHTML(pub.title)}》详情">${pubMain(pub,index)}</button>${employeeReportList(pub)}<span class="deadline-copy">截止 ${pub.deadline.slice(5).replace('-','/')}</span></article>`;
}
function activity(person,name,text,time) { return `<div class="activity-item">${avatar(person)}<div class="activity-copy"><p><strong>${escapeHTML(name)}</strong> ${escapeHTML(text)}</p><small>${escapeHTML(time)}</small></div></div>`; }
function emptyState() { return '<div class="empty-state"><span>⌕</span>没有找到符合条件的书刊</div>'; }

function renderPublications() {
  const items = filteredPublications();
  return `${pageToolbar('书刊管理','创建、查看并管理全部书刊','创建书刊')}
  <div class="data-panel"><table class="data-table"><thead><tr><th>书刊信息</th><th>员工最新报告主题</th><th>截止日期</th><th>操作</th></tr></thead><tbody>
  ${items.map((pub,i) => `<tr><td><button type="button" class="publication-open" data-open="${pub.id}" aria-label="查看《${escapeHTML(pub.title)}》详情">${pubMain(pub,i)}</button></td><td>${employeeReportList(pub,5)}</td><td>${escapeHTML(pub.deadline)}</td><td><div class="action-cell"><button class="table-action" title="编辑" data-edit="${pub.id}">${icons.edit}</button><button class="table-action" title="分配员工" data-assign="${pub.id}">${icons.userPlus}</button><button class="table-action" title="删除" data-delete="${pub.id}">×</button></div></td></tr>`).join('') || `<tr><td colspan="4">${emptyState()}</td></tr>`}
  </tbody></table></div>`;
}

function renderAssignments() {
  return `${pageToolbar('任务分配','为每一本书刊选择参与协作的员工','', false)}
  <section class="assignment-cards">${filteredPublications().map((pub,i) => `<article class="assignment-card"><div class="assignment-card__top">${cover(pub,i)}<div><h3>${escapeHTML(pub.title)}</h3><p>${escapeHTML(pub.code)} · 截止 ${escapeHTML(pub.deadline)}</p></div><button class="secondary-button" data-assign="${pub.id}">${icons.userPlus} 分配</button></div><div class="assigned-list">${pub.assignments.length ? pub.assignments.map(a => { const p=employeeById(a.employeeId); return `<span class="employee-chip">${avatar(p)} ${escapeHTML(p?.name || '未知员工')} · ${escapeHTML(a.topic || '尚未提交主题')}</span>`; }).join('') : '<span class="muted" style="font-size:10px">尚未分配员工</span>'}</div></article>`).join('') || emptyState()}</section>`;
}

function renderProgress() {
  return `${pageToolbar('进度报告','按书刊查看每位员工提交的最新主题与备注','', false)}
  <section class="progress-board">${filteredPublications().map((pub,i) => `<article class="progress-book"><header class="progress-book__head">${cover(pub,i)}<span><strong>${escapeHTML(pub.title)}</strong><small>${escapeHTML(pub.code)} · 截止 ${escapeHTML(pub.deadline)}</small></span><span class="assignment-count">${pub.assignments.length} 位员工</span></header><div class="employee-reports">${pub.assignments.length ? pub.assignments.map(a => { const p=employeeById(a.employeeId); return `<article class="employee-report">${avatar(p)}<div class="employee-report__content"><header><span><strong>${escapeHTML(p?.name || '未知员工')}</strong><small>${escapeHTML(p?.role || '')}</small></span><time>${escapeHTML(a.updatedAt || '尚未提交')}</time></header><h4>${escapeHTML(a.topic || '尚未提交进度主题')}</h4><p>${escapeHTML(a.note || '暂无备注信息')}</p></div></article>`; }).join('') : '<div class="employee-report employee-report--empty"><span class="muted">尚未分配员工，请先前往任务分配。</span></div>'}</div></article>`).join('') || emptyState()}</section>`;
}

function renderEmployeeWorkspace() {
  const tasks = publications
    .map((pub, index) => ({ pub, index, assignment: pub.assignments.find(item => item.employeeId === currentEmployee.id) }))
    .filter(item => item.assignment);
  const reportedCount = tasks.filter(item => item.assignment.topic).length;
  const todayCount = tasks.filter(item => item.assignment.updatedAt?.startsWith(formatNow().slice(0, 10))).length;
  const pendingCount = tasks.length - reportedCount;

  $('#employeeContent').innerHTML = `
    <section class="employee-welcome">
      <div><p class="eyebrow eyebrow--orange">MY PUBLICATIONS</p><h2>${escapeHTML(currentEmployee.name)}，今天也辛苦了</h2><p>你当前负责 ${tasks.length} 本书刊，请用主题概括最新进度，并补充必要备注。</p></div>
      <span class="employee-date">${formatNow().slice(0, 10).replaceAll('-', ' / ')}</span>
    </section>
    <section class="employee-summary" aria-label="任务概览">
      <article><span>负责书刊</span><strong>${tasks.length}</strong><small>本</small></article>
      <article><span>已提交报告</span><strong>${reportedCount}</strong><small>份</small></article>
      <article><span>今日更新</span><strong>${todayCount}</strong><small>份</small></article>
      <article><span>待填写主题</span><strong>${pendingCount}</strong><small>项</small></article>
    </section>
    <section class="employee-section-head"><div><h3>我的最新进度报告</h3><p>每本书刊保留一份最新报告；保存新的主题与备注后会覆盖上次内容。</p></div><span>${tasks.length} 项任务</span></section>
    <section class="employee-task-list">
      ${tasks.map(({ pub, index, assignment }) => employeeTaskCard(pub, assignment, index)).join('') || '<div class="panel employee-empty"><strong>暂时没有分配给你的书刊</strong><p>管理员分配任务后，会在这里显示。</p></div>'}
    </section>`;

  $$('.employee-task-form').forEach(form => {
    form.onsubmit = async event => {
      event.preventDefault();
      const pub = publications.find(item => item.id === Number(form.dataset.pub));
      const data = new FormData(form);
      try {
        await api(`/publications/${pub.id}/report`, { method: 'PUT', body: JSON.stringify({ topic: String(data.get('topic') || '').trim(), note: String(data.get('note') || '').trim() }) });
        await refreshData();
        renderEmployeeWorkspace();
        showToast(`《${pub.title}》的最新进度报告已保存`);
      } catch (error) { reportError(error); }
    };
  });
}

function employeeTaskCard(pub, assignment, index) {
  const topic = escapeHTML(assignment.topic || '');
  const note = escapeHTML(assignment.note || '');
  return `<form class="employee-task-card employee-task-form" data-pub="${pub.id}">
    <header class="employee-task-card__head">
      ${cover(pub, index)}
      <div class="employee-task-title"><span class="publication-type">${escapeHTML(pub.type)}</span><h3>${escapeHTML(pub.title)}</h3><p>${escapeHTML(pub.code)}</p></div>
      <span class="deadline-badge"><small>截止日期</small><strong>${escapeHTML(pub.deadline)}</strong></span>
    </header>
    <div class="employee-task-card__body">
      <label class="employee-field employee-field--topic"><span>进度主题</span><input name="topic" value="${topic}" maxlength="60" placeholder="例如：第三章初稿已完成" required /></label>
      <label class="employee-field employee-field--note"><span>进度备注 <small>（选填）</small></span><textarea name="note" maxlength="300" placeholder="补充当前进展、待协调事项或交付说明…">${note}</textarea></label>
    </div>
    <footer class="employee-task-card__footer"><span>${assignment.updatedAt ? `上次保存：${escapeHTML(assignment.updatedAt)}` : '尚未提交进度报告'}</span><button type="submit" class="primary-button">保存最新报告 ${icons.arrow}</button></footer>
  </form>`;
}

function formatNow() {
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function pageToolbar(title, subtitle, buttonText='', showFilter=true) {
  return `<section class="page-toolbar"><div class="toolbar-title"><h2>${title}</h2><p>${subtitle}</p></div><label class="toolbar-search">${icons.search}<input class="page-search" value="${escapeHTML(searchTerm)}" placeholder="搜索书刊…" /></label>${showFilter ? '<select class="filter-select page-filter"><option value="">全部类型</option><option>图书</option><option>期刊</option></select>' : ''}${buttonText ? `<button class="primary-button" data-action="create">${icons.plus} ${buttonText}</button>` : ''}</section>`;
}

function renderPage() {
  const titles = { dashboard:['工作台','今天也一起把好内容认真完成。'], publications:['书刊管理','统一管理全部出版项目。'], assignments:['任务分配','把合适的任务交给合适的人。'], progress:['进度报告','逐本查看每位员工的最新主题与备注。'] };
  $('#pageTitle').textContent = titles[currentPage][0];
  $('#pageSubtitle').textContent = titles[currentPage][1];
  const renderer = { dashboard:renderDashboard, publications:renderPublications, assignments:renderAssignments, progress:renderProgress }[currentPage];
  $('#pageContent').innerHTML = renderer();
  $$('.nav-item[data-page]').forEach(btn => btn.classList.toggle('active', btn.dataset.page === currentPage));
  bindPageEvents();
}

function bindPageEvents() {
  $$('[data-nav]').forEach(btn => btn.onclick = () => navigate(btn.dataset.nav));
  $$('[data-open]').forEach(btn => btn.onclick = () => openPublicationDetails(Number(btn.dataset.open)));
  $$('[data-action="create"]').forEach(btn => btn.onclick = () => openPublicationModal());
  $$('[data-edit]').forEach(btn => btn.onclick = () => openPublicationModal(Number(btn.dataset.edit)));
  $$('[data-assign]').forEach(btn => btn.onclick = () => openAssignmentModal(Number(btn.dataset.assign)));
  $$('[data-delete]').forEach(btn => btn.onclick = () => deletePublication(Number(btn.dataset.delete)));
  $$('.page-search').forEach(input => input.oninput = e => { searchTerm=e.target.value; renderPage(); const active=$('.page-search'); active?.focus(); active?.setSelectionRange(active.value.length,active.value.length); });
  $$('.page-filter').forEach(select => select.onchange = e => filterVisibleCards(e.target.value, 'type'));
}

function filterVisibleCards(value, mode) {
  if (!value) return renderPage();
  const original = publications;
  publications = original.filter(pub => mode === 'type' ? pub.type === value : true);
  const html = currentPage === 'progress' ? renderProgress() : renderPublications();
  $('#pageContent').innerHTML = html;
  publications = original;
  bindPageEvents();
  const sel = $('.page-filter'); if(sel) sel.value=value;
}

function navigate(page) {
  currentPage = page; searchTerm=''; renderPage(); $('.sidebar').classList.remove('open');
}

function openPublicationDetails(id) {
  const pub = publications.find(item => item.id === id);
  if (!pub) return;
  $('#modalRoot').innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${escapeHTML(pub.title)}详情"><header class="modal-header"><h3>${escapeHTML(pub.title)}</h3><button type="button" class="icon-button modal-close" aria-label="关闭">×</button></header><div class="modal-body publication-details"><p><strong>编号：</strong>${escapeHTML(pub.code)} · ${escapeHTML(pub.type)}</p><p><strong>截止日期：</strong>${escapeHTML(pub.deadline)}</p><p><strong>备注：</strong>${escapeHTML(pub.note || '暂无备注')}</p><h4>员工进度</h4>${pub.assignments.length ? pub.assignments.map(a => { const person = employeeById(a.employeeId); return `<article class="detail-report"><strong>${escapeHTML(person?.name || '未知员工')}</strong><span>${escapeHTML(a.topic || '尚未提交主题')}</span><p>${escapeHTML(a.note || '暂无备注')}</p></article>`; }).join('') : '<p>尚未分配员工</p>'}</div><footer class="modal-footer"><button type="button" class="secondary-button" data-detail-assign>分配员工</button><button type="button" class="primary-button" data-detail-edit>编辑书刊</button></footer></section></div>`;
  bindModalClose();
  $('[data-detail-assign]').onclick = () => openAssignmentModal(id);
  $('[data-detail-edit]').onclick = () => openPublicationModal(id);
  $('.modal-close').focus();
}

function openPublicationModal(id = null) {
  const pub = publications.find(item => item.id === id);
  $('#modalRoot').innerHTML = `<div class="modal-backdrop"><form class="modal" id="publicationForm"><header class="modal-header"><h3>${pub?'编辑书刊':'创建新书刊'}</h3><button type="button" class="icon-button modal-close">×</button></header><div class="modal-body"><div class="form-grid">
    <label class="field field--full">书刊名称<input name="title" value="${escapeHTML(pub?.title||'')}" placeholder="例如：城市与微光" required /></label>
    <label class="field">书刊编号<input name="code" value="${escapeHTML(pub?.code||'')}" placeholder="BOOK-2026-001" required /></label>
    <label class="field">类型<select name="type"><option ${pub?.type==='图书'?'selected':''}>图书</option><option ${pub?.type==='期刊'?'selected':''}>期刊</option></select></label>
    <label class="field field--full">截止日期<input type="date" name="deadline" value="${pub?.deadline||new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)}" required /></label>
    <label class="field field--full">备注<textarea name="note" placeholder="简单描述这本书刊…">${escapeHTML(pub?.note||'')}</textarea></label>
  </div></div><footer class="modal-footer"><button type="button" class="secondary-button modal-close">取消</button><button type="submit" class="primary-button">${pub?'保存修改':'确认创建'}</button></footer></form></div>`;
  bindModalClose();
  $('#publicationForm').onsubmit = async e => {
    e.preventDefault(); const data=Object.fromEntries(new FormData(e.target));
    try {
      await api(pub ? `/publications/${pub.id}` : '/publications', { method: pub ? 'PUT' : 'POST', body: JSON.stringify({ ...data, cover: publications.length % 5 }) });
      await refreshData(); closeModal(); renderPage(); showToast(pub?'书刊信息已更新':'新书刊已创建');
    } catch (error) { reportError(error); }
  };
}

function openAssignmentModal(id) {
  const pub = publications.find(item => item.id === id);
  const selected = new Set(pub.assignments.map(a => a.employeeId));
  $('#modalRoot').innerHTML = `<div class="modal-backdrop"><form class="modal" id="assignmentForm"><header class="modal-header"><div><h3>分配员工</h3><p class="muted" style="margin:5px 0 0;font-size:10px">${escapeHTML(pub.title)}</p></div><button type="button" class="icon-button modal-close">×</button></header><div class="modal-body"><div class="people-picker">${employees.map(p => `<label class="person-option">${avatar(p)}<span><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.role)}</small></span><input type="checkbox" name="employee" value="${p.id}" ${selected.has(p.id)?'checked':''} /></label>`).join('')}</div></div><footer class="modal-footer"><button type="button" class="secondary-button modal-close">取消</button><button type="submit" class="primary-button">保存分配</button></footer></form></div>`;
  bindModalClose();
  $('#assignmentForm').onsubmit = async e => {
    e.preventDefault(); const ids=[...new FormData(e.target).getAll('employee')].map(Number);
    try {
      await api(`/publications/${id}/assignments`, { method: 'PUT', body: JSON.stringify({ employeeIds: ids }) });
      await refreshData(); closeModal(); renderPage(); showToast(`已更新《${pub.title}》的员工分配`);
    } catch (error) { reportError(error); }
  };
}
async function deletePublication(id) {
  const pub = publications.find(item => item.id === id);
  if (!pub || !confirm(`确定删除《${pub.title}》及其任务报告吗？`)) return;
  try {
    await api(`/publications/${id}`, { method: 'DELETE' });
    await refreshData(); renderPage(); showToast('书刊已删除');
  } catch (error) { reportError(error); }
}
function bindModalClose() { $$('.modal-close').forEach(btn=>btn.onclick=closeModal); $('.modal-backdrop').onclick=e=>{if(e.target.classList.contains('modal-backdrop'))closeModal();}; }
function closeModal() { $('#modalRoot').innerHTML=''; }

function init() {
  hydrateIcons();
  restoreSession();
  $('#loginForm').onsubmit = async e => {
    e.preventDefault();
    const username = $('#username').value.trim().toLowerCase();
    const password = $('#password').value;
    try {
      const result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      authToken = result.token;
      sessionStorage.setItem('kanxing_token', authToken);
      await refreshData();
      if (result.user.role === 'admin') enterAdminApp();
      else enterEmployeeApp(employeeById(result.user.employeeId));
    } catch (error) { reportError(error); }
  };
  $('.eye-button').onclick = () => { const field=$('#password'); field.type=field.type==='password'?'text':'password'; };
  $('#forgotLink').onclick = e => { e.preventDefault(); showToast('演示环境统一使用密码 123456'); };
  $$('[data-demo-account]').forEach(button => button.onclick = () => {
    $('#username').value = button.dataset.demoAccount;
    $('#password').value = '123456';
    $('#username').focus();
  });
  $$('.nav-item[data-page]').forEach(btn => btn.onclick = () => navigate(btn.dataset.page));
  $('#logoutButton').onclick = logout;
  $('#employeeLogoutButton').onclick = logout;
  $('#menuButton').onclick = () => $('.sidebar').classList.toggle('open');
  $('#employeeMenuButton').onclick = () => $('.employee-sidebar').classList.toggle('open');
  $('#settingsButton').onclick = async () => {
    try { await api('/health'); showToast('数据库连接正常'); }
    catch (error) { reportError(error); }
  };
  $('#globalSearch').oninput = e => { searchTerm=e.target.value; if(currentPage==='dashboard') currentPage='publications'; renderPage(); };
}

function restoreSession() {
  if (!authToken) return;
  api('/auth/me').then(async ({ user }) => {
    await refreshData();
    if (user.role === 'admin') enterAdminApp();
    else if (employeeById(user.employeeId)) enterEmployeeApp(employeeById(user.employeeId));
  }).catch(reportError);
}

function hideAllViews() {
  $('#loginView').classList.add('is-hidden');
  $('#appView').classList.add('is-hidden');
  $('#employeeView').classList.add('is-hidden');
}

function enterAdminApp() {
  hideAllViews();
  $('#appView').classList.remove('is-hidden');
  renderPage();
}

function enterEmployeeApp(employee) {
  currentEmployee = employee;
  hideAllViews();
  $('#employeeView').classList.remove('is-hidden');
  $('#employeeSidebarAvatar').className = `avatar avatar--${employee.color}`;
  $('#employeeSidebarAvatar').textContent = employee.avatar;
  $('#employeeTopAvatar').className = `avatar avatar--${employee.color}`;
  $('#employeeTopAvatar').textContent = employee.avatar;
  $('#employeeSidebarName').textContent = employee.name;
  $('#employeeSidebarRole').textContent = employee.role;
  $('#employeeGreeting').textContent = `你好，${employee.name}`;
  renderEmployeeWorkspace();
}

function logout() {
  sessionStorage.removeItem('kanxing_token');
  authToken = null;
  currentEmployee = null;
  hideAllViews();
  $('#loginView').classList.remove('is-hidden');
  showToast('已安全退出');
}

init();
