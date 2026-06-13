import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://www.gamejob.co.kr';
const LIST_URL = `${BASE}/Recruit/joblist?duty=9&menucode=duty`;
const AJAX_URL = `${BASE}/Recruit/_GI_Job_List/`;
const SHEET_POST_URL = 'https://script.google.com/macros/s/AKfycbyR7kMLzYOAijbXmb4B7TEguwGv6wHwVhG7V26HvpJIkX1qljHNuDW3S7fuVs_8nvoV/exec';
const env = typeof process !== 'undefined' ? process.env : {};
const 기준일 = globalThis.GAMEJOB_BASE_DATE || env.GAMEJOB_BASE_DATE || '2026-06-04';
const runStamp = formatKst(new Date());
const cutoff = sixMonthsBeforeKst(기준일);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..', 'tmp');

function formatKst(date) {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} KST`;
}

function sixMonthsBeforeKst(baseDate) {
  const date = new Date(`${baseDate}T00:00:00+09:00`);
  date.setUTCMonth(date.getUTCMonth() - 6);
  return date;
}

function decodeHtml(value = '') {
  return value
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
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
  for (let attempt = 0; attempt <= retry; attempt += 1) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36',
          Referer: LIST_URL,
          ...(options.headers || {}),
        },
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return text;
    } catch (error) {
      if (attempt === retry) throw error;
      await new Promise(resolve => setTimeout(resolve, 350 * (attempt + 1)));
    }
  }
}

function parseTotal(html) {
  const plain = stripTags(html);
  const match = plain.match(/전체\s*\(([\d,]+)\)/);
  return match ? Number(match[1].replace(/,/g, '')) : 0;
}

function ajaxBody(page) {
  const pairs = [
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
  ];
  return new URLSearchParams(pairs).toString();
}

function parseListRows(html) {
  const listStart = html.indexOf('전체 채용정보 리스트');
  const scoped = listStart >= 0 ? html.slice(listStart) : html;
  const tbody = scoped.match(/<tbody>([\s\S]*?)<\/tbody>/i)?.[1] || scoped;
  const rowMatches = [...tbody.matchAll(/<tr>\s*([\s\S]*?)\s*<\/tr>/gi)];
  return rowMatches.map(row => parseListRow(row[1])).filter(Boolean);
}

function parseListRow(rowHtml) {
  const company = stripTags(rowHtml.match(/<div class="company[\s\S]*?<strong>([\s\S]*?)<\/strong>/i)?.[1] || '');
  const link = rowHtml.match(/<div class="tit">[\s\S]*?<a href="([^"]*GI_No=(\d+)[^"]*)"[\s\S]*?<strong>([\s\S]*?)<\/strong>/i);
  if (!company || !link) return null;
  const spans = [...(rowHtml.match(/<p class="info">([\s\S]*?)<\/p>/i)?.[1] || '').matchAll(/<span>([\s\S]*?)<\/span>/gi)].map(m => stripTags(m[1]));
  const date = stripTags(rowHtml.match(/<span class="date">([\s\S]*?)<\/span>/i)?.[1] || '');
  const modifyRaw = stripTags(rowHtml.match(/<span class="modifyDate">([\s\S]*?)<\/span>/i)?.[1] || '');
  const href = decodeHtml(link[1]).startsWith('http') ? decodeHtml(link[1]) : `${BASE}${decodeHtml(link[1])}`;
  return {
    giNo: link[2],
    company,
    title: stripTags(link[3]),
    url: href,
    표시경력: spans[0] || '',
    location: spans[2] || '',
    gameField: spans[3] || '',
    employment: spans[4] || '',
    deadline: date,
    listModifiedRaw: modifyRaw,
  };
}

function extractSectionText(text, start, endCandidates) {
  const startIndex = text.indexOf(start);
  if (startIndex < 0) return '';
  let endIndex = text.length;
  for (const end of endCandidates) {
    const idx = text.indexOf(end, startIndex + start.length);
    if (idx > startIndex && idx < endIndex) endIndex = idx;
  }
  return text.slice(startIndex + start.length, endIndex).replace(/\s+/g, ' ').trim();
}

function parseDetail(html) {
  const text = stripTags(html);
  const 모집분야 = extractSectionText(text, '모집분야', ['키워드', '대표게임', '게임분야']);
  const 키워드 = extractSectionText(text, '키워드', ['대표게임', '게임분야', '경력']);
  const 상세경력 = extractSectionText(text, '경력', ['고용형태', '학력', '직급/직책', '모집인원']).replace(/^[:\s]+/, '');
  const 담당업무 = extractSectionText(text, '담당업무', ['근무지역', '복리후생', '접수안내']);
  const registered = text.match(/(20\d{2}-\d{2}-\d{2})\s+\d{1,2}:\d{2}\s+등록/)?.[1] || '';
  const modified = text.match(/(20\d{2}-\d{2}-\d{2})\s+\d{1,2}:\d{2}\s+수정/)?.[1] || '';
  return { text, 모집분야, 키워드, 상세경력, 담당업무, registered, modified };
}

function parseListDate(raw) {
  const m = raw.match(/(\d{2})\/(\d{2})/);
  if (!m) return null;
  const month = Number(m[1]);
  const year = month > 6 ? 2025 : 2026;
  return new Date(`${year}-${m[1]}-${m[2]}T00:00:00+09:00`);
}

function latestDate(item, detail) {
  const raw = detail.modified || detail.registered;
  if (raw) return new Date(`${raw}T00:00:00+09:00`);
  return parseListDate(item.listModifiedRaw);
}

function minYearFrom(text) {
  const matches = [...String(text).matchAll(/(?<!20)(\d{1,2})\s*년(?:\s*이상|차|↑)/g)].map(m => Number(m[1]));
  return matches.length ? Math.min(...matches) : null;
}

function careerDecision(item, detail) {
  const bodyForCareer = isBodyUnavailable(detail.담당업무) ? '' : detail.담당업무;
  const combined = `${detail.상세경력} ${item.표시경력} ${bodyForCareer}`;
  const min = minYearFrom(combined);
  const visible = detail.상세경력 || item.표시경력 || '';
  const manualBody = /무관|신입/.test(visible) && isBodyUnavailable(detail.담당업무);
  if (min !== null) {
    return {
      minYear: min,
      본문요구경력: `${min}년 이상`,
      수동입력경력: min >= 6 ? '6년 이상/제외' : `${min}년 이상`,
      경력판정근거: `상세/본문 경력 문구에서 ${min}년 이상 확인`,
      manual: false,
    };
  }
  if (/실무\s*경력|관련\s*경력|경력자/.test(combined)) {
    return {
      minYear: null,
      본문요구경력: '경력 문구 있음/연차 미기재',
      수동입력경력: '연차 미기재',
      경력판정근거: '연차 없는 실무/관련 경력 요구 문구 확인',
      manual: false,
    };
  }
  if (/무관|신입|신입·경력|신입\/경력/.test(visible)) {
    return {
      minYear: null,
      본문요구경력: manualBody ? '수동 확인 필요' : '연차 명시 없음',
      수동입력경력: manualBody ? '확인 전' : '신입/경력 없음',
      경력판정근거: manualBody ? 'GameJob 상세 담당업무/자격조건 자동 추출 불가' : '상세 경력 무관/신입 확인',
      manual: manualBody,
    };
  }
  return {
    minYear: null,
    본문요구경력: '수동 확인 필요',
    수동입력경력: '확인 전',
    경력판정근거: '경력 표시 또는 본문 자동 판정 불가',
    manual: true,
  };
}

function isBodyUnavailable(body) {
  const normalized = body.replace(/담당업무|자격조건|자격요건/g, '').trim();
  return normalized.length < 12 || /^근무지역\b/.test(normalized) || /^복리후생\b/.test(normalized) || /^자격조건\s*근무지역\b/.test(body);
}

function bandFor(decision) {
  if (decision.minYear !== null) {
    if (decision.minYear > 5) return '제외';
    if (decision.minYear >= 3) return '3~5년차';
    if (decision.minYear >= 1) return '1~3년차';
  }
  return '신입/경력무관';
}

function hasAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text));
}

function isNarrativeSettingRole(text) {
  return /시나리오|스토리|내러티브|세계관|캐릭터\s*설정|설정\s*기획|기획.{0,12}설정|scenario|narrative|story\s*writer|scenario\s*writer|라이터|작가/i.test(text);
}

const ALLOWED_COMMUTE_LOCATION_PATTERN = /서울|경기|경기도|가평|고양|과천|광명|광주|구리|군포|김포|남양주|동두천|부천|분당|성남|수원|시흥|안산|안성|안양|양주|양평|여주|연천|오산|용인|의왕|의정부|이천|일산|파주|판교|평택|포천|하남|화성|동탄/i;
const OUTSIDE_COMMUTE_LOCATION_PATTERN = /인천|부산|대구|대전|광주|울산|세종|강원|충북|충청북도|충남|충청남도|전북|전라북도|전남|전라남도|경북|경상북도|경남|경상남도|제주|서귀포|전국|춘천|원주|강릉|청주|충주|천안|아산|전주|군산|익산|목포|순천|여수|포항|구미|경산|창원|김해|양산|진주/i;
const HOUSING_SUPPORT_PATTERN = /기숙사|숙소\s*제공|사택|주거\s*(?:공간|지원|제공)|거주\s*지원|주거비|월세\s*지원|전세\s*지원|숙박\s*제공|housing|accommodation|dormitory|company\s*housing/i;

function isOutsideAllowedCommuteLocation(location) {
  const value = String(location || '').trim();
  if (!value) return false;
  if (ALLOWED_COMMUTE_LOCATION_PATTERN.test(value)) return false;
  return OUTSIDE_COMMUTE_LOCATION_PATTERN.test(value);
}

function hasHousingSupport(text) {
  return HOUSING_SUPPORT_PATTERN.test(String(text || ''));
}

function classifyJobType(item, detail) {
  const title = item.title.toLowerCase();
  const text = `${item.title} ${detail.모집분야} ${detail.키워드}`.toLowerCase();
  if (/전투|밸런스|combat|balance|몬스터/.test(title)) return '전투/밸런스 기획';
  if (/레벨|퀘스트|level|quest/.test(title)) return '레벨/퀘스트 기획';
  if (/ui.?ux|ui기획|ui\s*디자인|ui\s*디자이너|ux\s*디자인|ux\s*디자이너|ux|인터페이스|interface\s*design|interface\s*designer/.test(title)) return 'UI/UX 기획';
  if (/시스템|컨텐츠|콘텐츠|보상|성장|라이브|system|content/.test(title)) return '시스템/콘텐츠 기획';
  if (/전투|밸런스|combat|balance|몬스터/.test(text)) return '전투/밸런스 기획';
  if (/레벨|퀘스트|level|quest/.test(text)) return '레벨/퀘스트 기획';
  if (/ui.?ux|ui기획|ui\s*디자인|ui\s*디자이너|ux\s*디자인|ux\s*디자이너|ux|인터페이스|interface\s*design|interface\s*designer/.test(text)) return 'UI/UX 기획';
  if (/시스템|컨텐츠|콘텐츠|보상|성장|라이브|system|content/.test(text)) return '시스템/콘텐츠 기획';
  return '게임기획';
}

function shouldExclude(item, detail, decision) {
  const text = `${item.company} ${item.title} ${detail.모집분야} ${detail.키워드}`;
  const fullText = `${text} ${item.location || ''} ${detail.text || ''}`;
  const lower = text.toLowerCase();
  const title = item.title;
  const strongTitleInclude = /게임기획|기획자|글로벌\s*기획|기획\s*담당|시스템\s*기획|컨텐츠|콘텐츠|전투|밸런스|레벨|퀘스트|라이브\s*기획|ui.?ux\s*기획|ui\s*기획|ui\s*디자인|ui\s*디자이너|ux\s*설계|ux\s*디자인|ux\s*디자이너|인터페이스\s*(?:디자인|디자이너)?|interface\s*(?:design|designer)|game designer|system designer|combat designer|level designer|전투\s*디자이너|시스템\s*디자이너|레벨\s*디자이너/i.test(title);
  if (/아이언메이스|ironmace|디나미스원/.test(text)) return ['제외회사', '사용자 지정 제외 회사'];
  if (latestDate(item, detail) && latestDate(item, detail) < cutoff) return ['수정일 6개월 초과', '수정일 기준 6개월 이상 경과'];
  if (isOutsideAllowedCommuteLocation(item.location) && !hasHousingSupport(fullText)) return ['지역/주거 조건', `근무지 ${item.location || '서울/경기도 권외'}이며 주거 공간 제공 문구 없음`];
  if (/전\s*부문|수시채용|직군별|부문별|전분야|전\s*분야/.test(item.title)) return ['중복/혼합공고', '세부 직무 공고와 중복될 수 있는 상위 묶음 공고'];
  if (isNarrativeSettingRole(text)) return ['비대상 직무', '시나리오/설정 기획은 사용자 요청에 따라 수집 제외'];
  if (decision.minYear !== null && decision.minYear > 5) return ['경력초과', `최소 ${decision.minYear}년 이상으로 대상 범위 초과`];
  if (/\b(pm|product manager|project manager)\b/i.test(text) || /프로덕트\s*매니저|프로젝트\s*매니저|개발\s*pm|서비스\s*pm|사업\s*pm|운영\s*pm|퍼블리싱\s*매니저|그래픽아웃소싱\s*pm|아트\s*pm/i.test(text)) {
    if (!/ui.?ux\s*기획|ui\s*기획|ui\s*디자인|ui\s*디자이너|ux\s*설계|ux\s*디자인|ux\s*디자이너|인터페이스\s*(?:디자인|디자이너)?|interface\s*(?:design|designer)|게임\s*웹\s*기획자/.test(text)) return ['PM/매니저', 'PM/매니저 중심 직무'];
  }
  if (/bm\s*기획|bm 기획|사업지표/i.test(text) && !/전투|시스템|콘텐츠|컨텐츠|보상|성장/.test(title)) return ['범위불명확', 'BM/사업지표 중심 여부 수동 확인 필요'];
  if (strongTitleInclude) return null;
  if (/qa|테스터|cs|gm|커뮤니티|고객|마케팅|브랜드|인플루언서|영업|사업기획|번역|강사|튜터|교육|데이터\s*애널|데이터\s*qa/i.test(text)) return ['비대상 직무', 'QA/운영/마케팅/사업/교육/데이터 등 제외 직군'];
  if (/프로그래머|클라이언트|서버|개발자|엔지니어|devops|react native|프론트엔드|백엔드|unity\s*개발|unreal\s*개발/i.test(text)) return ['개발직군', '프로그래밍/서버/클라이언트/엔지니어 직군'];
  if (/원화|모델러|모델링|애니메이터|이펙트|fx|그래픽|아이콘\s*작업자|아웃소싱|외주관리|도트\s*디자이너|ui.?ux\s*디자이너|ux\/ui\s*designer/i.test(text)) {
    if (!/ui.?ux\s*디자이너|ux\/ui\s*designer|ui\s*디자인|ux\s*디자인|인터페이스\s*(?:디자인|디자이너)?|interface\s*(?:design|designer)|전투\s*디자이너|시스템\s*디자이너|레벨\s*디자이너|game designer|combat designer|system designer|level designer/i.test(text)) {
      return ['아트/디자인', '순수 그래픽/디자인/외주관리 직군'];
    }
  }
  const includePatterns = [
    /게임기획|기획자|기획\s*담당|시스템\s*기획|컨텐츠|콘텐츠|전투|밸런스|레벨|퀘스트|라이브\s*기획|ui.?ux\s*기획|ui\s*기획|ui\s*디자인|ui\s*디자이너|ux\s*설계|ux\s*디자인|ux\s*디자이너|인터페이스\s*(?:디자인|디자이너)?/i,
    /game designer|system designer|combat designer|level designer/i,
    /interface\s*(?:design|designer)/i,
    /전투\s*디자이너|시스템\s*디자이너|레벨\s*디자이너/i,
  ];
  if (!hasAny(text, includePatterns)) return ['비대상 직무', '포함 대상 게임기획 산출물 직무로 자동 분류되지 않음'];
  return null;
}

function mainTask(jobType) {
  if (jobType.includes('전투')) return '전투/밸런스 설계 및 데이터 튜닝';
  if (jobType.includes('레벨')) return '레벨 구조, 동선, 조우/퀘스트 흐름 기획';
  if (jobType.includes('UI/UX')) return '게임 UI/UX 플로우와 화면 정책 기획';
  if (jobType.includes('시스템')) return '시스템/콘텐츠 구조와 보상·성장 루프 기획';
  return '게임 기획 산출물 작성';
}

function portfolioFor(jobType) {
  if (jobType.includes('전투')) return '전투 규칙서, 스킬/몬스터 패턴 문서, 밸런스 테이블';
  if (jobType.includes('레벨')) return '레벨 블록아웃, 동선/기믹 문서, 난이도 곡선';
  if (jobType.includes('UI/UX')) return '플로우차트, 와이어프레임, 화면 정책서';
  if (jobType.includes('시스템')) return '시스템 명세서, 콘텐츠 루프, 보상/경제 테이블';
  return '기획서, 데이터 테이블, 플레이 분석 기반 개선안';
}

function priorityFor(band, decision, item) {
  if (decision.manual) return '확인필요';
  if (band === '1~3년차' || /신입/.test(item.표시경력)) return '상';
  if (decision.minYear === 5) return '하';
  return '중';
}

function toJob(item, detail, decision) {
  const 직무분류 = classifyJobType(item, detail);
  const 경력구간 = bandFor(decision);
  const modified = latestDate(item, detail);
  const staleNote = modified ? `수정/등록 ${modified.toISOString().slice(0, 10)}` : `목록 ${item.listModifiedRaw}`;
  return {
    기준일,
    경력구간,
    회사: item.company,
    공고명: item.title,
    직무분류,
    주요업무: mainTask(직무분류),
    요구역량: decision.manual ? '상세 담당업무/자격조건 수동 확인 필요' : `${decision.본문요구경력}, ${직무분류} 이해`,
    우대사항: item.gameField || detail.키워드 || '',
    추천포트폴리오: portfolioFor(직무분류),
    지원우선도: priorityFor(경력구간, decision, item),
    공고URL: item.url,
    비고: `${staleNote}; ${item.deadline || '마감 정보 확인 필요'}`,
    표시경력: item.표시경력 || detail.상세경력,
    본문요구경력: decision.본문요구경력,
    수동입력경력: decision.수동입력경력,
    경력판정근거: decision.경력판정근거,
  };
}

function keywordSummary(jobs) {
  const counts = new Map();
  for (const job of jobs) counts.set(job.직무분류, (counts.get(job.직무분류) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${v}건`).join(', ');
}

function countBy(jobs, key) {
  return jobs.reduce((acc, job) => {
    acc[job[key]] = (acc[job[key]] || 0) + 1;
    return acc;
  }, {});
}

async function collect() {
  const firstHtml = await fetchText(LIST_URL);
  const total = parseTotal(firstHtml);
  const pages = Math.max(1, Math.ceil(total / 40));
  const all = [];
  for (let page = 1; page <= pages; page += 1) {
    const html = await fetchText(AJAX_URL, {
      method: 'POST',
      body: ajaxBody(page),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    const rows = parseListRows(html);
    all.push(...rows);
    console.error(`page ${page}/${pages}: ${rows.length}`);
  }
  const unique = [...new Map(all.map(row => [row.giNo, row])).values()];
  const details = new Map();
  let done = 0;
  for (const item of unique) {
    const html = await fetchText(item.url);
    details.set(item.giNo, parseDetail(html));
    done += 1;
    if (done % 50 === 0) console.error(`details ${done}/${unique.length}`);
  }

  const jobs = [];
  const excluded = [];
  for (const item of unique) {
    const detail = details.get(item.giNo);
    const decision = careerDecision(item, detail);
    const exclusion = shouldExclude(item, detail, decision);
    if (exclusion) {
      excluded.push({
        기준일,
        '회사/공고명': `${item.company} / ${item.title}`,
        제외분류: exclusion[0],
        제외이유: exclusion[1],
        URL: item.url,
      });
      continue;
    }
    jobs.push(toJob(item, detail, decision));
  }

  const bandCounts = countBy(jobs, '경력구간');
  const manualCount = jobs.filter(job => job.수동입력경력 === '확인 전').length;
  const staleExcluded = excluded.filter(row => row.제외분류 === '수정일 6개월 초과').length;
  const weeklySummary = {
    기준일,
    '신입/경력무관': bandCounts['신입/경력무관'] || 0,
    '1~3년차': bandCounts['1~3년차'] || 0,
    '3~5년차': bandCounts['3~5년차'] || 0,
    총공고수: jobs.length,
    대표키워드: keywordSummary(jobs),
    이번주전략: `전수 ${unique.length}/${total}건 재분류. 확인 전 ${manualCount}건은 원문/외부 지원 페이지 확인 후 우선순위 확정. 1~3년차와 신입 공고는 포트폴리오 즉시 매칭.`,
    아카이브메모: `GameJob duty=9 전체 ${total}건, 유니크 ${unique.length}건. 수정일 6개월 초과 제외 ${staleExcluded}건. 중복/혼합/PM/개발/아트/QA/제외회사 분리.`,
    작성시각: runStamp,
  };
  return {
    replaceCollectedRowsForDate: true,
    weeklySummary,
    jobs,
    excluded,
    meta: {
      기준일,
      runStamp,
      total,
      unique: unique.length,
      included: jobs.length,
      excluded: excluded.length,
      manualCount,
      pages,
    },
  };
}

async function postPayload(payload) {
  const secret = globalThis.GAMEJOB_AUTOMATION_SECRET || env.GAMEJOB_AUTOMATION_SECRET;
  if (!secret) return { skipped: true, reason: 'GAMEJOB_AUTOMATION_SECRET not set' };
  const res = await fetch(SHEET_POST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, secret }),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text: text.slice(0, 1000) };
}

const payload = await collect();
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, `gamejob_payload_${기준일}.json`), JSON.stringify(payload, null, 2), 'utf8');
const postResult = await postPayload(payload);
await fs.writeFile(path.join(outDir, `gamejob_post_result_${기준일}.json`), JSON.stringify(postResult, null, 2), 'utf8');
console.log(JSON.stringify({ meta: payload.meta, postResult }, null, 2));
