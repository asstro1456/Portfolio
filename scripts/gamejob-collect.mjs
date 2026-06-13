import process from 'node:process';

const ENDPOINT = 'https://script.google.com/macros/s/AKfycbyR7kMLzYOAijbXmb4B7TEguwGv6wHwVhG7V26HvpJIkX1qljHNuDW3S7fuVs_8nvoV/exec';
const LIST_URL = 'https://www.gamejob.co.kr/Recruit/_GI_Job_List?Page=';
const DETAIL_URL = 'https://www.gamejob.co.kr/Recruit/GI_Read/View?GI_No=';
const WORK_URL = 'https://www.gamejob.co.kr/Recruit/GI_Read_Comt_Ifrm?gno=';
const REQUIREMENT_URL = 'https://www.gamejob.co.kr/Recruit/GI_Read_GI_Comment_Ifrm?gno=';
const BASE_DATE = process.env.CAREER_HUB_BASE_DATE || new Date().toISOString().slice(0, 10);
const SECRET = process.env.CAREER_HUB_WEBHOOK_SECRET || '';
const dryRun = process.argv.includes('--dry-run');
const replaceRows = process.argv.includes('--replace');

const excludedCompanyPattern = /(아이언메이스|IRONMACE|디나미스원)/i;
const excludedRolePattern = /(\bPM\b|Product Manager|프로젝트\s*매니저|마케팅|QA|테스터|강사|교육|취업\s*연수생|지원사업\s*관리|사업\s*기획|프로그래머|개발자|엔지니어|번역|영상편집|원화|시나리오|스토리|설정\s*기획|캐릭터\s*설정|내러티브|세계관|라이터|작가|scenario|narrative)/i;
const allowedCommuteLocationPattern = /서울|경기|경기도|가평|고양|과천|광명|광주|구리|군포|김포|남양주|동두천|부천|분당|성남|수원|시흥|안산|안성|안양|양주|양평|여주|연천|오산|용인|의왕|의정부|이천|일산|파주|판교|평택|포천|하남|화성|동탄/i;
const outsideCommuteLocationPattern = /인천|부산|대구|대전|광주|울산|세종|강원|충북|충청북도|충남|충청남도|전북|전라북도|전남|전라남도|경북|경상북도|경남|경상남도|제주|서귀포|전국|춘천|원주|강릉|청주|충주|천안|아산|전주|군산|익산|목포|순천|여수|포항|구미|경산|창원|김해|양산|진주/i;
const housingSupportPattern = /기숙사|숙소\s*제공|사택|주거\s*(?:공간|지원|제공)|거주\s*지원|주거비|월세\s*지원|전세\s*지원|숙박\s*제공|housing|accommodation|dormitory|company\s*housing/i;

function decodeText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

async function requestText(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.text();
}

async function readListPage(page) {
  const html = await requestText(`${LIST_URL}${page}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: `dutyCtgr=1&duty=9&menucode=duty&Page=${page}`
  });

  return [...html.matchAll(/<tr>[\s\S]*?\/Recruit\/GI_Read\/View\?GI_No=(\d+)[\s\S]*?<\/tr>/g)].map((match) => {
    const row = match[0];
    const id = match[1];
    const company = decodeText((row.match(/class=.company[^>]*>[\s\S]*?<strong>([\s\S]*?)<\/strong>/) || [])[1] || '');
    const title = decodeText((row.match(new RegExp(`GI_No=${id}[\\s\\S]*?<strong>([\\s\\S]*?)<\\/strong>`)) || [])[1] || '');
    const spans = [...row.matchAll(/<span>([\s\S]*?)<\/span>/g)].map((item) => decodeText(item[1]));
    return { id, company, title, listedExperience: spans[0] || '', metadata: spans.slice(1) };
  });
}

async function readAllListings() {
  const rows = [];
  const seen = new Set();

  for (let page = 1; page <= 30; page += 1) {
    const pageRows = await readListPage(page);
    let inserted = 0;
    pageRows.forEach((row) => {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        rows.push(row);
        inserted += 1;
      }
    });
    if (pageRows.length === 0 || inserted === 0) break;
  }

  return rows;
}

function listedLocation(row) {
  const metadata = row.metadata || [];
  return metadata.find((value) => allowedCommuteLocationPattern.test(value) || outsideCommuteLocationPattern.test(value)) || metadata[1] || '';
}

function isOutsideAllowedCommuteLocation(location) {
  const value = String(location || '').trim();
  if (!value) return false;
  if (allowedCommuteLocationPattern.test(value)) return false;
  return outsideCommuteLocationPattern.test(value);
}

function hasHousingSupport(text) {
  return housingSupportPattern.test(String(text || ''));
}

function locationHousingExclusion(row, details = null) {
  const location = listedLocation(row);
  if (!isOutsideAllowedCommuteLocation(location)) return null;
  const detailText = details ? `${details.work} ${details.requirements} ${details.raw}` : '';
  if (hasHousingSupport(`${location} ${detailText}`)) return null;
  return {
    category: '지역/주거 조건',
    reason: `근무지 ${location || '서울/경기도 권외'}이며 주거 공간 제공 문구 없음`
  };
}

function roleCategory(title) {
  if (/UI\s*\/\s*UX|UX\s*\/\s*UI|UI\s*(?:디자인|디자이너|Designer)|UX\s*(?:디자인|디자이너|Designer)|인터페이스\s*(?:디자인|디자이너)?|interface\s*(?:design|designer)/i.test(title)) return 'UI/UX 기획 연관';
  if (/전투|밸런스|벨런스|밸런싱/.test(title)) return '전투/밸런스';
  if (/레벨|퀘스트|맵/.test(title)) return '레벨/퀘스트';
  if (/BM|서비스/.test(title)) return 'BM/서비스 기획';
  if (/시스템|콘텐츠|컨텐츠/.test(title)) return '시스템/콘텐츠';
  return '게임기획';
}

function portfolioFor(category) {
  const mapping = {
    'UI/UX 기획 연관': 'UI/UX 플로우 개선안',
    '전투/밸런스': '전투/밸런스 설계 문서',
    '레벨/퀘스트': '레벨/퀘스트 설계 문서',
    '시스템/콘텐츠': '시스템/콘텐츠 기획서',
    'BM/서비스 기획': '라이브/BM 분석 문서',
    '게임기획': '프로젝트 맞춤 기획서 선별'
  };
  return mapping[category] || '';
}

function listedCareerBand(row) {
  const titleNumbers = [...row.title.matchAll(/(?:경력\s*)?(\d+)\s*(?:년|[-~])/g)].map((match) => Number(match[1]));
  const listed = row.listedExperience.match(/경력\s*(\d+)년/);
  const minimum = titleNumbers.length > 0 ? Math.min(...titleNumbers) : listed ? Number(listed[1]) : null;
  if (minimum !== null) {
    if (minimum > 5) return null;
    return minimum <= 2 ? '1~3년차' : '3~5년차';
  }
  if (/신입|무관|인턴/.test(row.listedExperience)) return '신입/경력무관';
  return null;
}

function bodyExperienceFromListed(row) {
  const source = `${row.listedExperience} ${row.title}`;
  const titleNumbers = [...row.title.matchAll(/(?:경력\s*)?(\d+)\s*(?:년|[-~])/g)].map((match) => Number(match[1]));
  const listed = row.listedExperience.match(/경력\s*(\d+)년/);
  const minimum = titleNumbers.length > 0 ? Math.min(...titleNumbers) : listed ? Number(listed[1]) : null;
  if (minimum !== null) return minimum >= 6 ? '6년 이상/제외' : `${minimum}년 이상`;
  if (/신입/.test(source)) return '신입';
  if (/무관|인턴/.test(source)) return '연차 명시 없음';
  return '수동 확인 필요';
}

async function readDetails(id) {
  const [workHtml, requirementsHtml] = await Promise.all([
    requestText(`${WORK_URL}${id}&v1`),
    requestText(`${REQUIREMENT_URL}${id}&v1`)
  ]);
  return {
    raw: `${workHtml} ${requirementsHtml}`,
    work: decodeText(workHtml).replace(/^채용공고 상세페이지\s*/, '').trim(),
    requirements: decodeText(requirementsHtml).replace(/^채용공고 상세페이지\s*/, '').trim()
  };
}

function analyzeBodyExperience(details) {
  const fullText = `${details.work} ${details.requirements}`.trim();
  const meaningfulText = fullText.replace(/지원하기|-+/g, '').trim();
  const bodyUnreadable = meaningfulText.length < 24 || (!/(자격|지원|경력|업무|찾고|우대|경험)/.test(meaningfulText) && /<img/i.test(details.raw));
  if (bodyUnreadable) {
    return {
      bodyExperience: '수동 확인 필요',
      evidence: '자격요건 본문이 이미지 또는 외부 지원 형식으로 자동 판정 불가',
      manualRequired: true,
      minimumYears: null
    };
  }

  const contexts = [...meaningfulText.matchAll(/.{0,45}(?:경력|년차|실무\s*경험|실무\s*경력|신입|주니어).{0,90}/g)]
    .map((match) => match[0].trim());
  const years = [];

  const entryWithUpperLimit = meaningfulText.match(/신입\s*또는\s*경력\s*(\d+)\s*년\s*이하/);
  if (entryWithUpperLimit) {
    return {
      bodyExperience: '신입',
      evidence: (contexts.find((context) => context.includes(entryWithUpperLimit[0])) || entryWithUpperLimit[0]).slice(0, 300),
      manualRequired: false,
      minimumYears: null
    };
  }

  contexts.forEach((context) => {
    [
      /(?:관련\s*(?:업무|직무)\s*)?(?:실무\s*)?경력\s*(\d+)\s*년\s*(?:이상|초과)/,
      /(\d+)\s*년\s*이상.{0,30}(?:경력|경험)/,
      /(?:경력|실무\s*경험)\s*(\d+)\s*년차\s*(?:이상|초과)?/
    ].forEach((pattern) => {
      const matched = context.match(pattern);
      if (matched) years.push(Number(matched[1]));
    });
  });

  if (years.length > 0) {
    const minimumYears = Math.min(...years);
    return {
      bodyExperience: minimumYears >= 6 ? '6년 이상/제외' : `${minimumYears}년 이상`,
      evidence: contexts.slice(0, 2).join(' / ').slice(0, 300),
      manualRequired: false,
      minimumYears
    };
  }

  const vagueEvidence = contexts.find((context) => /(경력|실무\s*(?:경험|경력)|경력자)/.test(context));
  if (vagueEvidence) {
    return {
      bodyExperience: '경력 문구 있음/연차 미기재',
      evidence: vagueEvidence.slice(0, 300),
      manualRequired: false,
      minimumYears: null
    };
  }

  return {
    bodyExperience: '본문 연차 명시 없음',
    evidence: '상세 본문에서 연차 요구 문구를 확인하지 못함',
    manualRequired: false,
    minimumYears: null
  };
}

function reassignedBand(listBand, analysis) {
  if (analysis.minimumYears === null) return listBand;
  if (analysis.minimumYears > 5) return null;
  return analysis.minimumYears <= 2 ? '1~3년차' : '3~5년차';
}

async function mapInBatches(rows, mapper, batchSize = 8) {
  const output = [];
  for (let index = 0; index < rows.length; index += batchSize) {
    output.push(...await Promise.all(rows.slice(index, index + batchSize).map(mapper)));
  }
  return output;
}

async function collect() {
  const listings = await readAllListings();
  const jobs = [];
  const excluded = [];
  const detailCandidates = [];

  listings.forEach((row) => {
    const listBand = listedCareerBand(row);
    if (excludedCompanyPattern.test(row.company)) {
      excluded.push({
        기준일: BASE_DATE,
        '회사/공고명': `${row.company} | ${row.title}`,
        제외분류: '제외회사',
        제외이유: '사용자 지정 제외 회사',
        URL: `${DETAIL_URL}${row.id}`
      });
      return;
    }
    if (!listBand) return;
    if (excludedRolePattern.test(row.title)) {
      excluded.push({
        기준일: BASE_DATE,
        '회사/공고명': `${row.company} | ${row.title}`,
        제외분류: /\bPM\b|Product Manager|프로젝트\s*매니저/i.test(row.title) ? 'PM' : '비대상 직군',
        제외이유: '사용자 지정 제외 직무',
        URL: `${DETAIL_URL}${row.id}`
      });
      return;
    }
    const needsCareerDetail = /무관/.test(row.listedExperience);
    const needsLocationDetail = isOutsideAllowedCommuteLocation(listedLocation(row));
    if (needsCareerDetail || needsLocationDetail) {
      detailCandidates.push({ row, listBand, needsCareerDetail });
      return;
    }
    jobs.push(buildJobRow(row, listBand, {
      bodyExperience: bodyExperienceFromListed(row),
      evidence: `표시경력: ${row.listedExperience}`,
      manualRequired: false,
      minimumYears: null
    }));
  });

  const assessed = await mapInBatches(detailCandidates, async ({ row, listBand, needsCareerDetail }) => {
    const details = await readDetails(row.id);
    const analysis = needsCareerDetail
      ? analyzeBodyExperience(details)
      : {
          bodyExperience: bodyExperienceFromListed(row),
          evidence: `표시경력: ${row.listedExperience}`,
          manualRequired: false,
          minimumYears: null
        };
    return { row, listBand, details, analysis };
  });

  assessed.forEach(({ row, listBand, details, analysis }) => {
    const locationExclusion = locationHousingExclusion(row, details);
    if (locationExclusion) {
      excluded.push({
        기준일: BASE_DATE,
        '회사/공고명': `${row.company} | ${row.title}`,
        제외분류: locationExclusion.category,
        제외이유: locationExclusion.reason,
        URL: `${DETAIL_URL}${row.id}`
      });
      return;
    }

    const finalBand = reassignedBand(listBand, analysis);
    if (!finalBand) {
      excluded.push({
        기준일: BASE_DATE,
        '회사/공고명': `${row.company} | ${row.title}`,
        제외분류: '경력범위 외',
        제외이유: analysis.bodyExperience,
        URL: `${DETAIL_URL}${row.id}`
      });
      return;
    }
    jobs.push(buildJobRow(row, finalBand, analysis, details));
  });

  const bands = { '신입/경력무관': 0, '1~3년차': 0, '3~5년차': 0 };
  const roles = {};
  jobs.forEach((job) => {
    bands[job.경력구간] += 1;
    roles[job.직무분류] = (roles[job.직무분류] || 0) + 1;
  });
  const manualRequired = jobs.filter((job) => job.본문요구경력 === '수동 확인 필요').length;

  return {
    listings: listings.length,
    jobs,
    excluded,
    bands,
    roles,
    manualRequired
  };
}

function buildJobRow(row, band, analysis, details = null) {
  const category = roleCategory(row.title);
  const responsibility = details && details.work && !analysis.manualRequired
    ? details.work.slice(0, 450)
    : `${category} 공고 상세 확인 필요`;
  const requirements = details && details.requirements && !analysis.manualRequired
    ? details.requirements.slice(0, 450)
    : [row.listedExperience].concat(row.metadata).filter(Boolean).join(' | ');
  const edge = /경력\s*5년|5년\s*이상/.test(`${row.listedExperience} ${row.title}`);

  return {
    기준일: BASE_DATE,
    경력구간: band,
    회사: row.company,
    공고명: row.title,
    직무분류: category,
    주요업무: responsibility,
    요구역량: requirements,
    우대사항: '',
    추천포트폴리오: portfolioFor(category),
    지원우선도: analysis.manualRequired ? '확인필요' : edge || /BM|서비스/.test(category) ? '하' : '중',
    공고URL: `${DETAIL_URL}${row.id}`,
    비고: analysis.manualRequired ? '자격요건 수동 확인 후 수동입력경력 기입 필요' : '게임잡 상세 본문 기준 수집',
    표시경력: row.listedExperience,
    본문요구경력: analysis.bodyExperience,
    수동입력경력: analysis.manualRequired ? '확인 전' : '',
    경력판정근거: analysis.evidence
  };
}

async function main() {
  const result = await collect();
  const topRoles = Object.entries(result.roles).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const payload = {
    secret: SECRET,
    replaceCollectedRowsForDate: replaceRows,
    weeklySummary: {
      기준일: BASE_DATE,
      '신입/경력무관': result.bands['신입/경력무관'],
      '1~3년차': result.bands['1~3년차'],
      '3~5년차': result.bands['3~5년차'],
      총공고수: result.jobs.length,
      대표키워드: topRoles.map(([key, value]) => `${key} ${value}건`).join(', '),
      이번주전략: `경력무관 상세 본문 판정 반영. 수동 확인 필요 공고 ${result.manualRequired}건은 경력 확인 후 지원 우선순위 확정.`,
      아카이브메모: '자동화 아카이브는 백업으로만 유지'
    },
    jobs: result.jobs,
    excluded: result.excluded
  };

  if (dryRun) {
    console.log(JSON.stringify({
      rawListings: result.listings,
      jobs: result.jobs.length,
      excluded: result.excluded.length,
      bands: result.bands,
      roles: result.roles,
      manualRequired: result.manualRequired
    }));
    return;
  }
  if (!SECRET) throw new Error('CAREER_HUB_WEBHOOK_SECRET is required when writing results.');

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!body.ok) throw new Error(`Sheet write failed: ${body.error || 'unknown error'}`);
  console.log(JSON.stringify({
    rawListings: result.listings,
    jobs: result.jobs.length,
    excluded: result.excluded.length,
    bands: result.bands,
    roles: result.roles,
    manualRequired: result.manualRequired,
    writeResult: {
      weekly: body.weekly,
      jobs: body.jobs,
      excluded: body.excluded
    }
  }));
}

await main();
