// Pega aquí tu nuevo token
const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhY2YzYWVkZTdjM2E2YTk4ZWZjN2Y1MTNlNGVjMTM0MyIsIm5iZiI6MTc4MDI1Mzc0Mi4wMjEsInN1YiI6IjZhMWM4NDJlOWEyYjAyMTQ0NTk4ODM4YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.piY12PsAPXK6xPrSburjrGj0MRh7AhNq4N91bIrmvvQ";

const grid = document.getElementById("contentGrid");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalPoster = document.getElementById("modalPoster");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalDescription = document.getElementById("modalDescription");

let selectedItem = null;

// Función para hacer llamadas a TMDb
async function fetchTMDB(endpoint) {
  const url = `https://api.themoviedb.org/3${endpoint}`;
  const resp = await fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_TOKEN}`
    }
  });
  if (!resp.ok) throw new Error("Error al llamar a TMDb API");
  return await resp.json();
}

// Cargar películas populares
async function cargarPeliculas() {
  try {
    const data = await fetchTMDB("/movie/popular?language=es-ES&page=1");
    mostrarPeliculas(data.results);
  } catch (error) {
    console.error(error);
    grid.innerHTML = "<p>Error al cargar películas.</p>";
  }
}

// Renderizar películas en el grid
function mostrarPeliculas(peliculas) {
  grid.innerHTML = peliculas.map(film => `
    <article class="card" onclick="abrirDetalle(${film.id})">
      <img src="https://image.tmdb.org/t/p/w500${film.poster_path}" alt="${film.title}">
      <div class="card-body">
        <h3>${film.title}</h3>
        <p>⭐ ${film.vote_average}</p>
      </div>
    </article>
  `).join("");
}

// Abrir modal con detalle de película
async function abrirDetalle(id) {
  try {
    const film = await fetchTMDB(`/movie/${id}?language=es-ES`);
    selectedItem = film;

    modalPoster.src = `https://image.tmdb.org/t/p/w500${film.poster_path}`;
    modalTitle.textContent = film.title;
    modalMeta.textContent = `${film.release_date.split("-")[0]} · ⭐ ${film.vote_average}`;
    modalDescription.textContent = film.overview;

    modal.classList.remove("hidden");
  } catch (error) {
    console.error(error);
  }
}

// Cerrar modal
closeModal.addEventListener("click", () => modal.classList.add("hidden"));

// Búsqueda en tiempo real
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  if (!query) return cargarPeliculas();

  try {
    const data = await fetchTMDB(`/search/movie?query=${encodeURIComponent(query)}&language=es-ES&page=1`);
    mostrarPeliculas(data.results);
  } catch (error) {
    console.error(error);
    grid.innerHTML = "<p>Error en búsqueda.</p>";
  }
});

// Inicializar
cargarPeliculas();

// Hacer que la función sea accesible globalmente para onclick
window.abrirDetalle = abrirDetalle;
