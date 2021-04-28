'use strict';

/**
 * La página web debe:
 *
 * ✅ 1. Mostrar una lista en tarjetas de, al menos, los primeros 151 pokemones. Las tarjetas deben mostrar el nombre y
 *    tipo de cada Pokémon (tipo agua, tipo fuego, tipo venenoso, etc.)
 * 2. Permitir que, al hacer click sobre la tarjeta de un pokemon, se despliegue más información, como el peso, sus
 *    movimientos (ataques), etc.
 * 3. El sitio web debe tener un buscador de pokemones, donde puedas filtrar pokemones por nombre. (Esto es un plus)
 * Cosas a tener en cuenta:
 * ✅ - Diseño libre (Bootstrap, materialize, o tu propio css)
 * ✅ - Uso de clases e instancias.
 * ✅ - ES6
 * - Repo en Github (Github pages es un plus)
 */

// DOM ELEMENTS
const pokeContainer = document.getElementById('pokemon__container');

// DATA STRUCTURE
class Pokemon {
  constructor(name, url, id) {
    this.name = name;
    this.url = url;
    this.id = id;
    this.type = [];
    this.getAllInfo();
  }
  // METHOD: GET RESTO DE LA INFO DEL POKEMÓN
  getAllInfo() {
    return fetchAndParse(
      this.url,
      'Error el resto de los datos del pokemon'
    ).then(pokemonData => {
      this.imgSrc = pokemonData.sprites.front_default;
      this.height = (pokemonData.height / 10).toFixed(2); // in mts
      this.weight = (pokemonData.weight / 10).toFixed(2); // in kgs
      pokemonData.types.forEach(types => this.type.push(types.type.name));
    });
  }
}

// APP
class App {
  constructor() {
    this.allPokemon = [];
    this.getPokemonList();
  }

  // FUNCT: GET LISTA DE POKEMONES
  getPokemonList() {
    fetchAndParse(
      'https://pokeapi.co/api/v2/pokemon/?limit=15',
      'Error en la petición'
    )
      .then(data => {
        data.results.forEach((pokemon, index) => {
          this.allPokemon.push(
            new Pokemon(pokemon.name, pokemon.url, index + 1)
          );
        });
        // FIXME: CATCH THIS ERROR
        return this.allPokemon[this.allPokemon.length - 1].getAllInfo();
      })
      .then(() => {
        this.allPokemon.forEach(pokemon => renderPokemonCard(pokemon));
      })
      .catch(err => console.log(err.message));
  }

  searchFor(name) {}
}

// HELPER FUNCT
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

// Render Pokemon Card
const renderPokemonCard = function (pokeObj) {
  let listTypesHtml = '';
  let [colorA, colorB] = pokeObj.type;

  if (!colorB) {
    colorB = colorA;
  }

  for (let typ of pokeObj.type) {
    listTypesHtml += `<p class="py-2 px-4 shadow-md rounded-full text-white font-semibold text-xs mr-2 inline-block" style="background: ${typeToColor(
      typ
    )}">
    ${typ}</p>`;
  }

  let html = `
  <div class="card">
     <img src=${pokeObj.imgSrc} alt="${
    pokeObj.name
  }" class="w-full" style="background: linear-gradient(45deg,${typeToColor(
    colorA
  )} 0%,${typeToColor(colorA)} 50%,${typeToColor(colorB)} 50%,${typeToColor(
    colorB
  )} 100%)">
     <div class="pokemon-info p-4">
         <h2 class="text-center font-light uppercase tracking-wide">${
           pokeObj.name
         }</h2>
         ${listTypesHtml}
     </div>
  </div>
`;
  pokeContainer.insertAdjacentHTML('beforeend', html);
};

// INIT
const app = new App();