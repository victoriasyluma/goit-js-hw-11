import notiflix from 'notiflix';
import { getImages } from './getImages';
// Described in documentation
import SimpleLightbox from 'simplelightbox';

// Additional styles import
import 'simplelightbox/dist/simple-lightbox.min.css';

const galleryContainer = document.querySelector('.gallery');

const form = document.getElementById('search-form');
const inputValue = form.querySelector('input[name=searchQuery]');
const submitButton = form.querySelector('button[type="submit"]');
const loadButton = document.querySelector('.load-more');

// Controls the group number
let page = 1;
let search_term = '';

const galleryLightbox = new SimpleLightbox('.gallery a');

const drawBatchOfHits = ({ hits }) => {
  const html = hits
    .map((hit) => {
      const {
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = hit;

      return /*html*/ `
        <a class="photo-card" href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <p class="info-item">
              <b>Likes</b> ${likes}
            </p>
            
            <p class="info-item">
              <b>Views</b> ${views}
            </p>

            <p class="info-item">
              <b>Comments</b> ${comments}
            </p>

            <p class="info-item">
              <b>Downloads</b> ${downloads}
            </p>
          </div>
        </a>
      `;
    })
    .join('');

  galleryContainer.innerHTML = galleryContainer.innerHTML + html;
  galleryLightbox.refresh();
};

submitButton.addEventListener('click', async (event) => {
  try {
    event.preventDefault();

    search_term = inputValue.value;
    galleryContainer.innerHTML = '';
    page = 1;

    if (!search_term.trim()) {
      // show validation message

      return;
    }

    const { hits, total, totalHits } = await getImages({
      search_term,
    });

    if (hits.length === 0) {
      showNotFoundNotification();

      return;
    }

    drawBatchOfHits({ hits });
  } catch (error) {
    throw error;
  }
});

loadButton.addEventListener('click', async (event) => {
  page = page + 1;

  const { hits, total, totalHits } = await getImages({
    search_term,
    page,
  });

  drawBatchOfHits({ hits });
});

const showNotFoundNotification = () => {
  notiflix.Notify.failure(
    `Sorry, there are no images matching your search query. Please try again.`
  );
};

// const { height: cardHeight } = document
//   .querySelector('.gallery')
//   .getBoundingClientRect();

// window.scrollBy({
//   top: cardHeight * 2,
//   behavior: 'smooth',
// });
