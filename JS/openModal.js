window.modalModule = (function() {
    let modalContainer;
    const API_KEY = "K2TP2JK-3YNMDVJ-G8ZZ0JM-Q2Z7MD3";
    let isInitialized = false;

    // Инициализация модуля
    function init() {
        if (isInitialized) return;
        
        console.log("Initializing modal module...");
        modalContainer = document.querySelector(".modal");
        
        if (!modalContainer) {
            console.error("Modal container not found!");
            return;
        }
        
        setupEventListeners();
        isInitialized = true;
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        document.addEventListener('filmsRendered', () => {
            const filmsContainer = document.querySelector(".films-grid");
            if (filmsContainer) {
                filmsContainer.addEventListener('click', handleFilmCardClick);
                console.log("Modal listeners attached to film cards");
            }
        }, { once: true });
    }

    // Обработчик клика по карточке
    function handleFilmCardClick(e) {
        const filmCard = e.target.closest(".film-card");
        if (filmCard) {
            const filmId = filmCard.getAttribute("data-id");
            if (filmId) {
                openModal(filmId);
            }
        }
    }

    // Загрузка HTML модального окна
    async function loadModalHTML() {
        try {
            const response = await fetch("HTML/modal.html");
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            return doc.querySelector("body");
        } catch (error) {
            console.error("Error loading modal HTML:", error);
            throw error;
        }
    }

    // Загрузка данных фильма
    async function fetchMovieData(id) {
        try {
            const response = await fetch(`https://api.kinopoisk.dev/v1.4/movie/${id}`, {
                headers: {
                    'X-API-KEY': API_KEY,
                    'accept': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error("Error fetching movie data:", error);
            throw error;
        }
    }

    // Заполнение модального окна данными (ПОЛНАЯ ВЕРСИЯ)
    async function populateModalData(film) {
        const elements = {
            heroImage: document.querySelector(".hero-image"),
            filmName: document.querySelector(".film-name"),
            filmDescription: document.querySelector(".film-description"),
            descriptionText: document.querySelector(".description-text"),
            releasedYear: document.querySelector(".released-year"),
            languagesList: document.querySelector(".languages-list"),
            ratingsList: document.querySelector(".ratings-list"),
            genresList: document.querySelector(".genres-list"),
            directorInfo: document.querySelector(".director-info"),
            musicInfo: document.querySelector(".music-info"),
            castList: document.querySelector(".cast-list"),
            reviewsList: document.querySelector(".reviews-list")
        };

        // Постер
        if (elements.heroImage && film.poster?.url) {
            elements.heroImage.src = film.poster.url;
            elements.heroImage.alt = film.name || "Movie Poster";
        }

        // Название и описание
        if (elements.filmName) {
            elements.filmName.textContent = film.name || film.alternativeName || "Название не указано";
        }
        if (elements.filmDescription) {
            elements.filmDescription.textContent = film.shortDescription || film.description || "Описание не указано";
        }
        if (elements.descriptionText) {
            elements.descriptionText.textContent = film.description || "Полное описание не указано";
        }

        // Год выпуска
        if (elements.releasedYear) {
            elements.releasedYear.textContent = film.year || "Не указан";
        }

        // Языки
        if (elements.languagesList && film.languages?.length > 0) {
            elements.languagesList.innerHTML = film.languages
                .map(lang => `<button>${lang.name || lang}</button>`)
                .join("");
        }

        // Рейтинги
        if (elements.ratingsList) {
            elements.ratingsList.innerHTML = "";
            if (film.rating?.imdb) {
                elements.ratingsList.innerHTML += `
                    <div class="rating-item">
                        <span>IMDb</span>
                        <span>${film.rating.imdb}</span>
                    </div>`;
            }
            if (film.rating?.kp) {
                elements.ratingsList.innerHTML += `
                    <div class="rating-item">
                        <span>Кинопоиск</span>
                        <span>${film.rating.kp}</span>
                    </div>`;
            }
        }

        // Жанры
        if (elements.genresList && film.genres?.length > 0) {
            elements.genresList.innerHTML = film.genres
                .map(genre => `<button>${genre.name}</button>`)
                .join("");
        }

        // Режиссер
        if (elements.directorInfo && film.persons) {
            const director = film.persons.find(p => 
                p.profession === "режиссеры" || p.enProfession === "director"
            );
            if (director) {
                elements.directorInfo.innerHTML = `
                    ${director.photo ? `<img src="${director.photo}" alt="${director.name}">` : ''}
                    <div class="info">
                        <span class="name">${director.name}</span>
                        ${director.enName ? `<span class="country">${director.enName}</span>` : ''}
                    </div>`;
            }
        }

        // Композитор
        if (elements.musicInfo && film.persons) {
            const composer = film.persons.find(p => 
                p.profession === "композиторы" || p.enProfession === "composer"
            );
            if (composer) {
                elements.musicInfo.innerHTML = `
                    ${composer.photo ? `<img src="${composer.photo}" alt="${composer.name}">` : ''}
                    <div class="info">
                        <span class="name">${composer.name}</span>
                        ${composer.enName ? `<span class="country">${composer.enName}</span>` : ''}
                    </div>`;
            }
        }

        // Актеры (первые 10)
        if (elements.castList && film.persons) {
            elements.castList.innerHTML = film.persons
                .filter(p => ["актеры", "actor"].includes(p.profession || p.enProfession))
                .slice(0, 10)
                .map(actor => `
                    <img src="${actor.photo || ''}" 
                         alt="${actor.name}" 
                         title="${actor.name}"
                         style="width:48px;height:48px;border-radius:50%;object-fit:cover;">`)
                .join("");
        }

        // Отзывы (заглушка)
        if (elements.reviewsList) {
            elements.reviewsList.innerHTML = `
                <div style="color:#888;">
                    Отзывы пока не реализованы
                </div>`;
        }
    }

    // Открытие модального окна
    async function openModal(filmId) {
        try {
            if (!modalContainer) {
                console.error("Modal container not initialized");
                return;
            }

            // Загрузка контента
            const modalBody = await loadModalHTML();
            modalContainer.innerHTML = "";
            modalContainer.appendChild(modalBody);

            // Загрузка данных
            const filmData = await fetchMovieData(filmId);
            await populateModalData(filmData);

            // Показ модального окна
            modalContainer.style.display = "block";
            setupCloseHandlers();
        } catch (error) {
            console.error("Error opening modal:", error);
            showModalError();
        }
    }

    // Настройка обработчиков закрытия
    function setupCloseHandlers() {
        // Клик по фону
        modalContainer.addEventListener("click", function(e) {
            if (e.target === modalContainer) {
                closeModal();
            }
        });

        // Кнопка закрытия
        const closeButton = modalContainer.querySelector(".close-button");
        if (closeButton) {
            closeButton.addEventListener("click", closeModal);
        }

        // Закрытие по ESC
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    // Закрытие модального окна
    function closeModal() {
        if (modalContainer) {
            modalContainer.style.display = "none";
        }
    }

    // Показать ошибку
    function showModalError() {
        if (modalContainer) {
            modalContainer.innerHTML = `
                <div class="modal-error">
                    <h3>Ошибка загрузки данных</h3>
                    <p>Не удалось загрузить информацию о фильме</p>
                    <button onclick="window.modalModule.closeModal()">Закрыть</button>
                </div>`;
            modalContainer.style.display = "block";
        }
    }

    // Автоинициализация для обычных страниц
    if (!window.isSPA && document.querySelector(".films-grid")) {
        document.addEventListener('DOMContentLoaded', init);
    }

    return {
        init: init,
        open: openModal,
        close: closeModal
    };
})();