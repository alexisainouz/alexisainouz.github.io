---
home: true
permalink: /
---

<section class="hero">
  <div class="hero-media-wrap">
    {% if site.profile.video != "" %}
    <video class="hero-media" autoplay muted loop playsinline
           poster="{{ site.profile.photo | relative_url }}" aria-label="{{ site.profile.name }}">
      {% if site.profile.video_webm != "" %}<source src="{{ site.profile.video_webm | relative_url }}" type="video/webm">{% endif %}
      <source src="{{ site.profile.video | relative_url }}" type="video/mp4">
      <img src="{{ site.profile.photo | relative_url }}" alt="{{ site.profile.name }}">
    </video>
    {% else %}
    <img class="hero-media" src="{{ site.profile.photo | relative_url }}" alt="{{ site.profile.name }}">
    {% endif %}
  </div>

  <div class="hero-type">
    <h1>{{ site.profile.name }}</h1>
    <p class="hero-line">{{ site.profile.line }}</p>
  </div>
</section>
<section class="hero-links">
  <ul class="linklist">
  {% for l in site.links %}
    {% if l.url != "" %}
    <li><a href="{{ l.url }}"{% unless l.url == '/book/' %} rel="me noopener" target="_blank"{% endunless %}>
      <span class="label">{{ l.label }}</span>
      {% if l.note != "" %}<span class="note">{{ l.note }}</span>{% endif %}
    </a></li>
    {% else %}
    <li class="pending"><span class="label">{{ l.label }}</span><span class="note">URL à coller dans _config.yml</span></li>
    {% endif %}
  {% endfor %}
  </ul>

  <p class="more"><a href="{{ '/about/' | relative_url }}">More about my work</a> · <a href="{{ '/lab/' | relative_url }}">Tools I built</a></p>
</section>
