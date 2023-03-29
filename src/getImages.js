import axios from 'axios';

export const getImages = async ({ search_term, page = 1 }) => {
  const {
    data: { hits, total, totalHits },
  } = await axios.get('https://pixabay.com/api/', {
    params: {
      key: '34819237-929003d04d64445866cd0fd69',
      q: search_term,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page,
    },
  });

  return { hits, total, totalHits };
};
