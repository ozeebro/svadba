'use strict';

// Reveal each time independently, rather than revealing the whole program at once.
if ('IntersectionObserver' in window) {
  const sections = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        sections.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('section').forEach(section => sections.observe(section));
  const times = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('event-revealed');
        times.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5, rootMargin: '0px 0px -7% 0px' });
  document.querySelectorAll('.table-event').forEach(event => times.observe(event));
} else {
  document.querySelectorAll('section').forEach(section => section.classList.add('visible'));
  document.querySelectorAll('.table-event').forEach(event => event.classList.add('event-revealed'));
}

const hoverAvailable = window.matchMedia('(hover: hover) and (pointer: fine)');
const venueTriggers = [...document.querySelectorAll('.event-trigger')];
const venueCards = [...document.querySelectorAll('.venue-card')];
let activeVenue = null;
let activeTrigger = null;
let venueCloseTimer;
let restoringVenueFocus = false;

function closeVenue(returnFocus = false) {
  clearTimeout(venueCloseTimer);
  venueCards.forEach(card => {
    card.classList.remove('is-open');
    card.setAttribute('aria-hidden', 'true');
    card.inert = true;
  });
  venueTriggers.forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
  activeVenue = null;
  if (returnFocus && activeTrigger) {
    restoringVenueFocus = true;
    activeTrigger.focus({ preventScroll: true });
    restoringVenueFocus = false;
  }
}

function openVenue(trigger) {
  clearTimeout(venueCloseTimer);
  const kind = trigger.dataset.venue;
  if (activeVenue !== kind) {
    closeVenue();
    const card = document.getElementById(`venue-${kind}`);
    card.inert = false;
    card.setAttribute('aria-hidden', 'false');
    card.classList.add('is-open');
    activeVenue = kind;
  }
  activeTrigger = trigger;
  venueTriggers.forEach(item => item.setAttribute('aria-expanded', String(item === trigger)));
}

venueTriggers.forEach(trigger => {
  trigger.addEventListener('pointerenter', () => {
    if (hoverAvailable.matches) openVenue(trigger);
  });
  trigger.addEventListener('pointerleave', () => {
    if (hoverAvailable.matches) venueCloseTimer = setTimeout(() => closeVenue(), 450);
  });
  trigger.addEventListener('focus', () => {
    if (!restoringVenueFocus && trigger.matches(':focus-visible')) openVenue(trigger);
  });
  trigger.addEventListener('click', () => {
    // Desktop hover already opens the card; a click keeps it open.
    if (!hoverAvailable.matches && activeVenue === trigger.dataset.venue && activeTrigger === trigger) {
      closeVenue();
    } else openVenue(trigger);
  });
});
venueCards.forEach(card => {
  card.addEventListener('pointerenter', () => clearTimeout(venueCloseTimer));
  card.addEventListener('pointerleave', () => {
    if (hoverAvailable.matches) venueCloseTimer = setTimeout(() => closeVenue(), 450);
  });
  card.querySelector('.venue-close').addEventListener('click', () => closeVenue(true));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && activeVenue) closeVenue(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.venue-card, .event-trigger')) closeVenue();
});
document.getElementById('schedule').addEventListener('focusout', event => {
  if (!event.currentTarget.contains(event.relatedTarget)) closeVenue();
});
if ('IntersectionObserver' in window) {
  const venueVisibility = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) closeVenue();
  });
  venueVisibility.observe(document.getElementById('schedule'));
}

// Generated high-resolution contact sheets: top row women, bottom row men.
const looks = {
  red: { title: 'Красный — с итальянским темпераментом', women: [[0, 'Красная шёлковая блуза и шоколадные брюки'], [1, 'Асимметричный красный топ и брюки айвори']], men: [[0, 'Красная льняная рубашка и коричневые брюки'], [1, 'Красное поло и чёрные брюки']] },
  lemon: { title: 'Лимонный — немного солнечной Италии', women: [[0, 'Лимонный шёлковый топ и светлые брюки'], [1, 'Лимонная блуза и чёрные брюки']], men: [[0, 'Лимонная рубашка и шоколадные брюки'], [1, 'Чёрная рубашка, бежевые брюки и жёлтый платок']] },
  white: { title: 'Белый — в сочетании с яркими акцентами', women: [[0, 'Топ айвори, жёлтая брошь и шоколадные брюки'], [1, 'Белая рубашка и лимонные брюки']], men: [[0, 'Белая рубашка и красный джемпер'], [1, 'Рубашка айвори и красный шёлковый платок']] },
  beige: { title: 'Бежевый — тёплый и естественный', women: [[0, 'Бежевый жилет, красный платок и шоколадные брюки'], [1, 'Бежевая блуза, светлая юбка и бордовая сумка']], men: [[0, 'Бежевый костюм и чёрная рубашка'], [1, 'Бежевое поло и шоколадные брюки']] },
  brown: { title: 'Тёмно-коричневый — глубокий и благородный', women: [[0, 'Шоколадная блуза, светлые брюки и лимонная сумка'], [1, 'Шоколадные брюки и красная блуза']], men: [[0, 'Шоколадная рубашка и светлые брюки'], [1, 'Коричневое поло и бежевые брюки']] },
  black: { title: 'Чёрный — обязательно с цветным акцентом', women: [[0, 'Чёрная шёлковая блуза и красные брюки'], [1, 'Чёрные брюки и красный атласный топ']], men: [[0, 'Чёрная рубашка, бежевые брюки и красный платок'], [1, 'Чёрный образ и красные акценты']] }
};
const lookPanel = document.getElementById('look-panel');
let selectedColor = null;

function outfitCard(gender, [index, caption], color) {
  const figure = document.createElement('figure');
  figure.className = 'outfit';
  const photo = document.createElement('div');
  photo.className = 'outfit-photo';
  photo.style.setProperty('--photo-x', index);
  photo.style.setProperty('--photo-y', gender === 'women' ? 0 : 1);
  const image = document.createElement('img');
  image.src = `assets/look-${color}.png`;
  // A quadrant of the original generated sheet is displayed without upscaling a thumbnail.
  image.alt = caption;
  image.width = 1024;
  image.height = 1536;
  image.decoding = 'async';
  photo.append(image);
  const text = document.createElement('figcaption');
  text.textContent = caption;
  figure.append(photo, text);
  return figure;
}

function selectColor(color) {
  if (selectedColor === color) return;
  selectedColor = color;
  const selection = looks[color];
  document.querySelectorAll('.color-button').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.color === color));
  });
  document.getElementById('look-panel-title').textContent = selection.title;
  ['women', 'men'].forEach(gender => {
    document.getElementById(`${gender}-looks`).replaceChildren(...selection[gender].map(look => outfitCard(gender, look, color)));
  });
  lookPanel.hidden = false;
  lookPanel.classList.remove('panel-enter');
  void lookPanel.offsetWidth;
  lookPanel.classList.add('panel-enter');
  document.getElementById('palette-status').textContent = `${selection.title}. Показаны два женских и два мужских образа.`;
}

document.querySelectorAll('.color-button').forEach(button => {
  button.addEventListener('click', () => selectColor(button.dataset.color));
  button.addEventListener('focus', () => selectColor(button.dataset.color));
  button.addEventListener('pointerenter', () => {
    if (hoverAvailable.matches) selectColor(button.dataset.color);
  });
});

const glasses = document.querySelector('.glasses-button');
function clink() {
  if (glasses.classList.contains('clinking')) return;
  glasses.classList.add('clinking');
}
glasses.addEventListener('pointerenter', () => {
  if (hoverAvailable.matches) clink();
});
glasses.addEventListener('click', clink);
glasses.addEventListener('animationend', event => {
  if (event.animationName === 'clink-left') glasses.classList.remove('clinking');
});

// No storage or requests: the current stage is the invitation interface only.
const form = document.getElementById('guest-form');
const members = document.getElementById('family-members');
const feedback = document.getElementById('feedback');
let memberSequence = 0;

function renumberMembers() {
  [...members.children].forEach((member, index) => {
    member.querySelector('.member-title').textContent = index === 0 ? 'Caro ospite' : 'La famiglia';
    const remove = member.querySelector('.remove-member');
    remove.hidden = members.children.length === 1;
    remove.setAttribute('aria-label', `Удалить гостя ${index + 1}`);
  });
}

function addMember(focus = true) {
  const id = ++memberSequence;
  const template = document.createElement('template');
  template.innerHTML = document.getElementById('member-template').innerHTML.replaceAll('__ID__', id);
  const member = template.content.firstElementChild;
  const menu = member.querySelector('.member-menu');
  const guestName = member.querySelector('input[type=text]');
  guestName.addEventListener('input', () => {
    guestName.setCustomValidity(guestName.value.trim() ? '' : 'Пожалуйста, укажите имя и фамилию.');
  });
  member.querySelectorAll('select').forEach(select => { select.required = true; });
  member.querySelectorAll('input[type=radio]').forEach(radio => {
    radio.addEventListener('change', () => {
      const attending = member.querySelector('input[type=radio]:checked')?.value === 'yes';
      menu.hidden = !attending;
      menu.disabled = !attending;
      member.querySelector('.decline-note').hidden = attending;
    });
  });
  member.querySelector('.remove-member').addEventListener('click', () => {
    const adjacent = member.previousElementSibling || member.nextElementSibling;
    member.remove();
    feedback.replaceChildren();
    renumberMembers();
    adjacent?.querySelector('input[type=text]').focus({ preventScroll: true });
  });
  members.append(member);
  feedback.replaceChildren();
  renumberMembers();
  if (focus) member.querySelector('input[type=text]').focus();
}

document.getElementById('add-member').addEventListener('click', () => addMember());
form.addEventListener('input', () => feedback.replaceChildren());
form.addEventListener('change', () => feedback.replaceChildren());
form.addEventListener('submit', event => {
  event.preventDefault();
  const heading = document.createElement('h3');
  heading.textContent = 'Проверьте ваши ответы';
  feedback.replaceChildren(heading);
  [...members.children].forEach(member => {
    const summary = document.createElement('div');
    summary.className = 'answer-summary';
    const name = document.createElement('strong');
    name.textContent = member.querySelector('input[type=text]').value.trim();
    const attending = member.querySelector('input[type=radio]:checked').value === 'yes';
    const attendance = document.createElement('p');
    attendance.textContent = attending ? 'Будет с нами ♡' : 'Не сможет присутствовать';
    summary.append(name, attendance);
    if (attending) {
      member.querySelectorAll('select').forEach(select => {
        const line = document.createElement('p');
        const label = select.labels[0].textContent.replace(/\?$/, '');
        line.textContent = `${label}: ${select.value}`;
        summary.append(line);
      });
    }
    feedback.append(summary);
  });
  const note = document.createElement('p');
  note.textContent = 'Ответы пока не отправлены. Отправка организаторам появится в следующей версии.';
  feedback.append(note);
  feedback.focus({ preventScroll: true });
  feedback.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
});
addMember(false);
