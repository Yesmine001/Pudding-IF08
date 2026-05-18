# Projet IF08 - Pudding 

![Status](https://img.shields.io/badge/Status-En%20D%C3%A9veloppement-orange)
![Tech](https://img.shields.io/badge/Tech-HTML5%20%2F%20CSS3%20%2F%20JS-blue)
![API](https://img.shields.io/badge/API-OpenFoodFacts-green)

## Description

Ce projet consiste à réaliser un site web statique autour d’une recette de pudding de pain perdu au parmesan.

Le site utilise HTML, CSS, Bootstrap, JavaScript et des fichiers JSON afin d’afficher dynamiquement les informations de la recette et des produits via OpenFoodFacts.

---

## Recette officielle

https://www.marmiton.org/recettes/recette_pudding-de-pain-perdu-au-parmesan_59289.aspx

---

## Accès au site

Le site est accessible à l’adresse suivante :

https://www.orkidees.com/IF08/pudding/

---

## Technologies utilisées

- HTML
- CSS
- Bootstrap
- JavaScript
- JSON
- OpenFoodFacts

---

## Structure du projet

```txt
index.html
README.md

css/
 └── style.css

js/
 └── main.js

data/
 ├── recipe.json
 └── products.json
```

- `index.html` : page principale du site
- `css/style.css` : styles personnalisés du projet
- `js/main.js` : récupération API, injection DOM et calcul du score nutritionnel
- `data/recipe.json` : recette, étapes et ingrédients
- `data/products.json` : produits, codes-barres et informations nutritionnelles

---

## Installation et accès au projet

### Cloner le projet

```bash
git clone https://github.com/Yesmine001/Pudding-IF08.git
```

### Accéder au dossier

```bash
cd Pudding-IF08
```

### Ouvrir le projet

Ouvrir le fichier `index.html` dans un navigateur ou utiliser l’extension Live Server sur VS Code.

---

## Meilleures pratiques de développement

### Organisation du travail

- Travailler uniquement sur sa partie du projet
- Éviter de modifier les fichiers des autres membres sans prévenir
- Vérifier le fonctionnement du projet avant chaque push
- Garder une structure de code claire et lisible

---

## Bonnes pratiques Git

### Avant de commencer à travailler

Toujours récupérer les dernières modifications du projet :

```bash
git pull
```

---


### Ajouter les modifications

Ajouter les fichiers modifiés :

```bash
git add .
```

---

### Faire un commit

Faire des commits clairs et explicites décrivant les modifications réalisées :

```bash
git commit -m "Ajout structure HTML de la page recette"
```

Exemples de bons commits :
- `Ajout du fichier recipe.json`
- `Correction responsive mobile`
- `Ajout récupération API OpenFoodFacts`

---

### Envoyer les modifications

Envoyer les changements sur GitHub :

```bash
git push
```

---

## Conseils de développement

- Tester régulièrement le site dans le navigateur
- Vérifier la console JavaScript pour éviter les erreurs
- Respecter l’organisation des fichiers du projet
- Utiliser Bootstrap pour le responsive
- Garder le code HTML, CSS et JavaScript bien séparé

---

## Objectif du projet

Afficher dynamiquement une recette avec les informations nutritionnelles des ingrédients grâce à l’API OpenFoodFacts.
