const content = [
  {
    id: 1,
    type: "movies",
    title: "Ciudad Nocturna",
    genre: "Acción",
    year: 2024,
    rating: "8.1",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
    description: "Un detective persigue una red criminal en una ciudad llena de secretos."
  },
  {
    id: 2,
    type: "movies",
    title: "El Último Planeta",
    genre: "Sci-Fi",
    year: 2025,
    rating: "8.7",
    poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80",
    description: "La humanidad busca un nuevo hogar en los confines del universo."
  },
  {
    id: 3,
    type: "series",
    title: "Familia en Caos",
    genre: "Comedia",
    year: 2023,
    rating: "7.6",
    poster: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
    description: "Una familia intenta sobrevivir a situaciones absurdas y divertidas."
  },
  {
    id: 4,
    type: "series",
    title: "Sombras del Poder",
    genre: "Drama",
    year: 2024,
    rating: "8.4",
    poster: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=600&q=80",
    description: "Intrigas políticas, secretos familiares y decisiones imposibles."
  },
  {
    id: 5,
    type: "movies",
    title: "Planeta Azul",
    genre: "Documental",
    year: 2022,
    rating: "9.0",
    poster: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    description: "Un viaje visual por los océanos más impresionantes del mundo."
  }
];

const channels = [
  {
    name: "Big Buck Bunny TV",
    category: "Animación",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  {
    name: "Sintel Live Demo",
    category: "Cine",
    url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
  }
];

let currentSection = "movies";
let selectedItem = null;
let hlsInstance = null;

const grid = document.getElementById("contentGrid");
const tvSection = document.getElementById("tvSection");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const navButtons = document.querySelectorAll(".nav-btn");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalPoster = document.getElementById("modalPoster");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalDescription = document.getElementById("modalDescription");
const modalFavorite = document.getElementById("modalFavorite");

const livePlayer = document.getElementById("livePlayer");
const channelTitle = document.getElementById("channelTitle");
const channelList = document.getElementById("channelList");

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  const favorites = getFavorites();

  if (favorites.includes(id)) {
    saveFavorites(favorites.filter(itemId => itemId !== id));
  } else {
    saveFavorites([...favorites, id]);
  }

  renderContent();
  updateFavoriteButton();
}

function getFilteredContent() {
  const search = searchInput.value.toLowerCase();
  const genre = genreFilter.value;

  let items = content;

  if (currentSection === "favorites") {
    const favorites = getFavorites();
    items = items.filter(item => favorites.includes(item.id));
  } else {
    items = items.filter(item => item.type === currentSection);
  }

  return items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search);
    const matchesGenre = genre === "all" || item.genre === genre;
    return matchesSearch && matchesGenre;
  });
}

function renderContent() {
  if (currentSection === "tv") {
    grid.classList.add("hidden");
    tvSection.classList.remove("hidden");
    renderChannels();
    return;
  }

  grid.classList.remove("hidden");
  tvSection.classList.add("hidden");

  const items = getFilteredContent();

  if (items.length === 0) {
    grid.innerHTML = `<p>No se encontraron resultados.</p>`;
    return;
  }

  grid.innerHTML = items.map(item => `
    <article class="card" onclick="openDetails(${item.id})">
      <img src="${item.poster}" alt="${item.title}">
      <div class="card-body">
        <h3>${item.title}</h3>
        <p>${item.genre} · ${item.year} · ⭐ ${item.rating}</p>
        <p>${isFavorite(item.id) ? "❤️ En favoritos" : "♡ Agregar favorito"}</p>
      </div>
    </article>
  `).join("");
}

function openDetails(id) {
  selectedItem = content.find(item => item.id === id);

  modalPoster.src = selectedItem.poster;
  modalPoster.alt = selectedItem.title;
  modalTitle.textContent = selectedItem.title;
  modalMeta.textContent = `${selectedItem.genre} · ${selectedItem.year} · ⭐ ${selectedItem.rating}`;
  modalDescription.textContent = selectedItem.description;

  updateFavoriteButton();
  modal.classList.remove("hidden");
}

function updateFavoriteButton() {
  if (!selectedItem) return;

  modalFavorite.textContent = isFavorite(selectedItem.id)
    ? "Quitar de favoritos"
    : "Agregar a favoritos";
}

function renderChannels() {
  channelList.innerHTML = channels.map((channel, index) => `
    <div class="channel-card" onclick="playChannel(${index})">
      <h3>${channel.name}</h3>
      <p>${channel.category}</p>
    </div>
  `).join("");
}

function playChannel(index) {
  const channel = channels[index];
  channelTitle.textContent = channel.name;

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if (Hls.isSupported()) {
    hlsInstance = new Hls();
    hlsInstance.loadSource(channel.url);
    hlsInstance.attachMedia(livePlayer);
  } else if (livePlayer.canPlayType("application/vnd.apple.mpegurl")) {
    livePlayer.src = channel.url;
  } else {
    alert("Tu navegador no soporta reproducción HLS.");
  }
}

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    navButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    currentSection = button.dataset.section;
    renderContent();
  });
});

searchInput.addEventListener("input", renderContent);
genreFilter.addEventListener("change", renderContent);

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modalFavorite.addEventListener("click", () => {
  if (selectedItem) {
    toggleFavorite(selectedItem.id);
  }
});

window.openDetails = openDetails;
window.playChannel = playChannel;

renderContent();