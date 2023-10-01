import {cat_env, dog_env } from './env.js';

// Deklarasi variable savedPetList dengan getItem dari localStorage
const savedPetList = localStorage.getItem('petList');

// JSON parse savedPetList karena local storage menyimpan value string
const petList = JSON.parse(savedPetList) || [];

// Buat instance untuk suatu search param (untuk pagination)
const searchParams = new URLSearchParams(window.location.search);

// Ambil nilai dari suatu search param key bernama "page", default nilai = 1.
const currentPage = searchParams.get('page') || '1';

// API Call
// Buat suatu fungsi bernama getBreedsImage untuk melakukan pemanggilan API
const getBreedsImage = async (sortBy) => {
  try {
    const response = await fetch(`${dog_env.endpoint}v1/images/search?include_categories=true&include_breeds=true&has_breeds=true&page=${currentPage}&limit=10&order=${sortBy}`, {
      method: 'GET',
      headers: {
        'x-api-key': dog_env.API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from the API');
    }

    const data = await response.json();

    // Jika perlu mengurutkan data, lakukan pengurutan di sini
    if (sortBy === 'desc') {
      data.reverse();
    }

    return data;
  } catch (error) {
    console.error('Error fetching pet data:', error);
    return [];
  }
};

// Buat fungsi fetchImage untuk melakukan pemanggilan fungsi getBreedsImage sesuai sortBy yang dikirim
const fetchImage = (sortBy) => {
  getBreedsImage(sortBy)
    .then((data) => {
      localStorage.setItem('petList', JSON.stringify(data));
      renderComponent(data);
    })
    .catch((error) => {
      console.error('Error fetching pet data:', error);
    });
};

// Definisikan selector untuk dropdown menu, search form, dan search input element
const dropdownElement = document.querySelector('.dropdownMenu');
const formElement = document.querySelector('.searchForm');
const searchInputElement = document.querySelector('.searchInput');

// pagination
// Definisikan selector untuk pagination
const prevPage = document.querySelector('.prevPagination');
const pageOne = document.querySelector('.pageOne');
const pageTwo = document.querySelector('.pageTwo');
const pageThree = document.querySelector('.pageThree');
const nextPage = document.querySelector('.nextPagination');

// Buat fungsi bernama petCardComponent untuk merender nilai dari hasil fetch data di endpoint
const PetCardComponent = (pet) => {
  const breed = pet.breeds && pet.breeds.length > 0 ? pet.breeds[0].name : 'Unknown Breed';
  const description = pet.description || 'No description available';
  const lifeSpan = pet.life_span || 'Unknown';
  const temperament = pet.temperament || 'Unknown';
  const weight = pet.weight && pet.weight.metric ? `Weight: ${pet.weight.metric} kg` : 'Unknown Weight';
  const height = pet.height && pet.height.metric ? `Height: ${pet.height.metric} cm` : 'Unknown Height';

  return `<div class="card my-3 mx-2" style="width: 20%">
    <img height="300" style="object-fit: cover" class="card-img-top" src=${pet.url} alt="Card image cap" />
    <div class="card-body">
      <h5 class="card-title d-inline">${breed}</h5>
      <p class="card-text">
        ${description}
      </p>
      <p>${lifeSpan}</p>
      <span class="badge badge-pill badge-info">${temperament}</span>
      <span class="badge badge-pill badge-warning">${weight}</span>
      <span class="badge badge-pill badge-danger">${height}</span>
    </div>
  </div>`;
};

const renderComponent = (filteredPet) => {
  document.querySelector('.petInfo').innerHTML = filteredPet
    .map((pet) => PetCardComponent(pet))
    .join('');
};

// Buat fungsi sortPetById sesuai dengan key yang dipilih
const sortPetById = (key) => {
  if (key === 'ascending') {
    fetchImage('asc'); // Mengurutkan data secara ascending (A-Z)
  } else if (key === 'descending') {
    fetchImage('desc'); // Mengurutkan data secara descending (Z-A)
  }
};

// Fungsi searchPetByKey digunakan untuk melakukan search tanpa memanggil API, tetapi langsung
// dari nilai petList
const searchPetByKey = (key) => {
  return petList.filter((pet) => pet.breeds[0].name.toLowerCase().includes(key.toLowerCase()));
};

dropdownElement.addEventListener('change', (event) => {
  event.preventDefault();
  const value = event.target.value;
  sortPetById(value);
});

formElement.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = searchInputElement.value;
  const filteredPet = searchPetByKey(value);
  renderComponent(filteredPet.length > 0 ? filteredPet : petList);
});

// Fungsi redirectTo untuk pagination
const redirectTo = (page) => {
  searchParams.set('page', page);
  window.location.search = searchParams.toString();
};

prevPage.addEventListener('click', (event) => {
  event.preventDefault();
  if (currentPage > 1) {
    redirectTo(Number(currentPage) - 1);
  } else {
    redirectTo(1);
  }
});

pageOne.addEventListener('click', (event) => {
  event.preventDefault();
  redirectTo(1);
});

pageTwo.addEventListener('click', (event) => {
  event.preventDefault();
  redirectTo(2);
});

pageThree.addEventListener('click', (event) => {
  event.preventDefault();
  redirectTo(3);
});

nextPage.addEventListener('click', (event) => {
  event.preventDefault();
  redirectTo(Number(currentPage) + 1);
});

// Initial fetch on page load
fetchImage(); // Mengurutkan data secara ascending pada saat halaman dimuat