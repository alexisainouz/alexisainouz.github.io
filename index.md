---
home: true
permalink: /
---

<section class="hero">
  {% if site.profile.video != "" %}
  <video class="hero-bg" autoplay muted loop playsinline
         poster="{{ site.profile.photo | relative_url }}" aria-label="{{ site.profile.name }}">
    {% if site.profile.video_webm != "" %}<source src="{{ site.profile.video_webm | relative_url }}" type="video/webm">{% endif %}
    <source src="{{ site.profile.video | relative_url }}" type="video/mp4">
    <img src="{{ site.profile.photo | relative_url }}" alt="{{ site.profile.name }}">
  </video>
  {% else %}
  <img class="hero-bg" src="{{ site.profile.photo | relative_url }}" alt="{{ site.profile.name }}">
  {% endif %}

  <div class="hero-inner">
    <div class="hero-type">
      <h1>{{ site.profile.name }}</h1>
      <p class="hero-line">{{ site.profile.line }}</p>
      {% if site.profile.facts %}<p class="hero-facts">{{ site.profile.facts }}</p>{% endif %}

      <ul class="pagenav">
        <li><a href="{{ '/about/'   | relative_url }}">About</a></li>
        <li><a href="{{ '/lab/'     | relative_url }}">Lab</a></li>
        <li><a href="{{ '/contact/' | relative_url }}">Contact</a></li>
      </ul>

      <ul class="linklist">
      {% for l in site.links %}{% if l.url != "" %}
        <li><a href="{{ l.url }}"{% unless l.url == '/book/' %} rel="me noopener" target="_blank"{% endunless %}>
          <span class="label">{{ l.label }}</span>
          {% if l.note != "" %}<span class="note">{{ l.note }}</span>{% endif %}
        </a></li>
      {% endif %}{% endfor %}
      </ul>
    </div>
  </div>
</section>
