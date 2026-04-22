const modalData = {
  scene1: {
    title: '튜토리얼 이탈 구간 재정리',
    body: '초기 5분 구간에서 과도하게 집중된 설명을 행동 기반 단계로 분리해, 플레이어가 직접 조작 후 규칙을 이해하도록 순서를 재설계한 사례입니다. 문서에는 화면 단위가 아닌 사용자 행동 단위로 조건을 정리했습니다.'
  },
  scene2: {
    title: '강화 규칙 예외 처리 통합',
    body: '여러 문서에 흩어져 있던 강화 실패, 보정 수치, 자원 환급 조건을 한 시트로 통합해 QA 점검 순서를 단순화한 장면입니다. 팀 내 질문량과 재확인 비용이 줄어드는 것을 목표로 했습니다.'
  },
  scene3: {
    title: '보스 패턴 전달 구조 재배치',
    body: '위험 신호의 타이밍이 늦어 대응 실패가 반복되던 구간에서, 시각/사운드/이펙트 신호를 행동 단계와 맞춰 재배치한 흐름입니다. 난이도 조정 이전에 전달 구조를 정리한 접근을 보여줍니다.'
  },
  tool1: {
    title: 'ChatGPT 활용 기준',
    body: '최종 답안을 대신 작성하는 용도가 아니라, 질문 구조를 빠르게 정제하고 누락 조건을 찾는 보조 도구로 사용합니다. 산출물 반영 전에는 반드시 팀 기준 문장으로 재작성합니다.'
  },
  tool2: {
    title: 'Ludo 활용 기준',
    body: '레퍼런스 탐색 시 장르/목표/문제 상황을 먼저 정의한 뒤 사례를 비교합니다. 기능 목록 수집보다, 왜 해당 설계가 작동했는지 판단 근거를 가져오는 데 집중합니다.'
  },
  tool3: {
    title: 'Suno 활용 기준',
    body: '초기 분위기 검토 단계에서 감정 톤을 빠르게 공유하기 위한 보조 수단으로 사용합니다. 핵심 기획 판단은 플레이 경험과 시스템 규칙 검토를 우선합니다.'
  },
  tool4: {
    title: 'Notion 활용 기준',
    body: '회의 결론, 버전 기록, 보류 이슈를 분리해 팀이 같은 상태를 보게 만드는 용도로 사용합니다. 문서 제목 체계와 태그 기준을 고정해 추적 가능성을 유지합니다.'
  },
  tool5: {
    title: 'Figma 활용 기준',
    body: '화면 디자인보다 흐름 검토 단계에서 상태 전이와 예외 분기를 먼저 시각화합니다. 구현 협업 전 문서와 도식의 불일치 여부를 확인하는 체크포인트로 활용합니다.'
  }
};

const backdrop = document.getElementById('modalBackdrop');
const modalBody = document.getElementById('modalBody');
const closeButton = document.getElementById('modalClose');
const modal = backdrop ? backdrop.querySelector('.modal') : null;
const triggers = document.querySelectorAll('.open-modal');

let lastScrollY = 0;

function openModal(key) {
  const data = modalData[key];
  if (!data || !backdrop || !modalBody) return;

  modalBody.textContent = `${data.title} — ${data.body}`;
  lastScrollY = window.scrollY;

  backdrop.hidden = false;
  document.body.classList.add('modal-open');
}

function closeModal() {
  if (!backdrop || backdrop.hidden) return;
  backdrop.hidden = true;
  document.body.classList.remove('modal-open');
  window.scrollTo({ top: lastScrollY, behavior: 'auto' });
}

triggers.forEach((button) => {
  button.addEventListener('click', () => {
    openModal(button.dataset.modal);
  });
});

if (closeButton) {
  const handleCloseButton = (event) => {
    event.preventDefault();
    closeModal();
  };

  closeButton.addEventListener('click', handleCloseButton);
  closeButton.addEventListener('touchend', handleCloseButton, { passive: false });
}

function handleBackdropClose(event) {
  if (event.target === backdrop) {
    closeModal();
  }
}

if (backdrop) {
  backdrop.addEventListener('click', handleBackdropClose);
  backdrop.addEventListener('touchend', handleBackdropClose, { passive: true });
}

if (modal) {
  modal.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  modal.addEventListener('touchend', (event) => {
    event.stopPropagation();
  }, { passive: true });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});
