---
home: true
permalink: /
---

<section class="hero">
  {% if site.profile.video != "" %}
  <video class="hero-bg" autoplay muted playsinline
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
        with teams who need creativity, and spend the rest of my time
        <a href="{{ site.links[1].url }}" rel="me noopener" target="_blank">dancing, sailing, cycling</a>,
        and finding <a href="{{ '/lab/' | relative_url }}">solutions to problems nobody else has</a>.</p>

        <p><a href="{{ '/contact/' | relative_url }}">Say hello</a> ;)</p>
      </div>
    </div>
  </div>
</section>

<script src="{{ '/assets/type.js' | relative_url }}" defer></script>
