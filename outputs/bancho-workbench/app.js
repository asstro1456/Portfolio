(() => {
  'use strict';
  const WIDTH = 1280, HEIGHT = 900, VERSION = 1;
  const STORAGE_KEY = 'bancho-workbench-layout-v1';
  const MAX_BYTES = 5 * 1024 * 1024;
  const MAX_DATA_LENGTH = Math.ceil(MAX_BYTES / 3) * 4 + 100;
  const SPECS = {
    title: { name: '제목', min: [270, 280], size: [396, 430], fields: [
      ['kicker', '윗줄', '반쵸 더 셰프 개인 기획안'], ['headline', '영문 제목', 'BANCHO\nTHE CHEF'],
      ['subtitle', '주제', '돈테키 조작 설계'], ['description', '소개', '여러 주문이 표시된 화면을 보고,\n빠르고 정확한 조리가 중요하다고 판단했습니다.'],
      ['result', '완료 기준', '세 번 자르기, 네 조각 완성'], ['resultNote', '설계 구분', '트레일러 관찰 기반 개인 설계안']
    ] },
    photo: { name: '사진', min: [120, 100], size: [580, 358], fields: [
      ['caption', '사진 설명과 출처', '트레일러 화면 / 왼쪽의 여러 주문과 중앙의 굽기 조작을 관찰']
    ] },
    steps: { name: '조작 단계', min: [500, 300], size: [736, 342], fields: [
      ['heading', '제목', '누르고, 왕복하고, 놓기'],
      ['step1Title', '01 제목', '버튼 누르기'], ['step1Text', '01 설명', '마우스 왼쪽 버튼을 누르면\n자르기 입력이 시작됩니다.'],
      ['step2Title', '02 제목', '세로 왕복 한 번'], ['step2Text', '02 설명', '누른 상태에서 세로로 한 번\n왕복하면 1회 자르기로 셉니다.'],
      ['step3Title', '03 제목', '한 번 자른 뒤 놓아도 됨'], ['step3Text', '03 설명', '버튼 해제는 선택입니다.\n계속 누른 채 잘라도 됩니다.'],
      ['note', '아랫줄', '3회 자르기 = 4조각 / 개인 설계안이며 기존 게임의 확정 규칙이 아닙니다.']
    ] },
    table: { name: '판정 표', min: [300, 300], size: [412, 342], fields: [
      ['heading', '제목', '입력과 판정 기준'], ['caption', '표 설명', '시작 점수와 감점 조건'],
      ['r1Condition', '첫 번째 조건', '시작 수치'], ['r1Result', '첫 번째 판정', '30에서 시작'],
      ['r2Condition', '두 번째 조건', '잘못된 방향'], ['r2Result', '두 번째 판정', '자르기 미집계 / −10'],
      ['r3Condition', '세 번째 조건', '짧은 움직임'], ['r3Result', '세 번째 판정', '입력 무시'],
      ['r4Condition', '네 번째 조건', '수치가 0일 때'], ['r4Result', '네 번째 판정', '새 고기로 다시 시작'],
      ['note', '주석', '임시 개인 설계안입니다. 거리 임계값과 반복 주문 피로도는 미검증입니다.']
    ] },
    beforeafter: { name: '수정 전후', min: [544, 220], size: [544, 220], fields: [
      ['heading', '제목', '손의 부담을 줄이는 입력'], ['before', '수정 전', '길게 누르는 입력이\n불편하다는 설계 문제'],
      ['after', '수정 후', '자르기마다 놓아도 됨\n연속으로 누르기도 가능'],
      ['note', '주석', '빠르고 정확한 주문 처리의 중요성은 화면에서 추론 / 반복 주문 피로도는 미검증']
    ] }
  };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  function constrain(item) {
    const [minW, minH] = SPECS[item.type].min;
    item.w = Math.round(clamp(item.w, minW, WIDTH));
    item.h = Math.round(clamp(item.h, minH, HEIGHT));
    item.x = Math.round(clamp(item.x, 0, WIDTH - item.w));
    item.y = Math.round(clamp(item.y, 0, HEIGHT - item.h));
    item.fontScale = clamp(item.fontScale, .75, 1.5);
    return item;
  }
  function makeItem(type, id, geometry = {}) {
    const spec = SPECS[type];
    return constrain({ id, type, x: 80, y: 80, w: spec.size[0], h: spec.size[1], fontScale: 1,
      text: Object.fromEntries(spec.fields.map(([key, , value]) => [key, value])),
      ...(type === 'photo' ? { imageKey: 'gameplay', fit: 'contain' } : {}), ...geometry });
  }
  function initialState() {
    const items = [
      makeItem('title', 'title-1', { x: 48, y: 48 }),
      makeItem('photo', 'photo-1', { x: 476, y: 48, w: 756, h: 430 }),
      makeItem('steps', 'steps-1', { x: 48, y: 510 }),
      makeItem('table', 'table-1', { x: 820, y: 510 })
    ];
    return { version: VERSION, items };
  }
  function validImageData(value) {
    return typeof value === 'string' && value.length <= MAX_DATA_LENGTH &&
      /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value);
  }
  function validateState(raw) {
    if (!raw || raw.version !== VERSION || !Array.isArray(raw.items) || raw.items.length > 60) return null;
    const ids = new Set(), items = [];
    for (const source of raw.items) {
      if (!source || typeof source.type !== 'string' || !Object.hasOwn(SPECS, source.type) || typeof source.id !== 'string' ||
          !/^[a-zA-Z0-9_-]{1,80}$/.test(source.id) || ids.has(source.id) ||
          !['x', 'y', 'w', 'h', 'fontScale'].every(key => finite(source[key])) ||
          !source.text || typeof source.text !== 'object') return null;
      const text = {};
      for (const [key] of SPECS[source.type].fields) {
        if (typeof source.text[key] !== 'string' || source.text[key].length > 1600) return null;
        text[key] = source.text[key];
      }
      const item = { id: source.id, type: source.type, x: source.x, y: source.y, w: source.w,
        h: source.h, fontScale: source.fontScale, text };
      if (item.type === 'photo') {
        if (!['contain', 'cover'].includes(source.fit)) return null;
        if (source.imageKey !== 'gameplay' && source.imageKey !== 'personal') return null;
        if (source.imageData !== undefined && !validImageData(source.imageData)) return null;
        item.imageKey = source.imageKey;
        item.fit = source.fit;
        if (source.imageData) item.imageData = source.imageData;
      }
      ids.add(item.id);
      items.push(constrain(item));
    }
    return { version: VERSION, items };
  }
  function exportDocument(markup, css) {
    return '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>반쵸 돈테키 조작 설계</title><style>' +
      css + '\nbody{margin:0;padding:24px;background:#ded7ca}.portfolio-page{max-width:1280px;margin:auto;position:relative;overflow:hidden}.sheet{box-shadow:0 4px 28px #493c341c}.component{touch-action:auto}.component [data-field]{cursor:default}\n@media(max-width:600px){body{padding:8px}}\n@media print{@page{size:1280px 900px;margin:0}body{padding:0;background:#eee9df;print-color-adjust:exact;-webkit-print-color-adjust:exact}.portfolio-page{width:1280px!important;height:900px!important}.sheet{transform:none!important;box-shadow:none}}' +
      '</style></head><body><main class="portfolio-page">' + markup + '</main><script>const p=document.querySelector(".portfolio-page"),s=p.querySelector(".sheet");function fit(){const z=Math.min(1,p.clientWidth/1280);s.style.transform="scale("+z+")";p.style.height=(900*z)+"px"}new ResizeObserver(fit).observe(p);fit();<\/script></body></html>';
  }
  if (typeof document === 'undefined') {
    if (typeof module !== 'undefined') module.exports = { WIDTH, HEIGHT, VERSION, SPECS, makeItem, initialState, constrain, validateState, validImageData, exportDocument };
    return;
  }

  const $ = id => document.getElementById(id);
  const sheet = $('sheet'), viewport = $('stageViewport');
  const assets = window.BANCHO_ASSETS || {};
  let state = initialState(), selectedId = null, activeField = null, scale = 1;
  let deleted = null, saveTimer, gesture = null, preview = false, storageBlocked = false;
  const nodes = new Map();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const validated = validateState(JSON.parse(stored));
      if (validated) { state = validated; $('saveStatus').textContent = '이전 작업을 불러왔습니다'; }
      else { storageBlocked = true; $('saveStatus').textContent = '기존 저장 형식을 읽을 수 없습니다'; }
    }
  } catch {
    storageBlocked = true;
    $('saveStatus').textContent = '기존 저장을 확인할 수 없습니다';
  }
  const current = () => state.items.find(item => item.id === selectedId);
  function notify(message) { $('statusMessage').textContent = message; }
  function persist() {
    clearTimeout(saveTimer);
    if (storageBlocked) {
      $('saveStatus').textContent = '자동 저장 불가 / HTML 저장을 이용하세요';
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      $('saveStatus').textContent = '이 브라우저에 저장됨';
    } catch {
      $('saveStatus').textContent = '자동 저장 실패 / HTML 저장을 이용하세요';
      notify('브라우저 저장 공간 또는 접근 권한이 부족합니다. 현재 작업은 HTML 저장으로 보관하세요.');
    }
  }
  function scheduleSave() {
    if (storageBlocked) { persist(); return; }
    $('saveStatus').textContent = '저장 중…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 450);
  }
  function element(tag, className, parent, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    if (parent) parent.append(node);
    return node;
  }
  function field(tag, className, parent, item, key, editing) {
    const node = element(tag, className, parent, item.text[key]);
    if (editing) { node.dataset.field = key; node.title = '두 번 눌러 문구 편집'; }
    return node;
  }
  function place(node, item) {
    Object.assign(node.style, { left: `${item.x}px`, top: `${item.y}px`, width: `${item.w}px`, height: `${item.h}px` });
    node.style.setProperty('--font-scale', item.fontScale);
  }
  function makeComponent(item, editing = true) {
    const root = element('section', `component component-${item.type}`);
    place(root, item);
    if (editing) {
      root.dataset.id = item.id;
      root.tabIndex = 0;
      root.setAttribute('aria-label', `${SPECS[item.type].name} 요소. 방향키로 이동, Enter로 문구 편집`);
    }
    const body = element(item.type === 'photo' ? 'figure' : 'div', `component-body ${item.type === 'table' ? 'rules' : item.type === 'beforeafter' ? 'compare' : item.type}-body`, root);
    const write = (tag, cls, parent, key) => field(tag, cls, parent, item, key, editing);
    const heading = (subtitle) => {
      const row = element('div', 'component-heading', body);
      write('h2', '', row, 'heading');
      element('span', '', row, subtitle);
    };
    if (item.type === 'title') {
      write('p', 'title-kicker', body, 'kicker');
      write('h1', 'title-headline', body, 'headline');
      write('h2', 'title-subtitle', body, 'subtitle');
      write('p', 'title-description', body, 'description');
      const foot = element('div', 'title-foot', body);
      const geometry = element('div', 'cut-geometry', foot);
      geometry.setAttribute('aria-hidden', 'true');
      for (let n = 0; n < 4; n++) element('span', '', geometry);
      const result = element('div', 'title-result', foot);
      write('span', '', result, 'result');
      write('small', '', result, 'resultNote');
    } else if (item.type === 'photo') {
      if (item.imageKey === 'personal') body.classList.add('personal');
      const image = element('img', '', body);
      image.src = item.imageData || assets[item.imageKey] || (item.imageKey === 'personal' ? 'assets/personal-butadon.jpg' : 'assets/bancho-gameplay.png');
      image.alt = item.text.caption;
      image.draggable = false;
      image.style.objectFit = item.fit;
      write('figcaption', '', body, 'caption');
    } else if (item.type === 'steps') {
      heading('INPUT FLOW');
      const list = element('ol', 'steps-list', body);
      for (let n = 1; n <= 3; n++) {
        const step = element('li', 'step', list);
        element('span', 'step-number', step, `0${n}`);
        const content = element('div', '', step);
        write('h3', '', content, `step${n}Title`);
        write('p', '', content, `step${n}Text`);
      }
      write('p', 'steps-note', body, 'note');
    } else if (item.type === 'table') {
      heading('RULES');
      const table = element('table', 'rules-table', body);
      write('caption', '', table, 'caption');
      const head = element('tr', '', element('thead', '', table));
      for (const label of ['입력 조건', '처리']) { const th = element('th', '', head, label); th.scope = 'col'; }
      const tbody = element('tbody', '', table);
      for (let n = 1; n <= 4; n++) {
        const row = element('tr', '', tbody);
        write('th', '', row, `r${n}Condition`).scope = 'row';
        write('td', '', row, `r${n}Result`);
      }
      write('p', 'rules-note', body, 'note');
    } else {
      heading('BEFORE / AFTER');
      const columns = element('div', 'compare-columns', body);
      for (const key of ['before', 'after']) {
        const part = element('div', 'compare-part', columns);
        element('span', 'compare-label', part, key === 'before' ? 'BEFORE' : 'AFTER');
        write('p', '', part, key);
      }
      write('p', 'compare-note', body, 'note');
    }
    if (editing) {
      const move = element('button', 'move-handle', root, '↔ 이동');
      move.type = 'button'; move.tabIndex = -1; move.setAttribute('aria-label', '선택 요소 이동 핸들');
      const resize = element('button', 'resize-handle', root, '↘');
      resize.type = 'button'; resize.tabIndex = -1; resize.setAttribute('aria-label', '선택 요소 크기 조절 핸들');
    }
    return root;
  }
  function renderAll() {
    sheet.replaceChildren(); nodes.clear();
    for (const item of state.items) { const node = makeComponent(item); nodes.set(item.id, node); sheet.append(node); }
  }
  function renderItem(item) {
    const old = nodes.get(item.id), node = makeComponent(item);
    old.replaceWith(node); nodes.set(item.id, node);
    node.classList.toggle('selected', item.id === selectedId);
  }
  function syncGeometry() {
    const item = current(); if (!item) return;
    for (const [id, key] of [['posX', 'x'], ['posY', 'y'], ['sizeW', 'w'], ['sizeH', 'h']]) $(id).value = item[key];
    $('posX').max = WIDTH - item.w; $('posY').max = HEIGHT - item.h;
    $('sizeW').min = SPECS[item.type].min[0]; $('sizeH').min = SPECS[item.type].min[1];
    $('fontScale').value = item.fontScale;
    $('scaleValue').textContent = `${Math.round(item.fontScale * 100)}%`;
  }
  function refreshInspector() {
    const item = current();
    $('inspectorEmpty').hidden = Boolean(item); $('inspectorControls').hidden = !item;
    $('selectionName').textContent = item ? SPECS[item.type].name : '선택된 요소 없음';
    if (!item) return;
    syncGeometry();
    $('photoControls').hidden = item.type !== 'photo';
    if (item.type === 'photo') $('photoFit').value = item.fit;
    $('textFields').replaceChildren();
    for (const [key, label] of SPECS[item.type].fields) {
      const wrap = element('label', 'text-field', $('textFields'), label);
      const textarea = element('textarea', '', wrap);
      textarea.value = item.text[key]; textarea.rows = ['description', 'note'].includes(key) ? 3 : 2;
      textarea.maxLength = 1600; textarea.spellcheck = false; textarea.dataset.editKey = key;
      textarea.addEventListener('input', () => {
        item.text[key] = textarea.value;
        const target = nodes.get(item.id).querySelector(`[data-field="${key}"]`);
        target.textContent = textarea.value;
        if (item.type === 'photo') nodes.get(item.id).querySelector('img').alt = textarea.value;
        scheduleSave();
      });
    }
  }
  function finishEditing() {
    if (!activeField) return;
    activeField.removeAttribute('contenteditable'); activeField.removeAttribute('role');
    activeField = null;
  }
  function select(id, focus = false) {
    if (selectedId === id) { if (focus) nodes.get(id)?.focus({ preventScroll: true }); return; }
    finishEditing(); selectedId = id;
    for (const [key, node] of nodes) node.classList.toggle('selected', key === id);
    refreshInspector();
    if (focus) nodes.get(id)?.focus({ preventScroll: true });
  }
  function startEditing(node) {
    finishEditing();
    const root = node.closest('.component'); select(root.dataset.id);
    activeField = node; node.setAttribute('contenteditable', 'plaintext-only'); node.setAttribute('role', 'textbox');
    node.focus({ preventScroll: true });
  }
  sheet.addEventListener('dblclick', event => {
    const target = event.target.closest('[data-field]');
    if (target && !preview) { event.preventDefault(); startEditing(target); }
  });
  sheet.addEventListener('input', event => {
    const target = event.target.closest('[data-field]');
    const item = current(); if (!target || !item) return;
    const text = target.innerText.replace(/\r/g, '').slice(0, 1600);
    if (target.innerText.length > 1600) { target.textContent = text; notify('문구는 항목당 1,600자까지 입력할 수 있습니다.'); }
    item.text[target.dataset.field] = text;
    const editor = $('textFields').querySelector(`[data-edit-key="${target.dataset.field}"]`);
    if (editor) editor.value = text;
    if (item.type === 'photo') nodes.get(item.id).querySelector('img').alt = text;
    scheduleSave();
  });
  sheet.addEventListener('paste', event => {
    if (!event.target.closest('[contenteditable]')) return;
    event.preventDefault();
    const selection = window.getSelection(); if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0); range.deleteContents();
    const text = document.createTextNode((event.clipboardData.getData('text/plain') || '').slice(0, 1600));
    range.insertNode(text); range.setStartAfter(text); range.collapse(true);
    selection.removeAllRanges(); selection.addRange(range);
    event.target.dispatchEvent(new Event('input', { bubbles: true }));
  });
  sheet.addEventListener('focusout', event => {
    if (event.target === activeField) finishEditing();
  });
  sheet.addEventListener('focusin', event => {
    const root = event.target.closest('.component');
    if (root && selectedId !== root.dataset.id) select(root.dataset.id);
  });
  sheet.addEventListener('pointerdown', event => {
    if (preview || event.button !== 0 || !event.isPrimary) return;
    const root = event.target.closest('.component');
    if (!root) { select(null); return; }
    select(root.dataset.id);
    if (event.target.closest('[data-field]')) return;
    finishEditing(); event.preventDefault(); root.focus({ preventScroll: true });
    const item = current();
    gesture = { id: item.id, pointer: event.pointerId, resize: Boolean(event.target.closest('.resize-handle')),
      clientX: event.clientX, clientY: event.clientY, x: item.x, y: item.y, w: item.w, h: item.h, scale };
    root.setPointerCapture(event.pointerId); root.classList.add('dragging');
  });
  sheet.addEventListener('pointermove', event => {
    if (!gesture || gesture.pointer !== event.pointerId) return;
    const item = state.items.find(value => value.id === gesture.id);
    const dx = (event.clientX - gesture.clientX) / gesture.scale, dy = (event.clientY - gesture.clientY) / gesture.scale;
    if (gesture.resize) {
      item.w = clamp(gesture.w + dx, SPECS[item.type].min[0], WIDTH - gesture.x);
      item.h = clamp(gesture.h + dy, SPECS[item.type].min[1], HEIGHT - gesture.y);
    } else { item.x = gesture.x + dx; item.y = gesture.y + dy; }
    constrain(item); place(nodes.get(item.id), item); syncGeometry(); scheduleSave();
  });
  function endGesture() {
    if (!gesture) return;
    const node = nodes.get(gesture.id); node?.classList.remove('dragging');
    if (node?.hasPointerCapture(gesture.pointer)) node.releasePointerCapture(gesture.pointer);
    gesture = null; scheduleSave();
  }
  sheet.addEventListener('pointerup', endGesture);
  sheet.addEventListener('pointercancel', endGesture);
  sheet.addEventListener('lostpointercapture', endGesture);
  function add(type, source) {
    if (state.items.length >= 60) { notify('한 장에는 최대 60개 요소를 넣을 수 있습니다.'); return; }
    const id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const item = source ? constrain({ ...source, id, text: { ...source.text }, x: source.x + 24, y: source.y + 24 }) :
      makeItem(type, id, { x: 100 + (state.items.length % 4) * 24, y: 100 + (state.items.length % 4) * 24 });
    state.items.push(item); const node = makeComponent(item); sheet.append(node); nodes.set(id, node);
    select(id, true); scheduleSave(); notify(`${SPECS[type].name} 요소를 ${source ? '복제' : '추가'}했습니다.`);
  }
  function deleteSelected() {
    const item = current(); if (!item) return;
    finishEditing();
    const index = state.items.indexOf(item);
    deleted = { item, index }; state.items.splice(index, 1); nodes.get(item.id).remove(); nodes.delete(item.id);
    select(null); $('undoDelete').disabled = false; scheduleSave(); notify('삭제했습니다. 마지막 삭제를 되돌릴 수 있습니다.');
  }
  $('libraryItems').addEventListener('click', event => {
    const button = event.target.closest('[data-add]'); if (button) add(button.dataset.add);
  });
  $('duplicateSelected').addEventListener('click', () => { const item = current(); if (item) add(item.type, item); });
  $('deleteSelected').addEventListener('click', deleteSelected);
  $('undoDelete').addEventListener('click', () => {
    if (!deleted) return;
    if (state.items.length >= 60) { notify('복원하려면 요소 한 개를 먼저 삭제하세요.'); return; }
    const { item, index } = deleted;
    state.items.splice(Math.min(index, state.items.length), 0, item); renderAll(); select(item.id, true);
    deleted = null; $('undoDelete').disabled = true; scheduleSave(); notify('마지막으로 삭제한 요소를 복원했습니다.');
  });
  for (const [id, key] of [['posX', 'x'], ['posY', 'y'], ['sizeW', 'w'], ['sizeH', 'h']]) {
    $(id).addEventListener('change', () => {
      const item = current(), value = $(id).valueAsNumber;
      if (!item || !finite(value)) { syncGeometry(); return; }
      item[key] = value; constrain(item); place(nodes.get(item.id), item); syncGeometry(); scheduleSave();
    });
  }
  $('fontScale').addEventListener('input', () => {
    const item = current(); if (!item) return;
    item.fontScale = $('fontScale').valueAsNumber; constrain(item); place(nodes.get(item.id), item); syncGeometry(); scheduleSave();
  });
  $('photoFit').addEventListener('change', () => {
    const item = current(); if (!item || item.type !== 'photo') return;
    item.fit = $('photoFit').value; renderItem(item); scheduleSave();
  });
  $('replacePhoto').addEventListener('click', () => $('photoInput').click());
  $('photoInput').addEventListener('change', async () => {
    const file = $('photoInput').files[0], item = current(); $('photoInput').value = '';
    if (!file || !item || item.type !== 'photo') return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { notify('JPG, PNG, WebP 이미지 파일을 선택하세요.'); return; }
    if (file.size > MAX_BYTES) { notify('사진은 최대 5MB입니다. 더 작은 이미지를 선택하세요.'); return; }
    if (!file.size) { notify('빈 파일은 사용할 수 없습니다. 다른 사진을 선택하세요.'); return; }
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file);
      });
      if (!validImageData(data)) throw new Error('invalid data');
      const image = new Image(); image.src = data; await image.decode();
      if (!state.items.includes(item)) return;
      item.imageData = data; renderItem(item); scheduleSave();
      notify('사진을 바꿨습니다. 저장 실패가 표시되면 HTML 저장으로 보관하세요.');
    } catch { notify('이미지 파일을 읽을 수 없습니다. 손상되지 않은 JPG, PNG, WebP를 선택하세요.'); }
  });
  document.addEventListener('keydown', event => {
    if (event.target.closest('input,textarea,select,[contenteditable],button') || preview) return;
    const item = current(); if (!item) return;
    if (event.key === 'Enter') {
      const first = nodes.get(item.id).querySelector('[data-field]'); if (first) { event.preventDefault(); startEditing(first); }
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); deleteSelected(); return; }
    const vector = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!vector || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault(); const step = event.shiftKey ? 10 : 1;
    item.x += vector[0] * step; item.y += vector[1] * step;
    constrain(item); place(nodes.get(item.id), item); syncGeometry(); scheduleSave();
  });
  $('previewButton').addEventListener('click', () => {
    finishEditing(); endGesture(); preview = !preview;
    sheet.classList.toggle('is-preview', preview);
    document.body.classList.toggle('preview-mode', preview);
    $('previewButton').setAttribute('aria-pressed', String(preview));
    $('previewButton').textContent = preview ? '편집으로 돌아가기' : '미리 보기';
    $('libraryItems').querySelectorAll('button').forEach(button => { button.disabled = preview; });
    $('inspectorControls').inert = preview;
    $('undoDelete').disabled = preview || !deleted;
    fit();
    notify(preview ? '선택 표시 없이 완성된 구성을 보고 있습니다.' : '편집을 계속할 수 있습니다.');
  });
  function fit() {
    scale = Math.min(1, viewport.clientWidth / WIDTH);
    sheet.style.transform = `scale(${scale})`; viewport.style.height = `${HEIGHT * scale}px`;
    $('zoomLabel').textContent = `${Math.round(scale * 100)}%`;
    // shortcut: handles scale with the page, use the inspector for precise touch resizing at very small zoom.
    sheet.querySelectorAll('.move-handle').forEach(node => { node.style.fontSize = `${Math.min(18, 10 / scale)}px`; });
  }
  $('exportButton').addEventListener('click', () => {
    finishEditing(); endGesture();
    if (!assets.gameplay || !assets.personal || !assets.exportCSS) { notify('내보내기에 필요한 assets.js를 읽지 못했습니다. 작업대 파일들을 같은 폴더에 두고 다시 여세요.'); return; }
    try {
      const page = element('article', 'sheet'); page.setAttribute('aria-label', '반쵸 돈테키 조작 설계');
      for (const item of state.items) page.append(makeComponent(item, false));
      const html = exportDocument(page.outerHTML, assets.exportCSS);
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
      const link = element('a', '', document.body); link.href = url; link.download = 'bancho-portfolio.html'; link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      notify('HTML 다운로드를 요청했습니다. 이미지가 포함된 파일을 다운로드 폴더에서 확인하세요.');
    } catch { notify('HTML 파일을 만들지 못했습니다. 현재 작업은 그대로 유지됩니다.'); }
  });
  renderAll(); refreshInspector(); new ResizeObserver(fit).observe(viewport); fit();
  if (!assets.gameplay || !assets.personal) notify('이미지 묶음을 읽지 못했습니다. HTML 내보내기를 위해 assets.js가 필요합니다.');
  if (storageBlocked) notify('기존 저장 내용을 덮어쓰지 않았습니다. 현재 변경은 자동 저장되지 않으므로 HTML 저장을 이용하세요.');
  window.addEventListener('pagehide', () => { if (saveTimer) persist(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && saveTimer) persist(); });
})();
