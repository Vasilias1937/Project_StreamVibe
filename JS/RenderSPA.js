(function() {
    // Глобальные элементы
    const thisPageMain = document.querySelector(".main-page");
    const navBar = document.querySelector(".header-navigation");
    const homeButton = document.querySelector(".nav-home");
    const movieButton = document.querySelector(".nav-Movies");
    const supportButton = document.querySelector(".nav-support");
    const subButton = document.querySelector(".nav-sub");
    
    window.isSPA = true;

    // Загрузка скриптов с гарантией однократной загрузки
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    // Инициализация приложения
    async function initApp() {
        try {
            await Promise.all([
                loadScript("JS/displayFilms.js"),
                loadScript("JS/openModal.js")
            ]);
            console.log("All scripts loaded successfully");
        } catch (error) {
            console.error("Script loading failed:", error);
        }
    }

    // Переключение CSS стилей (ваша функция без изменений)
    const toggleCSS = function(pageName) {
        const dynamicCSS = document.querySelectorAll('link[data-dynamic="true"]');
        dynamicCSS.forEach(link => link.remove());
        
        if (pageName === 'support') {
            const supportCSS = document.createElement('link');
            supportCSS.rel = 'stylesheet';
            supportCSS.href = 'CSS/support.css';
            supportCSS.setAttribute('data-dynamic', 'true');
            document.head.appendChild(supportCSS);
        } else if (pageName === 'subscriptions') {
            const subscriptionCSS = document.createElement('link');
            subscriptionCSS.rel = 'stylesheet';
            subscriptionCSS.href = 'CSS/subscription.css';
            subscriptionCSS.setAttribute('data-dynamic', 'true');
            document.head.appendChild(subscriptionCSS);
        } else if (pageName === 'movies') {
            const moviesCSS = document.createElement('link');
            moviesCSS.rel = 'stylesheet';
            moviesCSS.href = 'CSS/movies.css';
            moviesCSS.setAttribute('data-dynamic', 'true');
            document.head.appendChild(moviesCSS);
        }
    }

    // Загрузка и парсинг страниц (ваша функция без изменений)
    const takeAndParsePage = async function(path) {
        try {
            const response = await fetch(path);
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const mainElement = doc.querySelector(".main-page");
            
            if (!mainElement) {
                throw new Error(`Элемент с классом "main-page" не найден в файле ${path}`);
            }

            const mainPart = mainElement.innerHTML;
            return mainPart;
        } catch (error) {
            console.log("Ошибка получения страницы:", error);
            throw error;
        }
    }

    // Модифицированная функция рендеринга
    const renderNewPage = async function(path) {
        try {
            const main = await takeAndParsePage(path);
            thisPageMain.innerHTML = main;
            
            if (path === "HTML/movies.html") {
                thisPageMain.classList.add("movies-page");
                
                // Ждем инициализации модуля фильмов
                if (window.moviesModule) {
                    await window.moviesModule.init();
                    
                    // Добавляем задержку для гарантии рендера карточек
                    setTimeout(() => {
                        if (window.modalModule) {
                            window.modalModule.init();
                        }
                    }, 300);
                }
            } else {
                thisPageMain.classList.remove("movies-page");
            }
        } catch (error) {
            console.error("Render error:", error);
        }
    }

    // Обновление активной кнопки
    function updateActiveButton(activeButton) {
        document.querySelectorAll(".active").forEach(el => el.classList.remove("active"));
        activeButton.classList.add("active");
    }

    // Обработчики специальных кнопок (ваш код с небольшими изменениями)
    function setupSpecialButtons() {
        document.addEventListener("click", (event) => {
            if (event.target.classList.contains("start-watch-button") || 
                event.target.classList.contains("free-trial") || 
                event.target.classList.contains("choose")) {
                updateActiveButton(subButton);
                toggleCSS('subscriptions'); 
                renderNewPage("HTML/subscription.html");
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
            
            if (event.target.classList.contains("help-questions-button")) {
                updateActiveButton(supportButton);
                toggleCSS('support'); 
                renderNewPage("HTML/support.html");
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }

    // Настройка навигации (ваш код с небольшими изменениями)
    function setupNavigation() {
        navBar.addEventListener('click', (event) => {
            if (event.target === homeButton) {
                updateActiveButton(homeButton);
                toggleCSS('home');
                renderNewPage("index.html");
            }
            else if (event.target === movieButton) {
                updateActiveButton(movieButton);
                toggleCSS('movies');
                renderNewPage("HTML/movies.html");
            }
            else if (event.target === supportButton) {
                updateActiveButton(supportButton);
                toggleCSS('support');
                renderNewPage("HTML/support.html");
            }
            else if (event.target === subButton) {
                updateActiveButton(subButton);
                toggleCSS('subscriptions');
                renderNewPage("HTML/subscription.html");
            }
        });
    }

    // Инициализация приложения
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        setupNavigation();
        setupSpecialButtons();
    });

    // Экспорт
    window.spaApp = {
        render: renderNewPage,
        toggleCSS: toggleCSS
    };
})();