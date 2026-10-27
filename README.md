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

## La vidéo d'accueil

Sur ordinateur, la vidéo occupe tout l'écran et le texte s'écrit directement sur le
décor, à droite du personnage. Sur téléphone et tablette en portrait, la vidéo est en
haut et le texte juste en dessous.

Les fichiers `assets/alex-idle.*` (la boucle), `assets/alex-smile.*` (le sourire de la
fin) et `assets/alex.jpg` (l’image fixe affichée avant la vidéo, ou à sa place si elle
ne se lance pas) sont **fabriqués** par `source/make-hero.py` à partir de l'export
étalonné rangé dans `source/`. Ne les modifie pas à la main : relance le script.

    python3 source/make-hero.py

Le script ne touche pas aux couleurs (l'étalonnage se fait dans ton logiciel de
montage). Il retire la partie gauche de l'image, raccorde la boucle par un fondu et
encode. Ses réglages (extrait de la boucle, part retirée à gauche) sont en tête de
fichier. Exporte en 1080p ou plus : la vidéo est affichée en grand.

Le dossier `source/` n'est pas publié (voir `exclude` dans `_config.yml`).

## Ne pas toucher

- `CNAME` — rattache le dépôt au domaine. Le supprimer casse le site.
- `_layouts/`, `assets/style.css` — la structure et l'habillage.
- La section sous la ligne de tirets dans `_config.yml`.
