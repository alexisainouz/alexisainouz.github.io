# alexisainouz.com

Site personnel, servi par GitHub Pages sur le domaine `alexisainouz.com`.

## Comment modifier le texte, sans moi

Les pages de texte sont des fichiers `.md` (markdown) à la racine. Tu peux les éditer
directement depuis github.com — bouton crayon, écrire, « Commit changes ». Le site se
reconstruit tout seul en une à deux minutes.

| Fichier | Page |
|---|---|
| `index.md` | la page d'accueil |
| `parcours.md` | `/parcours/` |
| `contact.md` | `/contact/` |
| `lab/index.md` | `/lab/` |

Les blocs `<div class="todo">…</div>` sont les marqueurs de ce qui reste à écrire.
Les supprimer au fur et à mesure.

## Comment ajouter un outil dans le lab

Déposer le fichier dans `lab/nom-de-loutil/index.html`. C'est du HTML brut : aucun
gabarit, aucune contrainte, il est servi tel quel. Ajouter ensuite une ligne dans
`lab/index.md` (le modèle est en commentaire dans le fichier).

## Fichiers à ne pas toucher

- `CNAME` — c'est lui qui rattache le dépôt au domaine. Le supprimer casse le site.
- `_config.yml`, `_layouts/`, `assets/style.css` — la structure et l'habillage.
