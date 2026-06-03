/**
 * Pudding de pain perdu au parmesan
 * Script principal - Intégration dynamique des données et de l'API OpenFoodFacts
 * Auteur : Yesmine FATHALLAH & Antigravity IDE
 */

document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const productList = document.getElementById('productList');
    const stepsList = document.getElementById('steps');
    const nutritionScoreContainer = document.getElementById('nutrition-score');

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchError = document.getElementById('searchError');
    const searchLoader = document.getElementById('searchLoader');
    const searchResults = document.getElementById('searchResults');

    // Image générique de secours de qualité supérieure
    const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

    // Initialisation
    initApp();

    /**
     * Point d'entrée de l'application
     */
    async function initApp() {
        // Lancer en parallèle le chargement de la recette et des ingrédients
        await Promise.all([
            loadRecipe(),
            loadIngredients()
        ]);

        // Configurer les écouteurs d'événements de recherche
        setupSearch();
    }

    /**
     * Charge et affiche la recette (étapes de préparation) depuis recipe.json
     */
    async function loadRecipe() {
        try {
            const response = await fetch('data/recipe.json');
            if (!response.ok) throw new Error('Impossible de charger data/recipe.json');

            const recipeData = await response.json();

            if (recipeData.steps && recipeData.steps.length > 0) {
                // Vider le conteneur d'étapes
                stepsList.innerHTML = '';

                recipeData.steps.forEach(step => {
                    const stepElement = document.createElement('div');
                    stepElement.className = 'list-group-item bg-transparent border-0 py-3';
                    stepElement.innerHTML = `
                        <p class="mb-0 text-dark fw-medium">${step.text}</p>
                    `;
                    stepsList.appendChild(stepElement);
                });
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la recette:', error);
            stepsList.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Impossible de charger les étapes de la recette.
                </div>
            `;
        }
    }

    /**
     * Charge les ingrédients depuis products.json et récupère leurs détails (images, scores) via OpenFoodFacts
     */
    async function loadIngredients() {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error('Impossible de charger data/products.json');

            const data = await response.json();
            const localProducts = data.products || [];

            if (localProducts.length === 0) {
                productList.innerHTML = '<div class="col-12 text-center py-4">Aucun ingrédient trouvé dans la configuration.</div>';
                return;
            }

            // Récupérer les informations Open Food Facts pour chaque ingrédient en parallèle
            const fetchPromises = localProducts.map(async (prod) => {
                const apiProduct = await fetchFromOpenFoodFacts(prod.barcode);
                return {
                    local: prod,
                    api: apiProduct
                };
            });

            const resolvedProducts = await Promise.all(fetchPromises);

            // Générer le rendu des cartes
            renderIngredientCards(resolvedProducts);

            // Calculer et afficher le Nutri-Score moyen
            calculateAverageNutriscore(resolvedProducts);

        } catch (error) {
            console.error('Erreur lors du chargement des ingrédients:', error);
            productList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger" role="alert">
                        Une erreur est survenue lors de la récupération des ingrédients.
                    </div>
                </div>
            `;
        }
    }

    /**
     * Interroge l'API v2 d'Open Food Facts pour un code-barres donné
     */
    async function fetchFromOpenFoodFacts(barcode) {
        if (!barcode) return null;
        try {
            // Nettoyage du code-barres
            const cleanBarcode = barcode.toString().trim();
            const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (data.status === 1 && data.product) {
                return data.product;
            }
            return null;
        } catch (e) {
            console.warn(`[OpenFoodFacts] Impossible de récupérer les données pour le code-barres: ${barcode}`, e);
            return null;
        }
    }

    /**
     * Normalise et nettoie le grade Nutri-Score (a, b, c, d, e ou unknown)
     */
    function normalizeNutriscore(grade) {
        if (!grade) return 'unknown';
        const cleanGrade = grade.toString().toLowerCase().trim();
        return ['a', 'b', 'c', 'd', 'e'].includes(cleanGrade) ? cleanGrade : 'unknown';
    }

    /**
     * Rend les cartes d'ingrédients à partir des données combinées (locales & API)
     */
    function renderIngredientCards(ingredients) {
        productList.innerHTML = ''; // Supprime les skeletons

        ingredients.forEach(item => {
            const local = item.local;
            const api = item.api || {};

            // Détermination du nom (priorité locale car personnalisé pour la recette)
            const name = local.name || api.product_name || 'Ingrédient sans nom';

            // Détermination de l'image (priorité API, fallback locale, puis placeholder)
            const imageUrl = api.image_front_small_url || api.image_front_url || local.image_front_small_url || PLACEHOLDER_IMAGE;

            // Détermination du Nutri-Score (gestion de l'espace dans la clé locale "nutriscore_grade ")
            const rawLocalGrade = local['nutriscore_grade '] || local.nutriscore_grade;
            const grade = normalizeNutriscore(api.nutriscore_grade || rawLocalGrade);

            const barcode = local.barcode;

            // Création de la colonne Bootstrap
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4';

            col.innerHTML = `
                <div class="card ingredient-card">
                    <div class="ingredient-img-wrapper">
                        <img 
                            src="${imageUrl}" 
                            class="ingredient-img" 
                            alt="${name}" 
                            loading="lazy"
                            onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}';"
                        >
                    </div>
                    <div class="card-body p-3 d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title fw-bold text-dark mb-1 text-truncate" title="${name}">${name}</h5>
                            <p class="card-text text-muted small mb-3">Code : <code class="text-secondary">${barcode}</code></p>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-auto border-top pt-2">
                            <span class="text-muted small fw-semibold">Nutri-Score</span>
                            <span class="nutriscore-badge nutriscore-${grade}" title="Nutri-Score ${grade.toUpperCase()}">${grade === 'unknown' ? '-' : grade.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            `;
            productList.appendChild(col);
        });
    }

    /**
     * Évalue et affiche le Nutri-Score moyen de la recette
     */
    function calculateAverageNutriscore(ingredients) {
        const scoreValues = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        const scoreGrades = { 1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e' };

        let totalScore = 0;
        let count = 0;

        ingredients.forEach(item => {
            const local = item.local;
            const api = item.api || {};
            const rawLocalGrade = local['nutriscore_grade '] || local.nutriscore_grade;
            const grade = normalizeNutriscore(api.nutriscore_grade || rawLocalGrade);

            if (grade !== 'unknown' && scoreValues[grade] !== undefined) {
                totalScore += scoreValues[grade];
                count++;
            }
        });

        if (count > 0) {
            const averageValue = Math.round(totalScore / count);
            const averageGrade = scoreGrades[averageValue];

            nutritionScoreContainer.innerHTML = `
                <div class="d-inline-flex align-items-center gap-3 bg-white px-4 py-2 rounded-pill shadow-sm border border-light transition-all">
                    <span class="fw-bold text-secondary text-uppercase tracking-wider small">Nutri-Score Moyen :</span>
                    <span class="nutriscore-badge nutriscore-${averageGrade} text-white fw-extrabold" style="transform: scale(1.15);">${averageGrade.toUpperCase()}</span>
                    <span class="text-muted small border-start ps-3 d-none d-sm-inline">Calculé sur ${count} ingrédients</span>
                </div>
            `;
        } else {
            nutritionScoreContainer.innerHTML = `
                <div class="d-inline-flex align-items-center gap-2 bg-white px-4 py-2 rounded-pill shadow-sm">
                    <span class="text-muted small">Nutri-Score non disponible</span>
                </div>
            `;
        }
    }

    /**
     * Configuration des gestionnaires d'événements pour le moteur de recherche
     */
    function setupSearch() {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    /**
     * Effectue une recherche en direct sur l'API OpenFoodFacts
     */
    async function performSearch() {
        const query = searchInput.value.trim();

        // Cacher les messages précédents et afficher le loader
        searchError.classList.add('d-none');
        searchResults.innerHTML = '';

        if (!query) {
            showSearchError("Veuillez saisir un mot-clé ou un nom de produit.");
            return;
        }

        searchLoader.classList.remove('d-none');

        try {
            // Requête de recherche sur l'API OpenFoodFacts
            const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=9`;
            const response = await fetch(searchUrl);

            if (!response.ok) throw new Error('Échec de la communication avec le serveur Open Food Facts');

            const data = await response.json();
            const products = data.products || [];

            searchLoader.classList.add('d-none');

            if (products.length === 0) {
                searchResults.innerHTML = `
                    <div class="col-12 text-center text-muted py-4">
                        <p class="fs-5 mb-1">😕 Aucun produit trouvé</p>
                        <small>Essayez d'autres mots-clés plus génériques (ex: "lait", "pain", "beurre").</small>
                    </div>
                `;
                return;
            }

            renderSearchResults(products);

        } catch (error) {
            console.error('Erreur de recherche OpenFoodFacts:', error);
            searchLoader.classList.add('d-none');
            showSearchError("Une erreur est survenue lors de la recherche. Veuillez vérifier votre connexion et réessayer.");
        }
    }

    /**
     * Affiche un message d'erreur de recherche
     */
    function showSearchError(message) {
        searchError.textContent = message;
        searchError.classList.remove('d-none');
    }

    /**
     * Rend les cartes de résultats de recherche
     */
    function renderSearchResults(products) {
        searchResults.innerHTML = '';

        products.forEach(prod => {
            const name = prod.product_name || prod.product_name_fr || 'Produit sans nom';
            const brand = prod.brands || 'Marque inconnue';
            const barcode = prod.code || 'Inconnu';
            const grade = normalizeNutriscore(prod.nutriscore_grade);
            const imageUrl = prod.image_front_small_url || prod.image_front_url || PLACEHOLDER_IMAGE;

            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4';

            col.innerHTML = `
                <div class="card search-result-card h-100 d-flex flex-column justify-content-between">
                    <div class="ingredient-img-wrapper">
                        <img 
                            src="${imageUrl}" 
                            class="ingredient-img" 
                            alt="${name}" 
                            loading="lazy"
                            onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}';"
                        >
                    </div>
                    <div class="card-body p-3 d-flex flex-column justify-content-between">
                        <div>
                            <h6 class="fw-bold mb-1 text-truncate text-dark" title="${name}">${name}</h6>
                            <p class="text-muted small mb-1 text-truncate">${brand}</p>
                            <p class="card-text text-muted small mb-3">Code : <code class="text-secondary">${barcode}</code></p>
                        </div>
                        <div class="mt-auto border-top pt-2">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="text-muted small">Nutri-Score</span>
                                <span class="nutriscore-badge nutriscore-${grade}" title="Nutri-Score ${grade.toUpperCase()}">${grade === 'unknown' ? '-' : grade.toUpperCase()}</span>
                            </div>
                            <a href="https://world.openfoodfacts.org/product/${barcode}" target="_blank" class="btn btn-sm btn-outline-primary w-100 mt-2 fw-semibold rounded-pill py-1 transition-all">
                                Voir sur Open Food Facts ➔
                            </a>
                        </div>
                    </div>
                </div>
            `;
            searchResults.appendChild(col);
        });
    }
});
