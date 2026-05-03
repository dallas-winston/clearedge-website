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
    'ppf-full-front-lower-sides': 'PPF — Full Front + Lower Sides',
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
