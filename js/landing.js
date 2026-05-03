/* =====================
   Landing Page — Hero Form Submission
   ===================== */
(function () {
  var heroForm = document.getElementById('heroForm');
  var heroSuccess = document.getElementById('heroFormSuccess');
  if (!heroForm) return;

  heroForm.querySelectorAll('input[required], select[required]').forEach(function (input) {
    input.addEventListener('blur', function () { validateField(input); });
  });

  heroForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validateForm(heroForm)) return;

    var btn = heroForm.querySelector('.hero-form-submit');
    var originalText = btn.textContent;
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
      await submitLead({
        name: heroForm.querySelector('[name="name"]').value.trim(),
        phone: heroForm.querySelector('[name="phone"]').value.trim(),
        service: heroForm.querySelector('[name="service"]').value,
      }, 'Landing Page Hero Form (Meta Ad)');

      sessionStorage.setItem('heroFormSubmitted', '1');
      heroForm.style.display = 'none';
      heroSuccess.classList.add('visible');
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
})();

/* =====================
   Landing Page — Delayed Popup
   Replaces the 1.5s auto-open from main.js with:
   - 20-second delay OR 50% page scroll, whichever comes first
   - Suppressed if inline hero form was already submitted
   - Only fires once per session (tracked via landingPopupShown)

   Note: main.js auto-open is blocked by a popupDismissed flag set
   inline in landing.html before main.js loads. This script manages
   the landing page popup independently.
   ===================== */
(function () {
  var overlay = document.getElementById('quotePopup');
  if (!overlay) return;

  function shouldShow() {
    return !sessionStorage.getItem('landingPopupShown')
        && !sessionStorage.getItem('heroFormSubmitted');
  }

  var fired = false;

  function openPopup() {
    if (fired || !shouldShow()) return;
    fired = true;
    sessionStorage.setItem('landingPopupShown', '1');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    cleanup();
  }

  var timer = null;
  var onScroll = null;

  function cleanup() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (onScroll) {
      window.removeEventListener('scroll', onScroll);
      onScroll = null;
    }
  }

  if (!shouldShow()) return;

  timer = setTimeout(openPopup, 20000);

  onScroll = function () {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable > 0 && (window.scrollY / scrollable) >= 0.5) {
      openPopup();
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();
