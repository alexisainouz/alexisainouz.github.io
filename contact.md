---
title: Contact
permalink: /contact/
description: Get in touch.
---

# Contact

<div class="todo">
<strong>À renseigner :</strong> une adresse dédiée au site, pas ton adresse personnelle —
elle sera récoltée par des robots dès la mise en ligne.
</div>

<h2>Working together</h2>

{% assign has_secondary = false %}
{% for l in site.links_secondary %}{% if l.url != "" %}{% assign has_secondary = true %}{% endif %}{% endfor %}

{% if has_secondary %}
<ul class="linklist">
{% for l in site.links_secondary %}{% if l.url != "" %}
  <li><a href="{{ l.url }}" rel="me noopener" target="_blank">
    <span class="label">{{ l.label }}</span>
    {% if l.note != "" %}<span class="note">{{ l.note }}</span>{% endif %}
  </a></li>
{% endif %}{% endfor %}
</ul>
{% else %}
<div class="todo">
Le lien Malt se colle dans <code>_config.yml</code>, section <code>links_secondary</code>.
Il est volontairement ici et pas sur l'accueil : Malt situe l'offre du côté du freelance
francophone, ce qui dessert le positionnement international de la page d'accueil.
</div>
{% endif %}
