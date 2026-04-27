/* =====================
   Configuration
   ===================== */
const CLEAREDGE_CONFIG = {
  web3formsKey: '89d99494-60da-4083-ba19-af32425bb602',
  discordWebhookUrl: 'https://discord.com/api/webhooks/1498327400713293905/U3PAlL5pMifLjXXDxAs-k5_z4EKxYlLNI0ReTVXkOnU-ghnVq175-Be_dn6rOvvvhMc9',
};

/* =====================
   Lead Submission Engine
   ===================== */
function validateField(input) {
  const val = input.value.trim();
  const type = input.type;
  const isRequired = input.hasAttribute('required');
  let error = '';

  if (isRequired && !val) {
    error = 'This field is required';
  } else if (type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    error = 'Please enter a valid email address';
  } else if (type === 'tel' && val && !/^[\d\s()+\-\.]{7,20}$/.test(val)) {
    error = 'Please enter a valid phone number';
  } else if (input.tagName === 'SELECT' && isRequired && !val) {
    error = 'Please select an option';
  }

  let errEl = input.parentElement.querySelector('.field-error');
  if (error) {
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'field-error';
      input.parentElement.appendChild(errEl);
    }
    errEl.textContent = error;
    input.classList.add('input-error');
    return false;
  }

  if (errEl) errEl.remove();
  input.classList.remove('input-error');
  return true;
}

function validateForm(form) {
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let valid = true;
  inputs.forEach(function (input) {
    if (!validateField(input)) valid = false;
  });
  return valid;
}

function getServiceLabel(val) {
  const map = {
    'ppf-partial': 'PPF — Partial Front',
    'ppf-full-front': 'PPF — Full Front',
    'ppf-track': 'PPF — Track Package',
    'ppf-full-body': 'PPF — Full Body',
    'ceramic': 'Ceramic Coating',
    'tint': 'Window Tint',
    'ppf-ceramic': 'PPF + Ceramic (bundle)',
    'ppf-tint': 'PPF + Window Tint (bundle)',
    'full-package': 'Full Package (PPF + Ceramic + Tint)',
    'not-sure': 'Not sure — needs guidance',
  };
  return map[val] || val || 'Not specified';
}

async function sendToWeb3Forms(data) {
  const payload = Object.assign({ access_key: CLEAREDGE_CONFIG.web3formsKey }, data);
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Web3Forms error: ' + res.status);
  return res.json();
}

async function sendToDiscord(embed) {
  const url = CLEAREDGE_CONFIG.discordWebhookUrl;
  if (!url || url === 'YOUR_DISCORD_WEBHOOK_URL') return;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'ClearEdge Leads',
      embeds: [embed],
    }),
  });
}

async function submitLead(formData, source) {
  const web3Promise = sendToWeb3Forms(
    Object.assign({ subject: 'New Lead — ' + (formData.name || formData.firstName + ' ' + formData.lastName), from_name: 'ClearEdge Website' }, formData)
  );

  const name = formData.name || ((formData.firstName || '') + ' ' + (formData.lastName || '')).trim();
  const phone = formData.phone || 'Not provided';
  const vehicle = formData.vehicle ||
    [formData.vehicleYear, formData.vehicleMake, formData.vehicleModel].filter(Boolean).join(' ') +
    (formData.vehicleColor ? ' (' + formData.vehicleColor + ')' : '');

  var fields = [
    { name: 'Phone', value: phone, inline: true },
    { name: 'Email', value: formData.email || 'Not provided', inline: true },
    { name: 'Service', value: getServiceLabel(formData.service || formData.services), inline: false },
    { name: 'Vehicle', value: vehicle || 'Not provided', inline: false },
  ];
  if (formData.message) {
    fields.push({ name: 'Details', value: formData.message, inline: false });
  }
  if (formData.howFound) {
    fields.push({ name: 'Found via', value: formData.howFound, inline: true });
  }
  if (formData.smsConsent !== undefined) {
    fields.push({ name: 'SMS Consent', value: formData.smsConsent ? 'Yes' : 'No', inline: true });
  }

  const discordPromise = sendToDiscord({
    title: 'New Lead — ' + name,
    color: 0x7851A9,
    fields: fields,
    footer: { text: source },
    timestamp: new Date().toISOString(),
  });

  const results = await Promise.allSettled([web3Promise, discordPromise]);
  var web3Result = results[0];
  if (web3Result.status === 'rejected') throw web3Result.reason;
  return web3Result.value;
}

/* =====================
   Quote Popup
   ===================== */
(function () {
  const overlay = document.getElementById('quotePopup');
  if (!overlay) return;

  function openPopup() {
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
    sessionStorage.setItem('popupDismissed', '1');
  }

  if (!sessionStorage.getItem('popupDismissed')) {
    setTimeout(openPopup, 1500);
  }

  document.querySelectorAll('#navQuoteBtn, .mobile-quote-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openPopup();
    });
  });

  document.getElementById('popupClose').addEventListener('click', closePopup);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePopup();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) closePopup();
  });

  const popupForm = document.getElementById('popupForm');
  if (popupForm) {
    popupForm.querySelectorAll('input[required], select[required]').forEach(function (input) {
      input.addEventListener('blur', function () { validateField(input); });
    });

    popupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!validateForm(popupForm)) return;

      const btn = popupForm.querySelector('.popup-submit');
      const originalText = btn.textContent;
      btn.textContent = 'Submitting...';
      btn.disabled = true;

      try {
        await submitLead({
          name: popupForm.querySelector('[name="name"]').value.trim(),
          phone: popupForm.querySelector('[name="phone"]').value.trim(),
          email: popupForm.querySelector('[name="email"]').value.trim(),
          service: popupForm.querySelector('[name="service"]').value,
          vehicle: popupForm.querySelector('[name="vehicle"]').value.trim(),
          smsConsent: popupForm.querySelector('[name="smsConsent"]').checked,
        }, 'Quick Quote (Homepage)');

        btn.textContent = 'Request Sent! We\'ll be in touch.';
        btn.style.background = '#2a7a2a';
        btn.style.color = '#fff';
        popupForm.reset();
        setTimeout(closePopup, 2200);
      } catch (err) {
        btn.textContent = 'Something went wrong — please call us';
        btn.style.background = '#a33';
        btn.style.color = '#fff';
        setTimeout(function () {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
        }, 4000);
      }
    });
  }
})();

/* =====================
   Sticky Nav
   ===================== */
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* =====================
   Mobile Nav Toggle
   ===================== */
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
if (navToggle && navMobile) {
  navToggle.addEventListener('click', () => {
    navMobile.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    if (navMobile.classList.contains('open')) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

/* =====================
   FAQ Accordion
   ===================== */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const isOpen = btn.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-q').forEach(b => {
      b.classList.remove('open');
      if (b.nextElementSibling) b.nextElementSibling.classList.remove('open');
    });

    // Open clicked if it was closed
    if (!isOpen) {
      btn.classList.add('open');
      answer.classList.add('open');
    }
  });
});

/* =====================
   Counter Animation
   ===================== */
function animateCounter(el, target, duration = 1800) {
  const isFloat = target % 1 !== 0;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = eased * target;
    el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const statEls = document.querySelectorAll('.stat-num[data-target]');
if (statEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.6 });

  statEls.forEach(el => observer.observe(el));
}

/* =====================
   Gallery Filter
   ===================== */
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
});

/* =====================
   Smooth Scroll
   ===================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // Close mobile nav if open
      if (navMobile) navMobile.classList.remove('open');
    }
  });
});

/* =====================
   PPF Package Car Visualizer
   ===================== */
(function () {
  // Zone path data — side-view coupe facing RIGHT (front = right side)
  // Body outline anchor points:
  //   Rear bumper: x=65, Trunk: x~105-150, Rear quarter: x~145-228
  //   Door: x~228-384, Roof: x~210-413, A-pillar: x~348-430
  //   Front fender: x~382-440, Hood: x~430-565, Front bumper: x~515-565
  //   Rear wheel cx=148, Front wheel cx=435
  const ZONE_PATHS = {
    'rear-bumper':   'M 65,168 L 65,142 Q 72,122 95,112 L 108,110 L 108,168 Z',
    'trunk':         'M 105,110 L 148,103 L 148,168 L 105,168 Z',
    'rear-quarter':  'M 145,103 Q 184,97 210,84 L 230,84 L 230,168 L 178,168 L 145,168 Z',
    'door':          'M 227,84 L 348,75 Q 366,74 384,82 L 384,168 L 227,168 Z',
    'rocker':        'M 148,161 L 516,161 L 516,168 L 148,168 Z',
    'roof':          'M 210,84 L 348,75 Q 382,73 413,93 L 398,97 Q 365,79 348,80 L 212,89 Z',
    'a-pillar':      'M 350,79 Q 382,73 413,93 L 430,118 L 378,118 Z',
    'mirror':        'M 397,85 L 422,85 L 422,98 L 397,98 Z',
    'front-fender':  'M 382,83 L 413,93 L 430,118 L 430,168 L 382,168 Z',
    'hood':          'M 413,95 L 430,118 L 518,113 Q 546,109 562,125 L 556,117 Q 535,106 430,111 L 415,98 Z',
    'hood-partial':  'M 474,114 L 518,113 Q 546,109 562,125 L 556,117 Q 535,107 474,117 Z',
    'front-bumper':  'M 514,168 L 514,113 Q 543,109 562,125 L 564,144 Q 564,161 552,168 Z',
    'headlight':     '__ellipse__',
  };

  const GOLD = '#C9A84C';
  const ZONE_DEFAULT = '#252525';
  const ZONE_ACTIVE_OPACITY = '0.88';

  function buildCarSVG(activeZones) {
    let zoneSVG = '';
    for (const [name, pathData] of Object.entries(ZONE_PATHS)) {
      const isActive = activeZones.includes(name);
      const fill = isActive ? GOLD : ZONE_DEFAULT;
      const opacity = isActive ? ZONE_ACTIVE_OPACITY : '1';

      if (name === 'headlight') {
        zoneSVG += `<ellipse fill="${fill}" opacity="${opacity}" cx="538" cy="119" rx="16" ry="9"/>`;
      } else {
        zoneSVG += `<path fill="${fill}" opacity="${opacity}" d="${pathData}"/>`;
      }
    }

    return `<svg viewBox="0 0 580 188" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="295" cy="180" rx="228" ry="7" fill="rgba(0,0,0,0.4)"/>
  <path d="M 65,168 L 65,142 Q 72,122 95,112 L 148,103 Q 184,97 210,84 L 348,75 Q 382,73 413,93 L 430,118 L 518,113 Q 546,109 561,124 L 563,143 Q 564,160 553,168 Z" fill="#141414"/>
  ${zoneSVG}
  <path d="M 352,78 Q 380,74 412,93 L 427,116 L 357,116 Z" fill="#12202e" opacity="0.95"/>
  <path d="M 229,87 L 348,78 L 355,116 L 229,116 Z" fill="#12202e" opacity="0.85"/>
  <path d="M 215,87 L 229,87 L 229,116 L 218,114 Z" fill="#12202e" opacity="0.75"/>
  <line x1="384" y1="83" x2="384" y2="168" stroke="#080808" stroke-width="2"/>
  <line x1="148" y1="116" x2="430" y2="116" stroke="#080808" stroke-width="1.2"/>
  <path d="M 95,148 Q 200,148 430,146" stroke="#0e0e0e" stroke-width="1" fill="none"/>
  <circle cx="148" cy="168" r="33" fill="#060606" stroke="#282828" stroke-width="1.5"/>
  <circle cx="148" cy="168" r="21" fill="#111"/>
  <circle cx="148" cy="168" r="9"  fill="#1a1a1a"/>
  <line x1="148" y1="147" x2="148" y2="189" stroke="#252525" stroke-width="1.5"/>
  <line x1="127" y1="168" x2="169" y2="168" stroke="#252525" stroke-width="1.5"/>
  <line x1="134" y1="154" x2="162" y2="182" stroke="#252525" stroke-width="1.5"/>
  <line x1="162" y1="154" x2="134" y2="182" stroke="#252525" stroke-width="1.5"/>
  <circle cx="435" cy="168" r="33" fill="#060606" stroke="#282828" stroke-width="1.5"/>
  <circle cx="435" cy="168" r="21" fill="#111"/>
  <circle cx="435" cy="168" r="9"  fill="#1a1a1a"/>
  <line x1="435" y1="147" x2="435" y2="189" stroke="#252525" stroke-width="1.5"/>
  <line x1="414" y1="168" x2="456" y2="168" stroke="#252525" stroke-width="1.5"/>
  <line x1="421" y1="154" x2="449" y2="182" stroke="#252525" stroke-width="1.5"/>
  <line x1="449" y1="154" x2="421" y2="182" stroke="#252525" stroke-width="1.5"/>
  <path d="M 65,168 L 65,142 Q 72,122 95,112 L 148,103 Q 184,97 210,84 L 348,75 Q 382,73 413,93 L 430,118 L 518,113 Q 546,109 561,124 L 563,143 Q 564,160 553,168 Z" fill="none" stroke="#2e2e2e" stroke-width="1.5"/>
</svg>`;
  }

  document.querySelectorAll('.ppf-visual-item').forEach(item => {
    const zones = (item.dataset.zones || '').split(',').map(z => z.trim()).filter(Boolean);
    const container = item.querySelector('.car-svg-container');
    if (container) container.innerHTML = buildCarSVG(zones);
  });
})();

/* =====================
   Contact Form Submission
   ===================== */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.querySelectorAll('input[required], select[required], textarea[required]').forEach(function (input) {
    input.addEventListener('blur', function () { validateField(input); });
  });

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validateForm(contactForm)) return;

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
      await submitLead({
        firstName: contactForm.querySelector('[name="firstName"]').value.trim(),
        lastName: contactForm.querySelector('[name="lastName"]').value.trim(),
        email: contactForm.querySelector('[name="email"]').value.trim(),
        phone: contactForm.querySelector('[name="phone"]').value.trim(),
        vehicleYear: contactForm.querySelector('[name="vehicleYear"]').value.trim(),
        vehicleMake: contactForm.querySelector('[name="vehicleMake"]').value.trim(),
        vehicleModel: contactForm.querySelector('[name="vehicleModel"]').value.trim(),
        vehicleColor: contactForm.querySelector('[name="vehicleColor"]').value.trim(),
        services: contactForm.querySelector('[name="services"]').value,
        message: contactForm.querySelector('[name="message"]').value.trim(),
        howFound: contactForm.querySelector('[name="howFound"]').value,
      }, 'Landing Page Form');

      btn.textContent = 'Request Sent!';
      btn.style.background = '#2a7a2a';
      btn.style.color = '#fff';
      contactForm.reset();
      contactForm.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
      contactForm.querySelectorAll('.input-error').forEach(function (el) { el.classList.remove('input-error'); });
      setTimeout(function () {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 4000);
    } catch (err) {
      btn.textContent = 'Something went wrong — please call us';
      btn.style.background = '#a33';
      btn.style.color = '#fff';
      setTimeout(function () {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 4000);
    }
  });
}

/* =====================
   Hero Slideshow
   ===================== */
(function () {
  const slides = document.querySelectorAll('.hero-slide');
  if (!slides.length) return;
  let current = 0;
  setInterval(function () {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
    slides[current].style.animation = 'none';
    slides[current].offsetHeight; // reflow to restart animation
    slides[current].style.animation = '';
  }, 5000);
})();
