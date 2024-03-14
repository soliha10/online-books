// GLOBAL VARIABLES
const genres = [];
const bookmarkBooks = JSON.parse(window.localStorage.getItem("bookmarkbook")) || [];

const elBookmarkedList = document.getElementById("watchlist");

const elSearchForm = document.querySelector(".js-search-book");
const elSearchInput = elSearchForm.querySelector(".js-search-book-title");
const elSelectGenres = elSearchForm.querySelector(".js-book-genres");
const elSelectSortBook = elSearchForm.querySelector(".js-book-sort");
const elBookedBooksCountBadge = document.querySelector(".js-booked-books-count");

// check bookmark array func
function checkBookmarkArrayCount() {
  if (!bookmarkBooks.length) {
    elBookedBooksCountBadge.classList.add("d-none");
  } else {
    elBookedBooksCountBadge.classList.remove("d-none");
    elBookedBooksCountBadge.textContent = bookmarkBooks.length;
  }
}

// books list elements
const elBookList = document.querySelector(".js-book-list");
const elBookAlert = document.querySelector(".js-not-found-book");
const elBookItemTemplate = document.querySelector(".js-book-item-template").content;

function renderGenresOptions(arr, node) {
  const genresFragment = document.createDocumentFragment();
  for (const genre of arr) {
    const newOption = document.createElement("option");
    newOption.value = genre;
    newOption.textContent = genre;
    genresFragment.appendChild(newOption);
  }
  node.appendChild(genresFragment);
}

// GETTING UNIQUE CATEGORIES AND PUSHING GENRES ARRAY
function getUniqueGenres() {
  for (const book of books) {
    if (!genres.includes(book.language)) {
      genres.push(book.language);
    }
  }
  genres.sort();
  renderGenresOptions(genres, elSelectGenres);
}

// RENDER ALL BOOKS DATA FUNC
function renderBooks(booksList, node, regex = "") {
  const booksFragment = document.createDocumentFragment();
  node.previousElementSibling.style.display = "none";
  node.innerHTML = "";

  booksList.forEach(book => {
    const bookItemClone = elBookItemTemplate.cloneNode(true);

    bookItemClone.querySelector(".book-list__poster").src = book.imageLink;
    bookItemClone.querySelector(".book-list__poster").alt = book.title;
    bookItemClone.querySelector(".book_list__wiki-link").href = book.link;
    // HIGHLIGHT SEARCH TITLE
    if (regex.source != "(?:)" && regex) {
      bookItemClone.querySelector(".book-list__heading").innerHTML = book.title.replace(regex, match => `<mark class="d-inline-block p-0 bg-warning text-light rounded-2">${match}</mark>`);
    } else {
      bookItemClone.querySelector(".book-list__heading").textContent = book.title;
    }

    bookItemClone.querySelector(".book-list__author").textContent = book.author;
    bookItemClone.querySelector(".book-list__year").textContent = book.year;
    bookItemClone.querySelector(".book-list__page").textContent = book.pages;
    bookItemClone.querySelector(".book-list__language").textContent = book.language;
    // bookItemClone.querySelector(".book-list__wiki-link").href = book.link;

    if (bookmarkBooks.some(item => item.title == book.title)) {
      bookItemClone.querySelector(".book-list__bookmark-btn").textContent = "Bookmarked";
      bookItemClone.querySelector(".book-list__bookmark-btn").classList.add("bookmarked-btn");
    } else {
      bookItemClone.querySelector(".book-list__bookmark-btn").textContent = "Add readlist";
      bookItemClone.querySelector(".book-list__bookmark-btn").classList.remove("bookmarked-btn");
    }
    bookItemClone.querySelector(".book-list__bookmark-btn").dataset.bookTitle = book.title;

    booksFragment.appendChild(bookItemClone);
  });

  node.appendChild(booksFragment);
}

// RENDER BOOKMARK ARRAY DATA 
function bookmarkedBooksListRenderFn(arr, node) {
  node.innerHTML = "";

  arr.forEach(booked => {
    const bookItemClone = elBookItemTemplate.cloneNode(true);

    bookItemClone.querySelector(".book-list__poster").src = booked.imageLink;
    bookItemClone.querySelector(".book-list__poster").alt = booked.title;
    bookItemClone.querySelector(".book-list__heading").textContent = booked.title;
    bookItemClone.querySelector(".book-list__author").textContent = booked.author;
    bookItemClone.querySelector(".book-list__year").textContent = booked.year;
    bookItemClone.querySelector(".book-list__page").textContent = booked.pages;
    bookItemClone.querySelector(".book-list__language").textContent = booked.language;
    // bookItemClone.querySelector(".book-list__wiki-link").href = booked.link;
    // bookItemClone.querySelector(".book-list__delete-btn").dataset.bookTitle = booked.title;

    node.appendChild(bookItemClone);
  });
}


// DELETE BOOKS FROM BOOKMARK ARRAY
function deleteBookmarkedBookFn(title, target = "") {
  target.textContent = "Add watchlist";
  target.classList.remove("bookmarked-btn");

  const index = bookmarkBooks.findIndex(item => item.title === title);
  bookmarkBooks.splice(index, 1);

  window.localStorage.setItem("bookmarkbook", JSON.stringify(bookmarkBooks));
  checkBookmarkArrayCount();
}

// more info tugmasini ishlatish 
elBookList.addEventListener("click", evt => {
  if (evt.target.matches(".book-list__bookmark-btn")) {
    const bookTitle = evt.target.dataset.bookTitle;
    const findBook = books.find(book => book.title === bookTitle);

    const index = bookmarkBooks.findIndex(item => item.title === bookTitle);

    if (index === -1) {
      bookmarkBooks.push(findBook);
      bookmarkedBooksListRenderFn(bookmarkBooks, elBookmarkedList);
      evt.target.textContent = "Bookmarked";
      evt.target.classList.add("bookmarked-btn");
      window.localStorage.setItem("bookmarkbook", JSON.stringify(bookmarkBooks));
      checkBookmarkArrayCount();
    } else {
      deleteBookmarkedBookFn(bookTitle, evt.target);
      bookmarkedBooksListRenderFn(bookmarkBooks, elBookmarkedList);
    }
  }
});
document.addEventListener("DOMContentLoaded", function() {
  const bookmarksButton = document.querySelector('[data-target="#offcanvasRight"]');
  const offcanvasRight = document.getElementById('offcanvasRight');

  bookmarksButton.addEventListener('click', function() {
      const offcanvasBS = new bootstrap.Offcanvas(offcanvasRight);
      offcanvasBS.toggle();
  });
});



// FILTER AND SORT, SEARCH BOOK DATASET
function resultBooksList(searchValue) {
  const searchBooks = books.filter(book => {
    const moreValues = book.title.match(searchValue) && (elSelectGenres.value == "all" || book.language === elSelectGenres.value);
   
    return moreValues;
  });
  return searchBooks;
}

// SORT BOOKS
function sortBooks(arr, sortType) {
  if (sortType === "a-z") {
    arr.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortType === "z-a") {
    arr.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortType === "oldest-latest") {
    arr.sort((a, b) => a.year - b.year);
  } else if (sortType === "latest-oldest") {
    arr.sort((a, b) => b.year - a.year);
  } else if (sortType === "less-more") {
    arr.sort((a, b) => a.pages - b.pages);
  } else if (sortType === "more-less") {
    arr.sort((a, b) => b.pages - a.pages);
  }
}


// HANDLE SUBMIT FUNC
function handleSubmitFn(evt) {
  evt.preventDefault();

  const searchInputValue = elSearchInput.value.trim();
  const regexSearchTitle = new RegExp(searchInputValue, "gi");
  const searchBooks = resultBooksList(regexSearchTitle);

  if (searchBooks.length > 0) {
    sortBooks(searchBooks, elSelectSortBook.value);
    renderBooks(searchBooks, elBookList, regexSearchTitle);
    elBookAlert.classList.add("d-none");
  } else {
    elBookAlert.classList.remove("d-none");
    elBookAlert.textContent = "This book is not found, try again!";
  }
}

// SUBMIT FORM
elSearchForm.addEventListener("submit", handleSubmitFn);

renderBooks(books, elBookList);
getUniqueGenres();
window.addEventListener("DOMContentLoaded", () => {
  bookmarkedBooksListRenderFn(bookmarkBooks, elBookmarkedList);
});
checkBookmarkArrayCount();


