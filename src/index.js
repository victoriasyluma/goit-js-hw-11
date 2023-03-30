import notiflix from 'notiflix';
import { getImages } from './getImages';
// Described in documentation
import SimpleLightbox from 'simplelightbox';

// Additional styles import
import 'simplelightbox/dist/simple-lightbox.min.css';

const placeholder = `<p class="gallery-placeholder">Please enter your query...</p>`;

const galleryContainer = document.querySelector('.gallery');

const form = document.getElementById('search-form');
const inputValue = form.querySelector('input[name=searchQuery]');
const submitButton = form.querySelector('button[type="submit"]');
const loadMoreButton = document.querySelector('.load-more');

// Controls the group number
let page = 1;
let search_term = '';
let currentHitsLength = 0;
let totalHits = 0;
let isLoading = false;

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

const getHits = async ({ page } = { page: 1 }) => {
  isLoading = true;

  // get the first batch according to the search criteria
  const { hits, total, totalHits, per_page } = await getImages({
    search_term,
    page,
  }).finally(() => {
    isLoading = false;
  });

  currentHitsLength = currentHitsLength + per_page;

  const maxReached = currentHitsLength >= totalHits;

  if (maxReached) {
    notiflix.Notify.failure(
      `We're sorry, but you've reached the end of search results.`
    );

    return;
  }

  return { hits, total, totalHits, per_page };
};

submitButton.addEventListener('click', async (event) => {
  try {
    event.preventDefault();

    // if the search term didn't change
    if (search_term == inputValue.value) return;

    search_term = inputValue.value;

    // clean state of the app
    galleryContainer.innerHTML = '';
    page = 1;
    currentHitsLength = 0;
    totalHits = 0;

    if (!search_term.trim()) {
      galleryContainer.innerHTML = placeholder;

      return;
    }

    galleryContainer.innerHTML = `<p class="gallery-status">Loading...</p>`;

    // get the first batch according to the search criteria
    const { hits, totalHits: _totalHits } = await getHits();

    totalHits = _totalHits;
    galleryContainer.innerHTML = '';

    if (hits.length === 0) {
      showNotFoundNotification();

      return;
    }

    showFoundHitsNotification({ totalHits });

    drawBatchOfHits({ hits });
  } catch (error) {
    throw error;
  }
});

const loadMoreHits = async () => {
  page = page + 1;

  const { hits } = await getHits({ page });

  drawBatchOfHits({ hits });
};

loadMoreButton?.addEventListener('click', loadMoreHits);

const showNotFoundNotification = () => {
  notiflix.Notify.failure(
    `Sorry, there are no images matching your search query. Please try again.`
  );
};

const showFoundHitsNotification = ({ totalHits }) => {
  notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
};

window.addEventListener('scroll', async () => {
  const { innerHeight, scrollY } = window;
  const { offsetHeight } = document.body;

  const paddingBottom = 500;
  const isBottomReached = innerHeight + scrollY >= offsetHeight - paddingBottom;
  const thereIsMoreHits = currentHitsLength < totalHits;

  if (isLoading || !isBottomReached || !thereIsMoreHits) return;

  await loadMoreHits();
});
