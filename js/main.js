const modalData = {
  scene1: {
    title: '림버스 튜토리얼 학습 공백 분석',
    body: '문제: 림버스 컴퍼니는 초반 튜토리얼 이후 중간층 유저가 세부 전투 규칙을 다시 학습하기 어렵다고 보았습니다. 행동: 전투 용어와 학습 공백을 정리하고, 선택형 튜토리얼과 매뉴얼 보상을 제안했습니다. 배운 점: 튜토리얼은 첫 진입 장치만이 아니라 유저가 필요할 때 다시 확인할 수 있는 구조여야 합니다.'
  },
  scene2: {
    title: '비주얼노벨 데이터 구조 분리',
    body: '문제: 문장과 연출 중심으로만 기획하면 선택지, 호감도, 저장 흐름을 구현 단위로 전달하기 어렵다고 보았습니다. 행동: Script, Text, Character, Art, Sound, Choice 데이터를 분리하고 RUID 연결과 선택지 흐름을 검토했습니다. 배운 점: 기능을 붙이려면 문장 기획을 데이터 구조와 상태 기준으로 바꿔야 합니다.'
  },
  scene3: {
    title: 'Project_BB 시스템 기준 문서화',
    body: '문제: 방 진행, 미니맵, 조작/피격, 상점, 장비 강화처럼 조건이 갈리는 시스템은 용어와 상태 기준이 흔들리면 구현과 QA가 함께 흔들립니다. 행동: 미입장, 진행중, 클리어 같은 상태와 판정 조건, 강화 실패 예외를 문서화했습니다. 배운 점: 좋은 기획서는 아이디어보다 조건, 예외, 판정 기준이 명확해야 합니다.'
  },
  approach1: {
    title: '막히는 지점을 먼저 본다',
    body: '문제: 설명을 많이 넣어도 플레이어가 실제로 멈추는 지점은 따로 생길 수 있습니다. 행동: 교육 경험과 튜토리얼 분석을 바탕으로 이해가 끊기는 순간을 먼저 찾습니다. 배운 점: 기능을 늘리기 전에 어떤 흐름이 막히는지 확인해야 수정 우선순위가 선명해집니다.'
  },
  approach2: {
    title: '기준은 문서로 남긴다',
    body: '문제: 구두 합의만으로는 조건, 예외, 완료 기준이 사람마다 다르게 남습니다. 행동: Project_BB 시스템 기획서와 나린가락 통합 기획서처럼 기준을 문장, 표, 상태값으로 남겼습니다. 배운 점: 문서는 기록이 아니라 팀이 같은 판단을 반복하기 위한 기준입니다.'
  },
  approach3: {
    title: '전달 후에도 확인한다',
    body: '문제: 문서를 전달했다고 해서 구현자와 QA가 같은 기준으로 이해했다고 단정할 수 없습니다. 행동: 회고록과 검수내역을 통해 전달 후 확인 루프를 남기고 수정 사항을 반영했습니다. 배운 점: 기획 문서는 전달 후의 해석 차이를 확인할 때 완성도에 가까워집니다.'
  },
  approach4: {
    title: '질문으로 비용을 줄인다',
    body: '문제: 구현 가능성을 늦게 확인하면 이미 쌓인 문서와 작업물을 다시 고쳐야 합니다. 행동: Project_BB 회고에서처럼 결정 전 필요한 질문을 먼저 던지고, AI와 툴 결과도 구조를 따라가며 검토했습니다. 배운 점: 빠른 질문은 작업을 멈추게 하는 것이 아니라 불필요한 되돌림을 줄입니다.'
  },
  alignment1: {
    title: '관찰',
    body: '문제: 요구사항을 기능 목록으로만 보면 플레이어와 팀원이 어디에서 멈추는지 놓치기 쉽습니다. 행동: 플레이어의 학습 공백과 팀 문서 해석 차이를 먼저 관찰합니다. 배운 점: 관찰이 있어야 어떤 흐름을 먼저 정리해야 하는지 결정할 수 있습니다.'
  },
  alignment2: {
    title: '기준화',
    body: '문제: 조건과 예외가 말로만 남으면 작업자가 다른 기준으로 판단할 수 있습니다. 행동: 완료 기준, 실패 조건, 예외 처리, 검수 포인트를 문장으로 고정합니다. 배운 점: 기준화는 아이디어를 팀이 공유 가능한 규칙으로 바꾸는 단계입니다.'
  },
  alignment3: {
    title: '구조화',
    body: '문제: 좋은 설명도 테이블, 플로우차트, 화면 흐름으로 옮기지 않으면 구현 단위가 보이지 않을 수 있습니다. 행동: 데이터 테이블, 상태 정의, 와이어프레임으로 조건을 옮깁니다. 배운 점: 구조화는 기획 의도를 구현 가능한 단위로 번역하는 과정입니다.'
  },
  alignment4: {
    title: '검수',
    body: '문제: 문서가 완성돼 보여도 실제 구현과 QA 기준이 빠져 있을 수 있습니다. 행동: 문서만 보고 구현 가능한지, QA가 확인할 기준이 있는지 마지막으로 점검합니다. 배운 점: 검수 루프는 문서의 보기 좋은 정도가 아니라 사용 가능한 정도를 확인합니다.'
  },
  tool1: {
    title: '데이터 테이블 설계',
    body: '문제: 시나리오와 리소스가 한 덩어리로 남으면 선택지, 보상, 저장 흐름을 구현하기 어렵습니다. 행동: Exit Value와 나린가락 자료에서 Script, Text, Character, Art, Sound, Choice, 아이템, 상점, 보상 테이블을 분리해 보았습니다. 배운 점: 데이터 테이블은 문장을 줄이는 작업이 아니라 시스템이 읽을 수 있는 관계를 만드는 작업입니다.'
  },
  tool2: {
    title: '플로우차트와 상태 정의',
    body: '문제: 방 진행, 피격, 강화, 상점처럼 조건이 갈리는 기능은 말로 설명하면 예외가 쉽게 빠집니다. 행동: Project_BB 방 진행/미니맵, 플레이어 조작/판정, 장비 강화 문서에서 상태와 조건을 흐름으로 정리했습니다. 배운 점: 플로우차트는 보기 좋은 그림이 아니라 누락된 조건을 찾기 위한 검토 도구입니다.'
  },
  tool3: {
    title: '협업 문서화',
    body: '문제: 팀 프로젝트에서는 좋은 아이디어보다 같은 기준으로 움직이는 구조가 먼저 필요합니다. 행동: 나린가락 통합 기획서, 3차 프로젝트 회고록, 검수내역을 통해 역할, 일정, 전달 기준을 남겼습니다. 배운 점: 협업 문서는 결과물을 설명하는 문서가 아니라 다음 사람이 이어서 판단할 수 있게 만드는 기준입니다.'
  },
  tool4: {
    title: '구조 검증용 프로토타입',
    body: '문제: 제안이 말로만 남으면 실제로 작동하는 흐름인지 확인하기 어렵습니다. 행동: 림버스 7슬롯 로그라이크 흐름과 비주얼노벨 선택지/호감도/저장 흐름을 작은 프로토타입 관점으로 검토했습니다. 배운 점: 프로토타입은 완성물을 만들기 전 구조의 위험을 빨리 확인하게 해줍니다.'
  },
  tool5: {
    title: 'AI와 툴 검토 루프',
    body: '문제: AI와 툴 결과를 그대로 쓰면 오류의 원인과 수정 기준을 놓칠 수 있습니다. 행동: Exit Value와 메이플월드 구조 검토에서 값의 흐름, 호출 순서, 데이터 연결을 따라가며 결과를 확인했습니다. 배운 점: AI를 잘 쓰려면 결과보다 구조를 읽고 질문을 선명하게 만드는 능력이 필요합니다.'
  }
};

const backdrop = document.getElementById('modalBackdrop');
const modal = backdrop ? backdrop.querySelector('.modal') : null;
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeButton = document.getElementById('modalClose');

const modalTriggers = document.querySelectorAll('.open-modal');
const sliderButtons = document.querySelectorAll('.slider-nav');
const sliderTracks = Array.from(document.querySelectorAll('[data-slider-dots]'));

const navGuideToggle = document.getElementById('navGuideToggle');
const navGuidePanel = document.getElementById('navGuidePanel');
const navLinks = Array.from(document.querySelectorAll('.site-link'));
const navSections = navLinks
  .map((link) => document.getElementById(link.dataset.navTarget))
  .filter(Boolean);

function openModal(key) {
  const data = modalData[key];
  if (!data || !backdrop || !modalTitle || !modalBody) return;

  modalTitle.textContent = data.title;
  modalBody.textContent = data.body;
  backdrop.hidden = false;
  document.body.classList.add('modal-open');
}

function closeModal() {
  if (!backdrop || backdrop.hidden) return;
  backdrop.hidden = true;
  document.body.classList.remove('modal-open');
}

modalTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    openModal(trigger.dataset.modal);
  });

  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal(trigger.dataset.modal);
    }
  });
});

function getCenteredCardIndex(slider) {
  if (slider.id === 'howSlider') {
    return Number.parseInt(slider.dataset.activeIndex ?? '0', 10);
  }

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

function scrollCardToCenter(slider, card, behavior = 'smooth') {
  if (slider.id === 'howSlider') {
    return;
  }

  const targetLeft = card.offsetLeft - ((slider.clientWidth - card.offsetWidth) / 2);
  slider.scrollTo({
    left: Math.max(0, targetLeft),
    behavior
  });
}

function updateSliderDots(dotsContainer, activeIndex) {
  if (!dotsContainer) return;

  Array.from(dotsContainer.children).forEach((dot, index) => {
    dot.classList.toggle('is-active', index === activeIndex);
    dot.setAttribute('aria-pressed', index === activeIndex ? 'true' : 'false');
  });
}

function updateSliderClasses(slider, activeIndex) {
  const cards = Array.from(slider.children);
  const prevIndex = (activeIndex - 1 + cards.length) % cards.length;
  const nextIndex = (activeIndex + 1) % cards.length;

  cards.forEach((card, index) => {
    card.classList.remove('is-active', 'is-prev', 'is-next');
    card.style.order = '4';

    if (index === activeIndex) {
      card.classList.add('is-active');
      card.style.order = '2';
      return;
    }

    if (index === prevIndex) {
      card.classList.add('is-prev');
      card.style.order = '1';
      return;
    }

    if (index === nextIndex) {
      card.classList.add('is-next');
      card.style.order = '3';
    }
  });
}

function setActiveSliderCard(slider, activeIndex) {
  const dotsContainer = document.getElementById(slider.dataset.sliderDots);
  slider.dataset.activeIndex = `${activeIndex}`;
  updateSliderDots(dotsContainer, activeIndex);
  updateSliderClasses(slider, activeIndex);
}

function centerCardInSlider(slider, direction) {
  const cards = Array.from(slider.children);
  if (!cards.length) return;

  const currentIndex = Number.parseInt(slider.dataset.activeIndex ?? `${getCenteredCardIndex(slider)}`, 10);
  const nextIndex = (currentIndex + direction + cards.length) % cards.length;
  setActiveSliderCard(slider, nextIndex);
  scrollCardToCenter(slider, cards[nextIndex]);
}

function centerSliderCardById(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return false;

  const slider = sliderTracks.find((track) => track.contains(target));
  if (!slider) return false;

  const cards = Array.from(slider.children);
  const index = cards.indexOf(target);
  if (index < 0) return false;

  setActiveSliderCard(slider, index);
  requestAnimationFrame(() => {
    scrollCardToCenter(slider, target);
  });

  return true;
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
      setActiveSliderCard(slider, index);
      scrollCardToCenter(slider, card);
    });

    dotsContainer.appendChild(dot);
  });

  const initialIndex = getCenteredCardIndex(slider);
  setActiveSliderCard(slider, initialIndex);
  requestAnimationFrame(() => {
    scrollCardToCenter(slider, cards[initialIndex], 'auto');
  });

  slider.addEventListener('scroll', () => {
    if (scrollTimer) {
      window.clearTimeout(scrollTimer);
    }

    scrollTimer = window.setTimeout(() => {
      const activeIndex = getCenteredCardIndex(slider);
      setActiveSliderCard(slider, activeIndex);
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
  const handleClose = (event) => {
    event.preventDefault();
    closeModal();
  };

  closeButton.addEventListener('click', handleClose);
  closeButton.addEventListener('touchend', handleClose, { passive: false });
}

if (backdrop) {
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) {
      closeModal();
    }
  });

  backdrop.addEventListener('touchend', (event) => {
    if (event.target === backdrop) {
      closeModal();
    }
  }, { passive: true });
}

if (modal) {
  modal.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  modal.addEventListener('touchend', (event) => {
    event.stopPropagation();
  }, { passive: true });
}

if (navGuideToggle && navGuidePanel) {
  navGuideToggle.addEventListener('click', () => {
    const isOpen = navGuideToggle.getAttribute('aria-expanded') === 'true';
    navGuideToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    navGuidePanel.hidden = isOpen;
  });

  document.addEventListener('click', (event) => {
    if (!navGuidePanel.hidden && !navGuidePanel.contains(event.target) && !navGuideToggle.contains(event.target)) {
      navGuideToggle.setAttribute('aria-expanded', 'false');
      navGuidePanel.hidden = true;
    }
  });
}

if (navLinks.length && navSections.length) {
  const updateActiveNavLink = () => {
    const threshold = window.innerHeight * 0.3;
    let activeSectionId = navSections[0].id;

    navSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= threshold) {
        activeSectionId = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.navTarget === activeSectionId);
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navGuideToggle && navGuidePanel && !navGuidePanel.hidden) {
        navGuideToggle.setAttribute('aria-expanded', 'false');
        navGuidePanel.hidden = true;
      }
    });
  });

  updateActiveNavLink();
  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  window.addEventListener('hashchange', updateActiveNavLink);
}

function syncHashToSlider() {
  const targetId = window.location.hash.replace('#', '');
  if (!targetId) return;
  centerSliderCardById(targetId);
}

window.addEventListener('hashchange', syncHashToSlider);
window.addEventListener('load', syncHashToSlider);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navGuideToggle && navGuidePanel && !navGuidePanel.hidden) {
    navGuideToggle.setAttribute('aria-expanded', 'false');
    navGuidePanel.hidden = true;
  }

  if (event.key === 'Escape') {
    closeModal();
  }
});
