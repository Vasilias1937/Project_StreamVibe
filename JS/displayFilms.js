window.moviesModule = (function() {
    const xAPIKey = "K2TP2JK-3YNMDVJ-G8ZZ0JM-Q2Z7MD3";
    let filmsCardsContainer;
    let currentPage = 1;
    const limit = 15;

    // Основная функция инициализации
    function init() {
        console.log("Initializing movies module...");
        filmsCardsContainer = document.querySelector(".films-grid");
        
        if (!filmsCardsContainer) {
            console.error("Films container (.films-grid) not found!");
            return;
        }
        
        createFilmsCards(currentPage);
    }

    // Загрузка фильмов с API
    async function takeFilms(page = 1) {
        try {
            const response = await fetch(`https://api.kinopoisk.dev/v1.4/movie?page=${page}&limit=${limit}&rating.kp=7.5-10`, {
                headers: {
                    'X-API-KEY': xAPIKey,
                    'accept': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error("Error fetching films:", error);
            throw error;
        }
    }

    // Создание карточек фильмов
    async function createFilmsCards(page = 1) {
        try {
            const data = await takeFilms(page);
            if (!data || !data.docs) {
                throw new Error("Invalid data format from API");
            }

            renderFilmsList(data.docs);
            renderPagination(data.page, data.pages);
            
            // Генерируем событие после рендера карточек
            document.dispatchEvent(new CustomEvent('filmsRendered', {
                detail: { count: data.docs.length }
            }));
        } catch (error) {
            console.error("Error creating film cards:", error);
            filmsCardsContainer.innerHTML = `<p class="error">Ошибка загрузки фильмов</p>`;
        }
    }

    // Рендер списка фильмов
    function renderFilmsList(films) {
        filmsCardsContainer.innerHTML = "";
        
        films.forEach(film => {
            const card = document.createElement("div");
            card.setAttribute("data-id", film.id);
            card.classList.add("film-card");
            
            const filmPoster = film.poster?.url || "";
            card.innerHTML = `
                <h4>${film.name || 'Без названия'}</h4>
                <p>${film.year || 'Год не указан'}</p>
                <p>${film.type || 'Тип не указан'}</p>
            `;
            
            if (filmPoster) {
                card.style.background = `
                    linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
                    url('${filmPoster}')`;
                card.style.backgroundSize = "cover";
                card.style.backgroundPosition = "center";
            }
            
            filmsCardsContainer.appendChild(card);
        });
    }

    // Рендер пагинации
    function renderPagination(current, total) {
        let pagination = document.querySelector(".pagination");
        if (!pagination) {
            pagination = document.createElement("div");
            pagination.className = "pagination";
            filmsCardsContainer.parentElement.appendChild(pagination);
        }
        
        pagination.innerHTML = `
            <button ${current === 1 ? 'disabled' : ''}>Назад</button>
            <span style="margin: 0 10px">Страница ${current} из ${total}</span>
            <button ${current === total ? 'disabled' : ''}>Вперёд</button>
        `;
        
        // Обработчики для кнопок
        pagination.querySelector("button:first-child").onclick = () => {
            if (current > 1) {
                currentPage = current - 1;
                createFilmsCards(currentPage);
            }
        };
        
        pagination.querySelector("button:last-child").onclick = () => {
            if (current < total) {
                currentPage = current + 1;
                createFilmsCards(currentPage);
            }
        };
    }

    // Автоинициализация только если не в SPA
    if (!window.isSPA) {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.querySelector(".films-grid")) {
                init();
            }
        });
    }

    return {
        init: init
    };
})();