# alexisainouz.com

Site personnel, servi par GitHub Pages. Le site est en anglais ; ce mode d'emploi
est en français, il n'est là que pour toi.

## Le fichier qui compte : `_config.yml`

Tes liens, ta photo, ton nom et ta phrase d'accueil sont tous dedans. Tu le modifies
là, et ça se répercute sur la page d'accueil **et** dans le pied de page de toutes
les pages, outils du lab compris. Ne recopie jamais un lien ailleurs.

Tant qu'une URL est vide, le lien s'affiche barré et grisé sur l'accueil — c'est
volontaire, tu vois d'un coup d'œil ce qui manque.

## Modifier le texte, sans personne

Les pages sont des fichiers `.md` à la racine. Tu les édites directement sur
github.com — bouton crayon, écrire, « Commit changes ». Le site se reconstruit
tout seul en une à deux minutes.

| Fichier | Page |
|---|---|
| `index.md` | l'accueil |
| `contact.md` | `/contact/` |
| `lab/index.md` | `/lab/` |

## Ajouter un outil dans le lab

1. Crée le dossier `lab/nom-de-loutil/` et mets ton fichier dedans, nommé `index.html`.
   C'est du HTML brut : aucun gabarit, aucune contrainte, il est servi tel quel.
   L'URL sera `alexisainouz.com/lab/nom-de-loutil/`.
2. Ajoute une ligne dans `lab/index.md` — le modèle est en commentaire dans le fichier.

**Un dossier par outil, jamais un fichier isolé.** Chaque outil peut ainsi avoir ses
propres images et données à côté de lui, et tu le déplaces ou le supprimes d'un bloc.

## La photo

`assets/alex.jpg`, format carré, environ 1200 px de côté, sous 250 Ko. Elle sert
aussi de vignette quand quelqu'un partage un lien du site sur WhatsApp ou LinkedIn.

## La vidéo d'accueil

Les vidéos `assets/alex-idle.*` (la boucle) et `assets/alex-smile.*` (le sourire de la
fin) sont fabriquées par `source/make-hero.py` à partir de la vidéo d'origine rangée
dans `source/`. Le script convertit le HDR de l'iPhone en SDR (sinon l'image est
délavée), recadre en carré, recale le bleu du mur sur celui du site, et raccorde la
boucle par un fondu. Les réglages (cadrage, extrait retenu) sont en tête de fichier
et dans les commandes données dans son en-tête.

Le dossier `source/` n'est pas publié (voir `exclude` dans `_config.yml`).

## Ne pas toucher

- `CNAME` — rattache le dépôt au domaine. Le supprimer casse le site.
- `_layouts/`, `assets/style.css` — la structure et l'habillage.
- La section sous la ligne de tirets dans `_config.yml`.
