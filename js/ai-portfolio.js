const gallery = document.querySelector('.artwork-grid');
const filters = document.querySelector('.archive-filters');
const count = document.querySelector('.archive-count');
const search = document.querySelector('#work-search');
const empty = document.querySelector('#work-empty');
let currentTag = '';
const works = Array.from(gallery.querySelectorAll('.artwork-card'), card => ({
  card,
  tags: Array.from(card.querySelectorAll('.card-tags span'), tag => tag.textContent.trim())
}));
const tags = ['', ...new Set(works.flatMap(work => work.tags))];

function filterWorks(tag) {
  currentTag = tag;
  const query = search ? search.value.trim().toLocaleLowerCase('ko') : '';
  let visible = 0;
  works.forEach(work => {
    work.card.hidden = (tag !== '' && !work.tags.includes(tag)) || (query !== '' && !work.card.textContent.toLocaleLowerCase('ko').includes(query));
    if (!work.card.hidden) visible += 1;
  });
  filters.querySelectorAll('button').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.tag === tag));
  });
  count.textContent = `${tag || '전체'} · ${visible}개 작품`;
  if (empty) empty.hidden = visible !== 0;
}

if (search) search.addEventListener('input', () => filterWorks(currentTag));

tags.forEach(tag => {
  const button = document.createElement('button');
  const total = works.filter(work => tag === '' || work.tags.includes(tag)).length;
  button.type = 'button';
  button.dataset.tag = tag;
  button.textContent = `${tag || '전체'} ${total}`;
  button.addEventListener('click', () => filterWorks(tag));
  filters.append(button);
});
filterWorks('');
filters.hidden = false;
