import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.gamejob.co.kr';
const LIST_PAGE_URL = `${BASE}/Recruit/joblist?duty=9&menucode=duty`;
const AJAX_URL = `${BASE}/Recruit/_GI_Job_List/`;
const DETAIL_URL = `${BASE}/Recruit/GI_Read/View?GI_No=`;
const WORK_URL = `${BASE}/Recruit/GI_Read_Comt_Ifrm?gno=`;
const REQUIREMENT_URL = `${BASE}/Recruit/GI_Read_GI_Comment_Ifrm?gno=`;
const SHEET_POST_URL = 'https://script.google.com/macros/s/AKfycbyR7kMLzYOAijbXmb4B7TEguwGv6wHwVhG7V26HvpJIkX1qljHNuDW3S7fuVs_8nvoV/exec';

const env = process.env;
const BASE_DATE = env.GAMEJOB_BASE_DATE || formatDateKst(new Date());
const SECRET = env.GAMEJOB_AUTOMATION_SECRET || '';
const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_POST = process.argv.includes('--skip-post') || DRY_RUN;
const OUT_DIR = env.GAMEJOB_OUT_DIR || 'C:\\Users\\User\\.codex\\automations\\automation';

const INCLUDE_ROLE_RE =
  /게임\s*기획|기획자|게임\s*디자이너|game\s*designer|system\s*designer|combat\s*designer|level\s*designer|quest\s*designer|시스템\s*(?:기획|디자이너)|콘텐츠?\s*(?:기획|디자이너)|컨텐츠?\s*(?:기획|디자이너)|전투\s*(?:기획|디자이너)|밸런스?\s*(?:기획|디자이너)|벨런스?\s*(?:기획|디자이너)|레벨\s*(?:기획|디자이너)|퀘스트\s*(?:기획|디자이너)|설정\s*기획|시나리오\s*기획|내러티브\s*기획|narrative|scenario|story\s*designer|월드\s*설정|ui\s*\/?\s*ux\s*(?:기획|설계|디자이너|designer)|ux\s*\/?\s*ui\s*(?:기획|설계|디자이너|designer)|ui\s*기획|ux\s*설계|인터페이스\s*(?:기획|설계|디자인|디자이너)|interface\s*(?:design|designer)/i;
const UI_UX_RE =
  /ui\s*\/?\s*ux|ux\s*\/?\s*ui|ui\s*기획|ux\s*설계|ui\s*디자이너|ux\s*디자이너|인터페이스|interface/i;
const UI_UX_PLANNING_RE =
  /게임|인게임|화면\s*(?:흐름|설계|기획)|정보\s*구조|ia\b|와이어\s*프레임|wireframe|프로토타입|ux\s*설계|ui\s*기획|인터페이스\s*(?:설계|기획)|hud|메뉴|플로우|flow/i;

const EXCLUDED_COMPANY_RE = /아이언메이스|ironmace|㈜아이언메이스|디나미스원|디나미스원㈜/i;
const EXCLUDE_TITLE_RE =
  /\bPM\b|프로젝트\s*매니저|프로덕트\s*매니저|개발\s*PM|서비스\s*PM|사업\s*PM|운영\s*PM|퍼블리싱\s*매니저|product\s*manager|project\s*manager|program\s*manager|qa\b|테스터|테스트\s*엔지니어|cs\b|gm\b|커뮤니티\s*(?:운영|매니저)|운영자|고객\s*(?:지원|상담)|마케팅|브랜드|홍보|pr\b|광고|사업\s*(?:기획|개발|관리)|시장\s*분석|분석가|경영지원|총무|인사|회계|재무|법무|번역|로컬라이즈|프로그래머|개발자|클라이언트|서버|백엔드|프론트엔드|엔진\s*개발|devops|데브옵스|데이터\s*엔지니어|\bTA\b|그래픽|원화|모델링|모델러|애니메이션|애니메이터|아티스트|artist|일러스트|이펙트|vfx|fx\b|영상\s*(?:편집|제작)|모션\s*캡쳐|모션캡쳐|사운드\s*(?:디자이너|designer|제작)?|sound\s*designer/i;
const PURE_VISUAL_RE =
  /원화|캐릭터\s*디자인|배경\s*디자인|그래픽\s*디자인|아이콘(?:\s*제작|\s*작업)?|배너|모델링|모델러|애니메이션|아티스트|artist|일러스트|이펙트|vfx|fx\b|영상\s*(?:편집|제작)|모션\s*캡쳐|모션캡쳐/i;

function formatDateKst(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function timestampKst(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} KST`;
}

function decodeHtml(value = '') {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;|&#160;/g, ' ');
}

function stripTags(html = '') {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchText(url, options = {}, retry = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retry; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36',
          Referer: LIST_PAGE_URL,
          ...(options.headers || {}),
        },
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}: ${url}`);
      return text;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 350 * (attempt + 1)));
    }
  }
  throw lastError;
}

function parseTotalCount(html) {
  const match = stripTags(html).match(/전체\s*\(([\d,]+)\)/);
  return match ? Number(match[1].replace(/,/g, '')) : 0;
}

function ajaxBody(page) {
  return new URLSearchParams([
    ['condition[duty]', '9'],
    ['condition[menucode]', 'duty'],
    ['condition[searchtype]', 'B'],
    ['condition[dutyArr][]', '9'],
    ['condition[dutySelect][]', '9'],
    ['page', String(page)],
    ['direct', '0'],
    ['order', '1'],
    ['pagesize', '40'],
    ['tabcode', '1'],
  ]).toString();
}

function parseListRows(html) {
  const tbody = html.match(/<tbody>([\s\S]*?)<\/tbody>/i)?.[1] || html;
  return [...tbody.matchAll(/<tr>\s*([\s\S]*?)\s*<\/tr>/gi)]
    .map(match => parseListRow(match[1]))
    .filter(Boolean);
}

function parseListRow(rowHtml) {
  const company = stripTags(rowHtml.match(/<div class="company[\s\S]*?<strong>([\s\S]*?)<\/strong>/i)?.[1] || '');
  const link = rowHtml.match(/<div class="tit">[\s\S]*?<a href="([^"]*GI_No=(\d+)[^"]*)"[\s\S]*?<strong>([\s\S]*?)<\/strong>/i);
  if (!company || !link) return null;
  const info = rowHtml.match(/<p class="info">([\s\S]*?)<\/p>/i)?.[1] || '';
  const spans = [...info.matchAll(/<span>([\s\S]*?)<\/span>/gi)].map(match => stripTags(match[1]));
  return {
    id: link[2],
    company,
    title: stripTags(link[3]),
    url: `${DETAIL_URL}${link[2]}`,
    listedExperience: spans[0] || '',
    education: spans[1] || '',
    location: spans[2] || '',
    gameField: spans[3] || '',
    employmentType: spans[4] || '',
    deadline: stripTags(rowHtml.match(/<span class="date">([\s\S]*?)<\/span>/i)?.[1] || ''),
    modifiedRaw: stripTags(rowHtml.match(/<span class="modifyDate">([\s\S]*?)<\/span>/i)?.[1] || ''),
  };
}

async function collectListings() {
  const firstHtml = await fetchText(LIST_PAGE_URL);
  const total = parseTotalCount(firstHtml);
  const pages = Math.max(1, Math.ceil((total || 40) / 40));
  const rows = [];
  for (let page = 1; page <= pages; page += 1) {
    const html = await fetchText(AJAX_URL, {
      method: 'POST',
      body: ajaxBody(page),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    const pageRows = parseListRows(html);
    console.error(`list ${page}/${pages}: ${pageRows.length}`);
    rows.push(...pageRows);
  }
  return {
    total,
    rows: [...new Map(rows.map(row => [row.id, row])).values()],
  };
}

function extractMainDetail(html) {
  const text = stripTags(html);
  const metaDescription = decodeHtml(html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || '');
  const experienceFromMeta = metaDescription.match(/\[([^\]]*경력[^\]]*|신입[^\]]*|경력무관[^\]]*)\]/)?.[1] || '';
  const registered = text.match(/(20\d{2}-\d{2}-\d{2})\s+\d{1,2}:\d{2}\s+등록/)?.[1] || '';
  const modified = text.match(/(20\d{2}-\d{2}-\d{2})\s+\d{1,2}:\d{2}\s+수정/)?.[1] || '';
  const fields = extractBetween(text, '모집분야', ['키워드', '대표게임', '경력']);
  const keywords = extractBetween(text, '키워드', ['대표게임', '경력', '고용형태']);
  const visibleExperience = extractBetween(text, '경력', ['고용형태', '학력', '직급/직책']).replace(/^경력\s*/, '').trim();
  return {
    text,
    fields,
    keywords,
    visibleExperience: visibleExperience || experienceFromMeta,
    registered,
    modified,
  };
}

function extractBetween(text, start, endCandidates) {
  const startIndex = text.indexOf(start);
  if (startIndex < 0) return '';
  let endIndex = text.length;
  for (const end of endCandidates) {
    const index = text.indexOf(end, startIndex + start.length);
    if (index > startIndex && index < endIndex) endIndex = index;
  }
  return text.slice(startIndex + start.length, endIndex).replace(/\s+/g, ' ').trim();
}

function summarizeSection(text, starts, ends, fallback = '') {
  for (const start of starts) {
    let searchFrom = 0;
    while (searchFrom < text.length) {
      const startIndex = text.indexOf(start, searchFrom);
      if (startIndex < 0) break;
      let endIndex = text.length;
      for (const end of ends) {
        const index = text.indexOf(end, startIndex + start.length);
        if (index > startIndex && index < endIndex) endIndex = index;
      }
      const section = text.slice(startIndex + start.length, endIndex).replace(/\s+/g, ' ').trim();
      if (section && section.length > 12 && !/^및\s*(?:자격|우대|접수)?/.test(section)) {
        return trimForSheet(section, 700);
      }
      searchFrom = startIndex + start.length;
    }
  }
  return fallback;
}

async function readDetail(item) {
  const id = item.id;
  const [mainHtml, workHtml, requirementHtml] = await Promise.all([
    fetchText(`${DETAIL_URL}${id}`),
    fetchText(`${WORK_URL}${id}&v1`, {
      headers: { Referer: `${DETAIL_URL}${id}` },
    }),
    fetchText(`${REQUIREMENT_URL}${id}&v1`, {
      headers: { Referer: `${DETAIL_URL}${id}` },
    }),
  ]);
  const main = extractMainDetail(mainHtml);
  const workText = stripTags(workHtml).replace(/^채용공고 상세페이지\s*/, '').trim();
  const requirementText = stripTags(requirementHtml).replace(/^채용공고 상세페이지\s*/, '').trim();
  const combined = [workText, requirementText].filter(Boolean).join(' ');
  return {
    ...main,
    workText,
    requirementText,
    combined,
    hasImageHeavyBody: /<img\b/i.test(workHtml + requirementHtml) && combined.length < 160,
    tasks: summarizeSection(combined, ['담당업무', '주요업무', '업무내용'], ['필수조건', '자격조건', '자격요건', '지원자격', '우대사항', '전형절차', '모집전형'], `${classifyRole(item, { combined, keywords: main.keywords, fields: main.fields })} 업무`),
    requirements: summarizeSection(combined, ['필수조건', '자격조건', '자격요건', '지원자격', '필수 자격'], ['우대사항', '우대조건', '전형절차', '모집전형', '접수방법'], requirementText || item.listedExperience),
    preferences: summarizeSection(combined, ['우대사항', '우대조건', '우대 요건'], ['전형절차', '모집전형', '접수방법', '근무지역', '복리후생'], ''),
  };
}

function minYearFrom(text) {
  const source = String(text || '').replace(/20\d{2}/g, ' ');
  const years = [];
  for (const match of source.matchAll(/(?:경력|업무|직무|실무|관련|해당\s*업무)?\s*(\d{1,2})\s*년(?:차)?\s*(?:이상|초과|\+|부터)/g)) {
    years.push(Number(match[1]));
  }
  for (const match of source.matchAll(/(?:경력|업무|직무|실무|관련|해당\s*업무)\s*(\d{1,2})\s*년/g)) {
    years.push(Number(match[1]));
  }
  for (const match of source.matchAll(/(\d{1,2})\s*년\s*[~-]\s*\d{1,2}\s*년/g)) {
    years.push(Number(match[1]));
  }
  for (const match of source.matchAll(/(\d{1,2})\s*년차/g)) {
    years.push(Number(match[1]));
  }
  if (/신입\s*(?:또는|\/|및)?\s*경력\s*\d{1,2}\s*년\s*이하/.test(source)) return 0;
  return years.length ? Math.min(...years) : null;
}

function hasVagueCareerText(text) {
  return /실무\s*경험|실무\s*경력|관련\s*경험|관련\s*경력|경력자|경험자|업무\s*경험|업무\s*경력|프로젝트\s*경험/.test(String(text || ''));
}

function careerDecision(item, detail) {
  const bodyCareerSource = [detail.visibleExperience, detail.requirements, detail.tasks, detail.combined].filter(Boolean).join(' ');
  const listedSource = [item.listedExperience, item.title].join(' ');
  const bodyMin = minYearFrom(bodyCareerSource);
  const listedMin = minYearFrom(listedSource);
  const bodyUnavailable = detail.hasImageHeavyBody || detail.combined.length < 40 || /홈페이지\s*지원|자사\s*양식|외부\s*지원/.test(detail.combined);

  if (bodyUnavailable) {
    return {
      minYear: null,
      band: bandFromMinimum(listedMin, listedSource),
      bodyExperience: '수동 확인 필요',
      manualExperience: '확인 전',
      evidence: detail.hasImageHeavyBody ? '자격요건 본문이 이미지 중심이라 자동 판정 불가' : '자격요건/담당업무 본문 자동 추출 불가',
      manual: true,
    };
  }
  if (bodyMin !== null) {
    return {
      minYear: bodyMin,
      band: bandFromMinimum(bodyMin, bodyCareerSource),
      bodyExperience: bodyMin === 0 ? '신입' : `${bodyMin}년 이상`,
      manualExperience: bodyMin === 0 ? '신입/경력 없음' : `${bodyMin}년 이상`,
      evidence: evidenceForYear(bodyCareerSource, bodyMin),
      manual: false,
    };
  }
  if (hasVagueCareerText(bodyCareerSource)) {
    return {
      minYear: null,
      band: bandFromMinimum(listedMin, listedSource),
      bodyExperience: '경력 문구 있음/연차 미기재',
      manualExperience: '연차 미기재',
      evidence: evidenceForVagueCareer(bodyCareerSource),
      manual: false,
    };
  }
  if (/신입|경력\s*무관|경력무관|무관/.test(`${detail.visibleExperience} ${item.listedExperience}`)) {
    return {
      minYear: null,
      band: '신입/경력무관',
      bodyExperience: '본문 연차 명시 없음',
      manualExperience: '신입/경력 없음',
      evidence: `표시경력 ${item.listedExperience || detail.visibleExperience || '무관'} 및 본문 연차 요구 없음`,
      manual: false,
    };
  }
  if (listedMin !== null) {
    return {
      minYear: listedMin,
      band: bandFromMinimum(listedMin, listedSource),
      bodyExperience: `${listedMin}년 이상`,
      manualExperience: `${listedMin}년 이상`,
      evidence: `표시경력/공고명 기준 최소 ${listedMin}년 확인`,
      manual: false,
    };
  }
  return {
    minYear: null,
    band: '신입/경력무관',
    bodyExperience: '본문 연차 명시 없음',
    manualExperience: '신입/경력 없음',
    evidence: '목록/본문에서 최소 연차 요구를 찾지 못함',
    manual: false,
  };
}

function bandFromMinimum(minYear, source) {
  if (minYear !== null) {
    if (minYear > 5) return '제외';
    if (minYear >= 3) return '3~5년차';
    if (minYear >= 1) return '1~3년차';
    return '신입/경력무관';
  }
  return /신입|경력\s*무관|경력무관|무관/.test(String(source || '')) ? '신입/경력무관' : '신입/경력무관';
}

function evidenceForYear(text, year) {
  const source = String(text || '');
  const index = source.search(new RegExp(`.{0,35}${year}\\s*년(?:차)?\\s*(?:이상|초과|부터|\\+)?[^.\\n]{0,70}`));
  if (index >= 0) return trimForSheet(source.slice(Math.max(0, index), index + 180), 260);
  return `본문에서 최소 ${year}년 요구 확인`;
}

function evidenceForVagueCareer(text) {
  const source = String(text || '');
  const match = source.match(/.{0,35}(?:실무\s*경험|실무\s*경력|관련\s*경험|관련\s*경력|경력자|경험자|업무\s*경험|업무\s*경력|프로젝트\s*경험).{0,90}/);
  return match ? trimForSheet(match[0], 260) : '연차 없는 경력/경험 요구 문구 확인';
}

function exclusionFor(item, detail, decision) {
  const titleText = item.title;
  const roleText = `${item.title} ${detail.fields} ${detail.keywords}`;
  const fullText = `${item.company} ${roleText} ${detail.combined}`;
  if (EXCLUDED_COMPANY_RE.test(item.company)) return ['제외회사', '사용자 지정 제외 회사'];
  if (decision.minYear !== null && decision.minYear > 5) return ['경력초과', `본문/상세 최소 ${decision.minYear}년 요구로 대상 범위 초과`];
  if (/전\s*부문|부문별|전\s*직군|수시채용|상시채용/.test(titleText)) return ['중복/종합공고', '여러 직군을 묶은 공고라 대상 기획 직무만 자동 분리 불가'];
  if (/빌드\s*매니저|build\s*manager/i.test(titleText)) return ['PM/매니저', '빌드 매니저 중심 공고'];
  if (/(?:서비스\s*기획\s*\/?\s*운영|기획\s*\/\s*운영|앱\s*서비스.*기획\s*운영)/.test(titleText) && !/게임|RPG|MMO|퍼즐|라이브/i.test(titleText)) {
    return ['비대상 직무', '게임 내 기획 산출물보다 앱/서비스 기획·운영 중심 공고'];
  }
  if (EXCLUDE_TITLE_RE.test(titleText)) return [excludeCategory(titleText), '사용자 지정 제외 직군 또는 제목 기준 비대상 직무'];
  if (PURE_VISUAL_RE.test(roleText) && !(UI_UX_RE.test(roleText) && UI_UX_PLANNING_RE.test(fullText))) {
    return ['순수 시각 디자인/아트', '게임 화면 흐름·정보구조·와이어프레임·인터페이스 설계 연결 문구 부족'];
  }
  if (!INCLUDE_ROLE_RE.test(fullText)) return ['비대상 직무', '게임기획 산출물 작성과 직접 연결되는 직무로 자동 분류되지 않음'];
  if (UI_UX_RE.test(roleText) && !UI_UX_PLANNING_RE.test(fullText)) {
    return ['순수 시각 디자인/아트', 'UI/UX 명칭은 있으나 게임 내 화면 흐름·정보 구조·인터페이스 설계 근거 부족'];
  }
  return null;
}

function excludeCategory(text) {
  if (/\bPM\b|매니저|manager/i.test(text)) return 'PM/매니저';
  if (/qa|테스터|테스트/i.test(text)) return 'QA';
  if (/프로그래머|개발자|클라이언트|서버|백엔드|프론트엔드|엔진|devops|데이터\s*엔지니어/i.test(text)) return '개발직군';
  if (/원화|모델링|모델러|애니메이션|이펙트|그래픽|영상|모션/i.test(text)) return '순수 그래픽/아트';
  if (/마케팅|브랜드|홍보|광고|사업|경영지원|총무|인사|회계|재무|법무/i.test(text)) return '마케팅/관리';
  if (/cs|gm|커뮤니티|운영|고객/i.test(text)) return '운영/CS/GM';
  return '비대상 직무';
}

function classifyRole(item, detail) {
  const headline = `${item.title} ${detail?.fields || ''} ${detail?.keywords || ''}`;
  const full = `${headline} ${detail?.combined || ''}`;
  if (/ui\s*\/?\s*ux|ux\s*\/?\s*ui|ui\s*기획|ux\s*설계|ui\s*디자이너|ux\s*디자이너|인터페이스|interface/i.test(headline)) return 'UI/UX 기획';
  if (/시나리오|내러티브|narrative|scenario|story|설정\s*기획|월드\s*설정/i.test(headline)) return '설정/시나리오/내러티브 기획';
  if (/전투|밸런스|벨런스|combat|balance|몬스터/i.test(headline)) return '전투/밸런스 기획';
  if (/레벨|퀘스트|level|quest/i.test(headline)) return '레벨/퀘스트 기획';
  if (/시스템|콘텐츠|컨텐츠|보상|경제|성장|라이브|system|content/i.test(headline)) return '시스템/콘텐츠 기획';
  if (/ui\s*\/?\s*ux|ux\s*\/?\s*ui|ui\s*기획|ux\s*설계|인터페이스|interface/i.test(full)) return 'UI/UX 기획';
  if (/시나리오|내러티브|narrative|scenario|story|설정\s*기획|월드\s*설정/i.test(full)) return '설정/시나리오/내러티브 기획';
  if (/전투|밸런스|벨런스|combat|balance|몬스터/i.test(full)) return '전투/밸런스 기획';
  if (/레벨|퀘스트|level|quest/i.test(full)) return '레벨/퀘스트 기획';
  if (/시스템|콘텐츠|컨텐츠|보상|경제|성장|라이브|system|content/i.test(full)) return '시스템/콘텐츠 기획';
  return '게임기획';
}

function portfolioFor(role) {
  if (role === 'UI/UX 기획') return '게임 화면 흐름도, 정보구조, 와이어프레임, 주요 UX 개선안';
  if (role === '설정/시나리오/내러티브 기획') return '세계관/캐릭터 설정서, 퀘스트 대사 플로우, 내러티브 구조 분석';
  if (role === '전투/밸런스 기획') return '전투 규칙서, 몬스터/스킬 패턴 문서, 밸런스 테이블';
  if (role === '레벨/퀘스트 기획') return '레벨 블록아웃, 동선/기믹 문서, 퀘스트 플로우';
  if (role === '시스템/콘텐츠 기획') return '시스템 명세서, 콘텐츠 루프, 보상/성장 테이블';
  return '기획 의도서, 시스템/콘텐츠 명세, 데이터 테이블 샘플';
}

function priorityFor(band, decision, role) {
  if (decision.manual) return '확인필요';
  if (band === '신입/경력무관' || band === '1~3년차') return '상';
  if (role === 'UI/UX 기획') return '중';
  if (decision.minYear === 5) return '중';
  return '중상';
}

function trimForSheet(text, length) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  return normalized.length > length ? `${normalized.slice(0, length - 1)}…` : normalized;
}

function buildJob(item, detail, decision) {
  const role = classifyRole(item, detail);
  return {
    기준일: BASE_DATE,
    경력구간: decision.band,
    회사: item.company,
    공고명: item.title,
    직무분류: role,
    주요업무: trimForSheet(detail.tasks, 650),
    요구역량: trimForSheet(detail.requirements || decision.bodyExperience, 650),
    우대사항: trimForSheet(detail.preferences, 500),
    추천포트폴리오: portfolioFor(role),
    지원우선도: priorityFor(decision.band, decision, role),
    공고URL: item.url,
    비고: [item.deadline, item.location, item.gameField].filter(Boolean).join(' | '),
    표시경력: item.listedExperience || detail.visibleExperience,
    본문요구경력: decision.bodyExperience,
    수동입력경력: decision.manual ? '확인 전' : decision.manualExperience,
    경력판정근거: decision.evidence,
  };
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    acc[row[key]] = (acc[row[key]] || 0) + 1;
    return acc;
  }, {});
}

function summaryText(jobs, excluded, meta) {
  const roleCounts = Object.entries(countBy(jobs, '직무분류')).sort((a, b) => b[1] - a[1]);
  const manual = jobs.filter(job => job.본문요구경력 === '수동 확인 필요').length;
  const vague = jobs.filter(job => job.본문요구경력 === '경력 문구 있음/연차 미기재').length;
  const reps = jobs
    .filter(job => job.지원우선도 === '상')
    .slice(0, 3)
    .map(job => `${job.회사} ${job.공고명}`)
    .join(' / ');
  return [
    `GameJob 게임기획 duty=9 ${meta.unique}/${meta.total || meta.unique}건 상세 확인.`,
    `대표 공고: ${reps || '상위 우선도 공고 없음'}.`,
    `요구 역량은 ${roleCounts.slice(0, 4).map(([role, count]) => `${role} ${count}건`).join(', ')} 중심.`,
    `포트폴리오는 시스템 명세, 밸런스/레벨 문서, UI/UX 와이어프레임을 우선 보강.`,
    `수동확인 ${manual}건, 연차미기재 ${vague}건, 제외 ${excluded.length}건.`,
    `출처: ${LIST_PAGE_URL}`,
  ].join(' ');
}

function buildWeeklySummary(jobs, excluded, meta) {
  const bands = countBy(jobs, '경력구간');
  const roles = Object.entries(countBy(jobs, '직무분류')).sort((a, b) => b[1] - a[1]);
  return {
    기준일: BASE_DATE,
    '신입/경력무관': bands['신입/경력무관'] || 0,
    '1~3년차': bands['1~3년차'] || 0,
    '3~5년차': bands['3~5년차'] || 0,
    총공고수: jobs.length,
    대표키워드: roles.slice(0, 6).map(([role, count]) => `${role} ${count}건`).join(', '),
    이번주전략: summaryText(jobs, excluded, meta),
    아카이브메모: `자동화 아카이브는 백업. 기준일 ${BASE_DATE}, 수집시각 ${timestampKst()}, GameJob 목록 ${meta.total || meta.unique}건.`,
  };
}

async function mapInBatches(items, mapper, batchSize = 8) {
  const output = [];
  for (let index = 0; index < items.length; index += batchSize) {
    output.push(...await Promise.all(items.slice(index, index + batchSize).map(mapper)));
    console.error(`details ${Math.min(index + batchSize, items.length)}/${items.length}`);
  }
  return output;
}

async function collect() {
  const listingResult = await collectListings();
  const details = await mapInBatches(listingResult.rows, async item => {
    try {
      return { item, detail: await readDetail(item) };
    } catch (error) {
      return { item, detail: null, error: String(error) };
    }
  });

  const jobs = [];
  const excluded = [];
  for (const entry of details) {
    const { item } = entry;
    if (!entry.detail) {
      excluded.push({
        기준일: BASE_DATE,
        '회사/공고명': `${item.company} / ${item.title}`,
        제외분류: '상세확인실패',
        제외이유: entry.error || '상세 페이지 수집 실패',
        URL: item.url,
      });
      continue;
    }
    const decision = careerDecision(item, entry.detail);
    const exclusion = exclusionFor(item, entry.detail, decision);
    if (exclusion || decision.band === '제외') {
      excluded.push({
        기준일: BASE_DATE,
        '회사/공고명': `${item.company} / ${item.title}`,
        제외분류: exclusion ? exclusion[0] : '경력초과',
        제외이유: exclusion ? exclusion[1] : decision.evidence,
        URL: item.url,
      });
      continue;
    }
    jobs.push(buildJob(item, entry.detail, decision));
  }

  const meta = {
    baseDate: BASE_DATE,
    total: listingResult.total,
    unique: listingResult.rows.length,
    included: jobs.length,
    excluded: excluded.length,
    manualRequired: jobs.filter(job => job.본문요구경력 === '수동 확인 필요').length,
    vagueCareer: jobs.filter(job => job.본문요구경력 === '경력 문구 있음/연차 미기재').length,
  };

  return {
    replaceCollectedRowsForDate: true,
    weeklySummary: buildWeeklySummary(jobs, excluded, meta),
    jobs,
    excluded,
    meta,
  };
}

async function postPayload(payload) {
  if (SKIP_POST) return { skipped: true, reason: DRY_RUN ? 'dry run' : 'skip-post' };
  if (!SECRET) throw new Error('GAMEJOB_AUTOMATION_SECRET is required for POST.');
  const response = await fetch(SHEET_POST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, secret: SECRET }),
  });
  const text = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { raw: text.slice(0, 1000) };
  }
  if (!response.ok || parsed.ok === false) {
    throw new Error(`POST failed ${response.status}: ${JSON.stringify(parsed).slice(0, 1000)}`);
  }
  return parsed;
}

async function main() {
  const payload = await collect();
  await fs.mkdir(OUT_DIR, { recursive: true });
  const payloadPath = path.join(OUT_DIR, `gamejob_payload_${BASE_DATE}.json`);
  await fs.writeFile(payloadPath, JSON.stringify(payload, null, 2), 'utf8');
  const postResult = await postPayload(payload);
  const postPath = path.join(OUT_DIR, `gamejob_post_result_${BASE_DATE}.json`);
  await fs.writeFile(postPath, JSON.stringify(postResult, null, 2), 'utf8');
  console.log(JSON.stringify({ meta: payload.meta, postResult, payloadPath, postPath }, null, 2));
}

await main();
