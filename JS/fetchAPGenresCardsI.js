const baseEndpoint = "https://api.kinopoisk.dev/v1.4/movie";
const imageEndpoint = "https://api.kinopoisk.dev/v1.4/image";
const xAPIKey = "K2TP2JK-3YNMDVJ-G8ZZ0JM-Q2Z7MD3";
let genresArray = [];
let postersByGenresArray = [];

const genres = async () => {
  const response = await fetch('https://api.kinopoisk.dev/v1/movie/possible-values-by-field?field=genres.name', {
    headers: {
      'X-API-KEY': xAPIKey,
      'accept': 'application/json'
    }
  });
  const data = await response.json();
  console.log('Ответ API genres:', data);
  console.log('Тип данных:', typeof data);
  console.log('Является ли массивом:', Array.isArray(data));
  return data;
};

const getMoviesByGenre = async (genre) => {
  console.log(`Запрос по жанру: ${genre}`);
  const response = await fetch(`https://api.kinopoisk.dev/v1.4/movie?page=1&limit=4&genres.name=${genre}`, {
    headers: {
      'X-API-KEY': xAPIKey,
      'accept': 'application/json'
    }
  });
  const movies = await response.json();
  console.log(`Количество фильмов для жанra ${genre}:`, movies);
  return movies;
}

const getPostersArray = async (genres) => {
  console.log('Обработка genresArray:', genres);
  const filmsArray = await Promise.all(
    genres.map( async (element) => await getMoviesByGenre(element.name))
  );
  let posterURLsArray = [];
  filmsArray.forEach((filmsByGenres) => {
      let filmsList = filmsByGenres.docs;
      filmsList.forEach((elem) => {
        if (!elem.poster) {
          return; 
        }
        
        let posterUrl = null;
        if (elem.poster.url) {
          posterUrl = elem.poster.url;
        } else if (elem.poster.preview) {
          posterUrl = elem.poster.preview;
        } else {
          return;
        }
        
        let poster = new Map();
        poster.set(elem.type, posterUrl);
        posterURLsArray.push(poster);
      })
    })

  return posterURLsArray;
};

genres().then(data => {
  console.log('Полученные данные:', data);
  
  if (Array.isArray(data)) {
    data.forEach(element => {
      genresArray.push(element);
    });
  } else if (data && data.genres) {
    data.genres.forEach(element => {
      genresArray.push(element);
    });
  } else if (data && data.docs) {
    data.docs.forEach(element => {
      genresArray.push(element);
    });
  } else {
    console.error('Неожиданная структура данных:', data);
    return;
  }

  console.log('Обработанный genresArray:', genresArray);
  return getPostersArray(genresArray);
}).then(result => {
  console.log('Результат getPostersArray:', result);
  
}).catch(error => {
  console.error('Ошибка:', error);
});

