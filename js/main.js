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
  origin1: {
    title: '출발점 1',
    body: '결과물 자체보다 어떤 판단 기준으로 만들었는지가 협업 품질을 좌우한다는 점을 정리한 카드입니다. 사용자 경험의 흐름 단위로 문제를 바라보게 된 계기를 담고 있습니다.'
  },
  origin2: {
    title: '출발점 2',
    body: '같은 화면이라도 설명 순서와 조건 정의에 따라 구현과 QA의 난도가 달라진다는 경험을 바탕으로, 다시 같은 문제가 발생하지 않도록 문서 기준을 정리하는 방식을 설명합니다.'
  },
  approach1: {
    title: '막히는 지점을 먼저 본다',
    body: '사용자가 멈추는 순간과 팀이 해석을 나누는 순간을 먼저 찾고, 그 지점부터 우선순위를 정해 해결하는 방식입니다.'
  },
  approach2: {
    title: '기준은 문서로 남긴다',
    body: '구두 합의로 끝내지 않고 조건, 예외, 완료 기준을 문장과 표로 남겨 다음 작업에서도 같은 기준이 유지되도록 정리합니다.'
  },
  approach3: {
    title: '전달 후에도 확인한다',
    body: '전달 완료를 끝으로 보지 않고, 문서를 받은 사람이 동일하게 이해했는지 확인한 뒤 필요한 수정 사항을 짧은 주기로 반영합니다.'
  },
  approach4: {
    title: '필요한 순간에 묻는다',
    body: '늦은 질문보다 빠른 질문이 비용을 줄인다는 기준으로, 결정 전 확인 루프를 운영하는 방식을 담은 카드입니다.'
  },
  alignment1: {
    title: '경험 우선 합의',
    body: '요구사항을 사용자 행동 흐름으로 재정렬해 기능 우선이 아니라 경험 우선으로 합의하는 기준을 보여줍니다.'
  },
  alignment2: {
    title: '문서 배치 기준',
    body: '목적, 조건, 예외, 검수 포인트를 한 화면에서 읽히도록 배치해 문서만으로도 구현 판단이 가능하도록 만드는 구조입니다.'
  },
  alignment3: {
    title: '용어와 단계 통일',
    body: '디자인, 개발, QA가 같은 용어와 단계 이름을 보도록 정렬해 탐색 비용과 해석 차이를 줄이는 방식입니다.'
  },
  alignment4: {
    title: '최종 점검 루프',
    body: '최종 전달 직전에 문서만 보고 구현 가능한지 한 번 더 확인하는 점검 루프를 추가해 누락 가능성을 낮춥니다.'
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
const sliderButtons = document.querySelectorAll('.slider-nav');
const sliderTracks = document.querySelectorAll('[data-slider-dots]');
const railGuideToggle = document.getElementById('railGuideToggle');
const railGuidePanel = document.getElementById('railGuidePanel');

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

  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal(button.dataset.modal);
    }
  });
});

function centerCardInSlider(slider, direction) {
  const cards = Array.from(slider.children);
  if (!cards.length) return;

  const currentIndex = Number.parseInt(slider.dataset.activeIndex ?? `${getCenteredCardIndex(slider)}`, 10);
  const nextIndex = (currentIndex + direction + cards.length) % cards.length;
  slider.dataset.activeIndex = `${nextIndex}`;
  slider.dataset.wrapCheck = 'pending';
  scrollCardToCenter(slider, cards[nextIndex]);
}

function getCenteredCardIndex(slider) {
  const cards = Array.from(slider.children);
  const sliderCenter = slider.scrollLeft + (slider.clientWidth / 2);
  let currentIndex = 0;
  let minDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
    const distance = Math.abs(cardCenter - sliderCenter);

    if (distance < minDistance) {
      minDistance = distance;
      currentIndex = index;
    }
  });

  return currentIndex;
}

function scrollCardToCenter(slider, card) {
  const targetLeft = card.offsetLeft - ((slider.clientWidth - card.offsetWidth) / 2);

  slider.scrollTo({
    left: Math.max(0, targetLeft),
    behavior: 'smooth'
  });
}

function updateSliderDots(dotsContainer, activeIndex) {
  if (!dotsContainer) return;

  Array.from(dotsContainer.children).forEach((dot, index) => {
    dot.classList.toggle('is-active', index === activeIndex);
    dot.setAttribute('aria-pressed', index === activeIndex ? 'true' : 'false');
  });
}

sliderTracks.forEach((slider) => {
  const dotsContainer = document.getElementById(slider.dataset.sliderDots);
  if (!dotsContainer) return;

  const cards = Array.from(slider.children);
  let scrollTimer = null;

  cards.forEach((card, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'scene-dot';
    dot.setAttribute('aria-label', `${index + 1}번 카드 보기`);

    dot.addEventListener('click', () => {
      slider.dataset.activeIndex = `${index}`;
      scrollCardToCenter(slider, card);
      updateSliderDots(dotsContainer, index);
    });

    dotsContainer.appendChild(dot);
  });

  const initialIndex = getCenteredCardIndex(slider);
  slider.dataset.activeIndex = `${initialIndex}`;
  updateSliderDots(dotsContainer, initialIndex);

  slider.addEventListener('scroll', () => {
    if (scrollTimer) {
      window.clearTimeout(scrollTimer);
    }

    scrollTimer = window.setTimeout(() => {
      const activeIndex = getCenteredCardIndex(slider);
      slider.dataset.activeIndex = `${activeIndex}`;
      slider.dataset.wrapCheck = 'idle';
      updateSliderDots(dotsContainer, activeIndex);
    }, 140);
  });
});

sliderButtons.forEach((button) => {
  const slider = document.getElementById(button.dataset.sliderTarget);
  if (!slider) return;

  button.addEventListener('click', () => {
    const direction = button.classList.contains('slider-nav-next') ? 1 : -1;
    centerCardInSlider(slider, direction);
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

if (railGuideToggle && railGuidePanel) {
  railGuideToggle.addEventListener('click', () => {
    const isOpen = railGuideToggle.getAttribute('aria-expanded') === 'true';
    railGuideToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    railGuidePanel.hidden = isOpen;
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});
