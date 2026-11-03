'use strict';

// Keep short Russian words with the word that follows, including dynamic captions.
function bindShortWords(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement?.closest('script,style,noscript,input,textarea')
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });
  const shortWord = /(^|[^а-яёa-z])((?:в|во|к|ко|с|со|о|об|обо|у|от|до|из|за|на|не|ни|но|по|под|при|над|без|для|про|через|между|перед|и|а)) +(?=\S)/gi;
  let node;
  while ((node = walker.nextNode())) {
    // Repeat for adjacent short words, such as «и с нами».
    node.textContent = node.textContent.replace(shortWord, '$1$2\u00a0').replace(shortWord, '$1$2\u00a0');
  }
}
bindShortWords(document.body);


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
  white: { title: 'Белый — в сочетании с яркими акцентами', women: [[0, 'Светлая юбка, красная блуза и лимонный платок', null, 'assets/outfit-white-skirt.jpg'], [1, 'Белая рубашка и лимонные брюки']], men: [[0, 'Белая рубашка и красный джемпер'], [1, 'Рубашка айвори и красный шёлковый платок']] },
  beige: { title: 'Бежевый — тёплый и естественный', women: [[0, 'Бежевый топ, чёрные шорты и красные аксессуары', null, 'assets/outfit-beige-shorts.jpg'], [1, 'Бежевый образ, красный пояс-цветок и плетёная сумка', null, 'assets/outfit-beige-dress.jpg']], men: [[0, 'Бежевый костюм и чёрная рубашка'], [1, 'Бежевое поло и шоколадные брюки']] },
  brown: { title: 'Тёмно-коричневый — универсальный и благородный', women: [[0, 'Топ айвори, жёлтая брошь и шоколадные брюки', 'white'], [1, 'Шоколадные брюки и красное поло', null, 'assets/outfit-brown-polo.jpg']], men: [[0, 'Шоколадная рубашка и светлые брюки'], [1, 'Коричневое поло и бежевые брюки']] },
  black: { title: 'Чёрный — обязательно с цветным акцентом (не монохром!)', women: [[0, 'Чёрная шёлковая блуза и красные брюки'], [1, 'Чёрные брюки и красный атласный топ']], men: [[0, 'Чёрная рубашка, бежевые брюки и красный платок'], [1, 'Чёрный образ и красные акценты']] }
};
const lookPanel = document.getElementById('look-panel');
let selectedColor = null;

function outfitCard(gender, [index, caption, sourceColor, sourceFile], color) {
  const figure = document.createElement('figure');
  figure.className = 'outfit';
  const photo = document.createElement('div');
  photo.className = 'outfit-photo';
  photo.style.setProperty('--photo-x', index);
  photo.style.setProperty('--photo-y', gender === 'women' ? 0 : 1);
  const image = document.createElement('img');
  image.src = sourceFile || `assets/look-${sourceColor || color}.png`;
  if (sourceFile) photo.classList.add('outfit-photo-single');
  // A quadrant of the original generated sheet is displayed without upscaling a thumbnail.
  image.alt = caption;
  image.width = 1024;
  image.height = 1536;
  image.decoding = 'async';
  photo.append(image);
  const text = document.createElement('figcaption');
  text.textContent = caption;
  figure.append(photo, text);
  bindShortWords(figure);
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
  bindShortWords(document.getElementById('look-panel-title'));
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

// The public endpoint contains no Telegram credentials; they stay in Worker secrets.
const RSVP_ENDPOINT = 'https://dolcevita-rsvp.ozeeimo.workers.dev/rsvp';
const MAX_FAMILY_MEMBERS = 8;
const form = document.getElementById('guest-form');
const members = document.getElementById('family-members');
const feedback = document.getElementById('feedback');
const submitAnswer = form.querySelector('.submit-answer');
const addMemberButton = document.getElementById('add-member');
let memberSequence = 0;
let sendingAnswer = false;
let answerSent = false;

function renumberMembers() {
  [...members.children].forEach((member, index) => {
    member.querySelector('.member-title').textContent = index === 0 ? 'Caro ospite' : 'La famiglia';
    const remove = member.querySelector('.remove-member');
    remove.hidden = members.children.length === 1;
    remove.setAttribute('aria-label', `Удалить гостя ${index + 1}`);
  });
  addMemberButton.disabled = members.children.length >= MAX_FAMILY_MEMBERS;
}

function addMember(focus = true) {
  if (sendingAnswer || members.children.length >= MAX_FAMILY_MEMBERS) return;
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
    clearAnswerStatus();
    renumberMembers();
    adjacent?.querySelector('input[type=text]').focus({ preventScroll: true });
  });
  bindShortWords(member);
  members.append(member);
  clearAnswerStatus();
  renumberMembers();
  if (focus) member.querySelector('input[type=text]').focus();
}

function clearAnswerStatus() {
  if (sendingAnswer) return;
  feedback.replaceChildren();
  if (answerSent) {
    answerSent = false;
    submitAnswer.disabled = false;
    submitAnswer.textContent = 'Отправить ♡';
  }
}

addMemberButton.addEventListener('click', () => addMember());
form.addEventListener('input', clearAnswerStatus);
form.addEventListener('change', clearAnswerStatus);
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sendingAnswer || answerSent || !form.reportValidity()) return;
  const family = [...members.children].map(member => {
    const attending = member.querySelector('input[type=radio]:checked').value === 'yes';
    const answer = { name: member.querySelector('input[type=text]').value.trim(), attending };
    if (attending) {
      answer.menu = {};
      member.querySelectorAll('select').forEach(select => {
        const key = select.name.split('-').at(-1);
        answer.menu[key] = select.value.replace(/\s+/gu, ' ').trim();
      });
    }
    return answer;
  });
  const payload = { members: family, website: form.elements.website.value };
  // Preserve existing disabled states, especially hidden menus of declined guests.
  const controls = [...form.querySelectorAll('input,select,button')].map(control => [control, control.disabled]);
  sendingAnswer = true;
  form.setAttribute('aria-busy', 'true');
  controls.forEach(([control]) => { control.disabled = true; });
  submitAnswer.textContent = 'Отправляем…';
  feedback.textContent = 'Отправляем ваш ответ ♡';
  let timeout;
  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(RSVP_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer'
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) {
      const messages = {
        not_configured: 'Отправка ещё настраивается. Пожалуйста, попробуйте немного позже.',
        invalid_request: 'Проверьте имена и выбор меню, затем повторите отправку.',
        too_large: 'Анкета получилась слишком большой. Пожалуйста, отправьте ответы двумя анкетами.',
        busy: 'Сейчас поступает много ответов. Пожалуйста, повторите отправку через минуту.'
      };
      const error = new Error('RSVP delivery failed');
      error.rsvpMessage = messages[result.code] || 'Не удалось подтвердить доставку ответа. Пожалуйста, повторите отправку чуть позже.';
      throw error;
    }
    answerSent = true;
    const heading = document.createElement('h3');
    heading.textContent = 'Спасибо за ваш ответ ♡';
    const confirmation = document.createElement('p');
    confirmation.textContent = 'Мы получили вашу анкету.';
    feedback.replaceChildren(heading, confirmation);
  } catch (error) {
    const note = document.createElement('p');
    note.textContent = error.rsvpMessage || 'Не удалось подтвердить доставку ответа. Проверьте соединение и попробуйте ещё раз. Заполненные данные остались в форме.';
    feedback.replaceChildren(note);
  } finally {
    clearTimeout(timeout);
    sendingAnswer = false;
    form.removeAttribute('aria-busy');
    controls.forEach(([control, disabled]) => { control.disabled = disabled; });
    renumberMembers();
    submitAnswer.disabled = answerSent;
    submitAnswer.textContent = answerSent ? 'Отправлено ♡' : 'Отправить ♡';
  }
  bindShortWords(feedback);
  feedback.focus({ preventScroll: true });
  feedback.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
});
addMember(false);
