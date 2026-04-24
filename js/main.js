const modalData = {
  scene1: {
    title: '튜토리얼 이탈 구간 재정리',
    body: '초기 학습 구간에서 설명량이 많아지던 부분을 다시 쪼개, 플레이어가 규칙을 행동으로 익히게 만든 사례입니다. 문서는 화면 단위가 아니라 흐름 단위로 다시 정리했습니다.'
  },
  scene2: {
    title: '강화 규칙 예외 처리 통합',
    body: '여러 문서에 흩어진 강화 예외 조건을 한 구조로 묶어 QA 누락을 줄인 사례입니다. 예외를 부록이 아니라 핵심 설계 항목으로 다뤄야 한다는 기준을 보여줍니다.'
  },
  scene3: {
    title: '보스 패턴 전달 구조 재배치',
    body: '위험 신호와 대응 정보를 같은 흐름 안에서 읽히도록 재배치해, 난이도보다 전달 구조를 먼저 조정한 장면입니다.'
  },
  approach1: {
    title: '막히는 지점을 먼저 본다',
    body: '플레이어가 멈추는 순간과 팀이 다르게 해석하는 순간을 먼저 찾고, 그 지점을 우선순위로 올려 해결하는 방식입니다.'
  },
  approach2: {
    title: '기준은 문서로 남긴다',
    body: '구두 합의로 끝내지 않고 조건, 예외, 완료 기준을 문장과 표로 남겨 다음 작업에서도 같은 기준으로 읽히게 만듭니다.'
  },
  approach3: {
    title: '전달 후에도 확인한다',
    body: '문서를 전달한 뒤에도 해석이 같은지 확인하고, 필요한 수정은 짧은 루프로 빠르게 반영합니다.'
  },
  approach4: {
    title: '필요한 순간에 묻는다',
    body: '늦은 질문보다 빠른 질문이 비용을 줄인다고 보고, 결정 전 확인 루프를 운영하는 방식입니다.'
  },
  alignment1: {
    title: '요구 재정렬',
    body: '요구사항을 기능 목록이 아니라 사용자 행동 흐름으로 다시 묶어, 경험 우선의 합의점으로 바꾸는 단계입니다.'
  },
  alignment2: {
    title: '문서화',
    body: '목적, 조건, 예외, 검수 포인트가 한 화면 안에서 읽히도록 배치해 문서만으로도 구현 기준이 보이게 만듭니다.'
  },
  alignment3: {
    title: '용어 통일',
    body: '디자인, 개발, QA가 같은 단계 이름과 상태값으로 대화하게 맞춰 해석 차이를 줄이는 단계입니다.'
  },
  alignment4: {
    title: '점검 루프',
    body: '최종 전달 직전에 문서만 보고 구현 가능한지 다시 확인하는 마지막 검토 루프를 추가합니다.'
  },
  tool1: {
    title: 'ChatGPT 사용 기준',
    body: '완성 문장을 대신 쓰는 용도보다, 초기 가설을 압축하고 질문 구조를 정리하는 보조 도구로 사용합니다.'
  },
  tool2: {
    title: 'Ludo 사용 기준',
    body: '시스템 레퍼런스를 비교하면서 규칙 사례와 전달 구조의 차이를 확인하는 데 사용합니다.'
  },
  tool3: {
    title: 'Suno 사용 기준',
    body: '초기 분위기 실험 단계에서 감정 톤과 리듬을 빠르게 맞춰 보는 참고 도구로 활용합니다.'
  },
  tool4: {
    title: 'Notion 사용 기준',
    body: '버전 기록과 회의 결론을 한곳에 모아, 팀이 같은 기준과 상태를 보게 만드는 문서 허브로 사용합니다.'
  },
  tool5: {
    title: 'Figma 사용 기준',
    body: '화면 흐름과 상태 전이를 시각화해, 구현 전에 생길 해석 차이를 줄이는 확인 지점으로 사용합니다.'
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

function updateSliderClasses(slider, activeIndex) {
  const cards = Array.from(slider.children);

  cards.forEach((card, index) => {
    card.classList.remove('is-active', 'is-prev', 'is-next');

    if (index === activeIndex) {
      card.classList.add('is-active');
      return;
    }

    if (index === (activeIndex - 1 + cards.length) % cards.length) {
      card.classList.add('is-prev');
      return;
    }

    if (index === (activeIndex + 1) % cards.length) {
      card.classList.add('is-next');
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
