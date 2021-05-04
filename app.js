'use strict';

/**
 * La página web debe:
 *
 * ✅ 1. Mostrar una lista en tarjetas de, al menos, los primeros 151 pokemones. Las tarjetas deben mostrar el nombre y
 *    tipo de cada Pokémon (tipo agua, tipo fuego, tipo venenoso, etc.)
 * ✅ 2. Permitir que, al hacer click sobre la tarjeta de un pokemon, se despliegue más información, como el peso, sus
 *    movimientos (ataques), etc.
 * ✅ 3. El sitio web debe tener un buscador de pokemones, donde puedas filtrar pokemones por nombre. (Esto es un plus)
 * Cosas a tener en cuenta:
 * ✅ - Diseño libre (Bootstrap, materialize, o tu propio css)
 * ✅ - Uso de clases e instancias.
 * ✅ - ES6
 * - Repo en Github (Github pages es un plus)
 */
// TODO: Add README

// DOM ELEMENTS
const pokeContainer = document.getElementById('pokemon__container');
const searchForm = document.getElementById('search-form');
const input = document.getElementById('search-input');
const clearBtn = document.getElementById('clear-btn');
const errorModal = document.querySelector('.errorContainer');

// DATA STRUCTURE
class Pokemon {
  constructor(name, url, id) {
    this.name = name;
    this.url = url;
    this.id = id;
    this.stats = {};

    // this.getAllInfo();
  }
  // METHOD: GET POKEMON INFO
  getAllInfo() {
    return fetchAndParse(
      this.url,
      'Error el resto de los datos del pokemon'
    ).then(pokemonData => {
      this.imgSrc = pokemonData.sprites.front_default;
      this.height = (pokemonData.height / 10).toFixed(2); // in mts
      this.weight = (pokemonData.weight / 10).toFixed(2); // in kgs
      this.type = pokemonData.types.map(types => types.type.name);
      pokemonData.stats.forEach(stat => {
        this.stats[stat.stat.name] = stat.base_stat;
      });
      this.moves = pokemonData.moves.map(mov => mov.move.name);

      // console.log(this);

      // RENDER POKEMON METHOD FROM APP
      // app.renderPokemonCard.call(this, this); // FUNCT RARA
    });
  }
}

// APP
class App {
  constructor(noOfPokemons) {
    this.allPokemon = [];
    // Get all pokemons
    this.getPokemonList(noOfPokemons);
    // Event Handlers
    searchForm.addEventListener('submit', this.searchFor.bind(this));
    clearBtn.addEventListener('click', this.clearSearchAndRenderAll.bind(this));
  }

  // AJAX to get data from API
  getPokemonList(number) {
    fetchAndParse(
      `https://pokeapi.co/api/v2/pokemon/?limit=${number}`,
      'Error en la petición'
    )
      .then(data => {
        this.allPokemon = data.results.map((pokemon, index) => {
          return new Pokemon(pokemon.name, pokemon.url, index + 1);
        });
        return Promise.all(this.allPokemon.map(el => el.getAllInfo()));
      })
      .then(() => {
        this.allPokemon.forEach(pokemon => this.renderPokemonCard(pokemon));
      })
      .catch(err => console.log(err.message));
  }

  // Render Pokemon Card
  renderPokemonCard(pokeObj) {
    // Create type pills
    let listTypesHtml = '';
    let [colorA, colorB] = pokeObj.type;
    // If pokemon has only one type
    if (!colorB) {
      colorB = colorA;
    }
    pokeObj.type.forEach((type, i, array) => {
      listTypesHtml += `<p class="py-2 px-4 shadow-md rounded-full text-white font-semibold text-xs mr-2 mb-2 inline-block" style="background: ${typeToColor(
        type
      )}">
    ${type[0].toUpperCase() + type.slice(1)}</p>`;
    });

    // Stats list
    let statListHtml = '';
    for (let [key, value] of Object.entries(pokeObj.stats)) {
      statListHtml += `<li>${key
        .toLocaleUpperCase()
        .split('-')
        .join(' ')}: ${value}</li>`;
    }

    // Move list
    let moveListHtml = pokeObj.moves.slice(0, 6).join(', ');

    // Build complete html string
    let html = `
      <div class="card">
        <div class="card__content">
         <div class="card__front">
            <img src=${pokeObj.imgSrc} alt="${
      pokeObj.name
    }" class="w-full" style="background: linear-gradient(45deg,${typeToColor(
      colorA
    )} 0%,${typeToColor(colorA)} 50%,${typeToColor(colorB)} 50%,${typeToColor(
      colorB
    )} 100%)">
            <div class="pokemon-info p-4 text-center">
                <h2 class="font-light uppercase tracking-wide mb-2">${
                  pokeObj.name
                }</h2>
                ${listTypesHtml}
            </div>
         </div>
         <div class="card__back">
                <h3 class="font-black uppercase tracking-wide mb-2 text-center">${
                  pokeObj.id
                }: <span class="font-bold">${pokeObj.name}</span></h3>
                <ul class="flex justify-between mb-2">
                  <li>H: ${pokeObj.height} mts</li>
                  <li>W: ${pokeObj.weight} kg</li>
                </ul>
                <span class="font-bold">STATS:</span>
                <ul class="text-right mr-4 mb-2">
                  ${statListHtml}
                </ul>
                <span class="font-bold">MOVES:</span>
                <p class="text-xs">
                  ${moveListHtml}...
                </p>
         </div>
         </div>
      </div>`;

    // Add card to pokemon container
    pokeContainer.insertAdjacentHTML('beforeend', html);
  }

  // SEARCH
  searchFor(e) {
    e.preventDefault();
    // Get value of input
    let searchQuery = input.value;
    // Filter de allPokemon array with searchQuery
    const found = this.allPokemon.filter(el => el.name.includes(searchQuery));

    // Found array is not empty
    if (found.length > 0) {
      // Clear container
      this.clearContainer();
      // Show clear btn
      clearBtn.style.display = 'flex';
      // Render found pokemons
      found.forEach(pokemon => this.renderPokemonCard(pokemon));
    } else {
      // Render not found
      this.renderError('No se encontro ningún pokemon');
      console.log('No se encontro ningún pokemon');
    }
    // Clear input
    input.value = '';
  }

  renderError(msg) {
    errorModal.querySelector('.msgItem').innerHTML = msg;
    errorModal.style.display = 'block';
    errorModal.addEventListener('click', function () {
      this.style.display = 'none';
    });
  }

  clearContainer() {
    pokeContainer.textContent = '';
  }

  clearSearchAndRenderAll() {
    this.clearContainer();
    this.allPokemon.forEach(pokemon => this.renderPokemonCard(pokemon));
    clearBtn.style.display = 'none';
  }
}

// HELPER FUNCT
// Fetch & parse
const fetchAndParse = function (url, errMsg) {
  return fetch(url).then(res => {
    if (!res.ok) throw new Error(`${errMsg} (${res.status})`);

    return res.json();
  });
};

// Return color type
const typeToColor = function (type) {
  // prettier-ignore
  const typeColors = { grass: '#78C850', poison: '#A040A0', fire: '#F08030', flying: '#A890F0',
    water: '#6890F0', bug: '#A8B820', normal: '#A8A878', fighting: '#C03028', ground: '#E0C068',
    rock: '#B8A038', ghost: '#705898', steel: '#B8B8D0', electric: '#F8D030', psychic: '#F85888',
    ice: '#98D8D8', dragon: '#7038F8', fairy: '#EE99AC',
    // unknown: '', shadow: '', dark: '',
  };
  return typeColors[type];
};

// INIT
const app = new App(151);
