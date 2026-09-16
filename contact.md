---
title: Contact
permalink: /contact/
description: Get in touch.
---

# Contact

<p class="lede">Brand work, press, speaking, or a question about a recipe —
write below and it reaches me directly.</p>

{% if site.form.access_key != "" %}
<form id="contact-form" class="form" action="{{ site.form.endpoint }}" method="POST">
  <input type="hidden" name="access_key" value="{{ site.form.access_key }}">
  <input type="hidden" name="subject" value="alexisainouz.com — new message">
  <input type="hidden" name="from_name" value="alexisainouz.com">

  <!-- Leurre : invisible pour un humain, rempli par la plupart des robots.
       S'il est rempli, l'envoi est rejeté. -->
  <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off">

  <div class="row">
    <label for="f-name">Your name</label>
    <input id="f-name" type="text" name="name" required autocomplete="name">
  </div>

  <div class="row">
    <label for="f-mail">Your email</label>
    <input id="f-mail" type="email" name="email" required autocomplete="email">
  </div>

  <div class="row">
    <label for="f-msg">Message</label>
    <textarea id="f-msg" name="message" rows="6" required></textarea>
  </div>

  {% if site.form.turnstile_key != "" %}
  <div class="cf-turnstile" data-sitekey="{{ site.form.turnstile_key }}" data-theme="light"></div>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  {% endif %}

  <button type="submit">Send</button>
  <p class="form-note" role="status" aria-live="polite"></p>
</form>

<script>
(() => {
  const f = document.getElementById('contact-form');
  if (!f) return;
  const note = f.querySelector('.form-note');
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = f.querySelector('button');
    btn.disabled = true; note.textContent = 'Sending…'; note.className = 'form-note';
    try {
      const r = await fetch(f.action, { method: 'POST', body: new FormData(f),
                                        headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(r.status);
      f.reset();
      note.textContent = 'Thank you — your message is on its way.';
      note.className = 'form-note ok';
    } catch (err) {
      note.textContent = 'Something went wrong. Please try again in a moment.';
      note.className = 'form-note ko';
    } finally {
      btn.disabled = false;
    }
  });
})();
</script>
{% else %}
<p>The form is being set up. In the meantime, reach me through
<a href="{{ site.links[2].url }}" rel="me noopener" target="_blank">LinkedIn</a>.</p>
{% endif %}
