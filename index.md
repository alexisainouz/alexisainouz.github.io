---
home: true
permalink: /
---

<section class="hero">
  {% if site.profile.idle != "" %}
  <video class="hero-bg is-idle" autoplay loop muted playsinline
         poster="{{ site.profile.photo | relative_url }}" aria-label="{{ site.profile.name }}">
    {% if site.profile.idle_webm != "" %}<source src="{{ site.profile.idle_webm | relative_url }}" type="video/webm">{% endif %}
    <source src="{{ site.profile.idle | relative_url }}" type="video/mp4">
    <img src="{{ site.profile.photo | relative_url }}" alt="{{ site.profile.name }}">
  </video>
  {% if site.profile.smile != "" %}
  <video class="hero-bg is-smile" muted playsinline preload="auto" aria-hidden="true">
    {% if site.profile.smile_webm != "" %}<source src="{{ site.profile.smile_webm | relative_url }}" type="video/webm">{% endif %}
    <source src="{{ site.profile.smile | relative_url }}" type="video/mp4">
  </video>
  {% endif %}
  {% else %}
  <img class="hero-bg" src="{{ site.profile.photo | relative_url }}" alt="{{ site.profile.name }}">
  {% endif %}

  <div class="hero-inner">
    <div class="hero-type">
      <h1 class="sr-only">{{ site.profile.name }}</h1>

      <div class="say">
        <p>I’m Alexis Gabriel Aïnouz — Alex is fine.<br>
        I started making obsessive food films on
        <a href="{{ site.links[0].url }}" rel="me noopener" target="_blank">YouTube</a>,
        235 million views ago. Along the way I wrote
        <a href="{{ site.book_url }}" rel="noopener" target="_blank">a bestselling cookbook</a>, and started
        <a href="{{ site.salut }}" rel="me noopener" target="_blank">a company</a>
        that makes dream tools for cooks.</p>

        <p>I have been an
        <a href="{{ site.links[2].url }}" rel="me noopener" target="_blank">entrepreneur</a>
        for more than twenty years. I now
        <a href="{{ site.links_secondary[0].url }}" rel="me noopener" target="_blank">freelance</a>
        as a creative director.</p>

        <p><a href="{{ '/contact/' | relative_url }}">Say hello</a> ;)</p>

        <p class="say-end">PS — yes,
        <a href="{{ '/lab/pizza-dough/' | relative_url }}">the pizza calculator</a>
        still exists.</p>
      </div>
    </div>
  </div>
</section>

<script src="{{ '/assets/type.js' | relative_url }}" defer></script>
