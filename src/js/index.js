/*
// endpoints you should use with getData() 

- allCategories
Search
- mealName
- mealFirstLetter
- mealId

Filter
- mainIngredient
- category
- area

List
- listCategories
- listArea
- listIngredients
*/

function getEndPoint(endPoint) {
  const baseURL = "https://www.themealdb.com/api/json/v1/1";

  const apiEndPoints = {
    allCategories: "/categories.php",
    search: {
      mealName: "/search.php?s=",
      mealFirstLetter: "search.php?f=",
      mealId: "/lookup.php?i=",
    },
    filter: {
      mainIngredient: "/filter.php?i=",
      category: "/filter.php?c=",
      area: "/filter.php?a=",
    },
    list: {
      listCategories: "/list.php?c=list",
      listArea: "/list.php?a=list",
      listIngredients: "/list.php?i=list",
    },
  };
  if (endPoint == "allCategories") {
    return `${baseURL}${apiEndPoints.allCategories}`;
  } else {
    for (const key in apiEndPoints) {
      if (apiEndPoints.hasOwnProperty(key)) {
        const element = apiEndPoints[key];
        if (typeof element === "object") {
          for (const key in element) {
            if (endPoint === key) {
              const url = element[key];
              return `${baseURL}${url}`;
            }
          }
        }
      }
    }
  }
}

async function getData(endPoint, query = "") {
  const url = getEndPoint(endPoint);
  console.log(url);

  const response = await fetch(`${url}${query ? query : ""}`);
  const data = await response.json();
  return data;
}

// will work on that later
// function getAreaFlag(area) {
//   console.log(nationalityToCountry(area));
//   // const country = countryCodes.filter((code) => {
//   //   console.log(code);
//   // });
//   //   const response = await fetch(`https://restcountries.com/v3.1/name/{name}
//   // `);
//   //   const data = await response.json();
//   //   return data;
// }
// getAreaFlag("egyptian");

async function renderHomePage() {
  const { meals } = await getData("mealName");
  let html = ``;
  for (const meal of meals) {
    html += `
      <div class="card rounded-lg relative group overflow-hidden cursor-pointer" data-meal-id=${meal.idMeal}>
        <img class="w-full" src="${meal.strMealThumb}" alt="${meal.strMeal}" />
        <div class="card-title w-full absolute top-0 right-0 bottom-0 left-0 bg-[rgba(255,255,255,0.7)] flex justify-start items-center translate-y-[101%] group-hover:translate-y-0 transition-all duration-300">
          <h2 class="text-3xl ms-5">${meal.strMeal}</h2>
        </div>
      </div>
    `;
  }
  document.querySelector("#recipes .card-container").innerHTML = html;
}

function makeTags(meal) {
  // console.log(meal);
  let ingredients = [];
  let measures = [];
  let htmlLi = "";
  for (const [key, value] of Object.entries(meal)) {
    if (value) {
      const trimmedValue = value.trim();
      if (trimmedValue !== "") {
        if (key.startsWith("strIngredient")) {
          ingredients.push(trimmedValue);
        } else if (key.startsWith("strMeasure")) {
          measures.push(trimmedValue);
        }
      }
    }
  }
  for (let i = 0; i < ingredients.length; i++) {
    htmlLi += `
        <li class="bg-blue-300 px-3 py-1 rounded text-blue-950" >
          <span> ${measures[i]} </span>
          <span>
          ${ingredients[i]}
          </span>
        </li>
      `;
  }
  return htmlLi;
}

function renderMealDetails(meals) {
  // console.log(meal);
  const {
    meals: [meal],
  } = meals;
  document
    .querySelector("#recipes .recipes-container")
    .classList.toggle("hidden");
  document
    .querySelector("#recipes .recipes-details")
    .classList.toggle("hidden");
  const tagsLi = makeTags(meal);
  let html = `
    <div class="grid grid-cols-1 md:grid-cols-[30%_minmax(0,1fr)] gap-5">
      <div class="px-5 ">
        <img class="w-full rounded-md" src="${meal.strMealThumb}" alt="" />
        <h2 class="text-4xl font-bold capitalize mt-5">${meal.strMeal}</h2>
      </div>
      <div class="px-5">
        <div>
          <h1 class="text-5xl font-bold capitalize">Instructions</h1>
          <p class="my-3">${meal.strInstructions}</p>
        </div>
        <div>
          <ul>
            <li>
              <h2 class="text-2xl font-bold">
                Area: <span>${meal.strArea}</span>
              </h2>
            </li>
            <li>
              <h2 class="text-2xl font-bold">
                Category: <span>${meal.strCategory}</span>
              </h2>
            </li>
            <li>
              <h2 class="text-2xl font-bold">Recipes:</h2>
              <ul class="my-3 flex flex-wrap gap-3">
                ${tagsLi}
              </ul>
            </li>
            <li>
              <h2 class="text-2xl font-bold my-4">Tags:</h2>
              <div class=" flex flex-wrap gap-3">
                ${
                  meal.strTags
                    ? meal.strTags
                        .split(",")
                        .map(
                          (tag) =>
                            `<span class="bg-red-300 px-3 py-1 rounded text-blue-950 ">${tag.trim()}</span>`
                        )
                        .join("")
                    : ""
                }
              </div>
              <div class="mt-5">
              <a href="${meal.strSource}" target="_blank"
              class="rounded-md bg-green-600 p-3 me-2 cursor-pointer">Source</a>
              <a href="${
                meal.strYoutube
              }" target="_blank" class="rounded-md bg-red-600 p-3 cursor-pointer"
              >YouTube</a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;
  document.querySelector("#recipes .recipes-details").innerHTML = html;
}

function viewMeal() {
  const cardContainer = document.querySelector(".card-container");

  cardContainer.addEventListener("click", async (e) => {
    const cardEl = e.target.closest(".card");
    const mealId = cardEl.getAttribute("data-meal-id");
    const meal = await getData("mealId", mealId);
    renderMealDetails(meal);
  });
}

async function renderCategories() {
  const { categories } = await getData("allCategories");
  console.log(categories);
  let html = ``;
  for (const category of categories) {
    html += `
      <div class="card rounded-lg relative group overflow-hidden cursor-pointer" data-meal-id=${category.idCategory}>
        <img class="w-full" src="${category.strCategoryThumb}" alt="${category.strCategory}" />
        <div class="card-title text-center w-full absolute top-0 right-0 bottom-0 left-0 bg-[rgba(255,255,255,0.7)] flex flex-col justify-start items-center translate-y-[101%] group-hover:translate-y-0 transition-all duration-300">
          <h2 class="text-3xl ms-5">${category.strCategory}</h2>
          <p>${category.strCategoryDescription}</p>
        </div>
      </div>
    `;
  }
  document.querySelector(".categories-container .card-container").innerHTML =
    html;
}

async function renderListArea() {
  const { meals: listArea } = await getData("listArea");
  console.log(listArea);
  let html = ``;
  for (const area of listArea) {
    html += `
      <div class="card rounded-lg relative group overflow-hidden cursor-pointer dark:text-white text-center" data-area-id=${area.strArea}>
        <div>
          <img class="w-full" src="/src/images/logo.png" alt="" />
        </div>
        <h3 class="text-2xl">${area.strArea}</h3>
      </div>
    `;
  }
  document.querySelector(".area-container .card-container").innerHTML = html;
}

async function renderListIngredients() {
  const { meals: listIngredients } = await getData("listIngredients");
  console.log(listIngredients);
  let html = ``;
  for (const ingredient of listIngredients) {
    html += `
      <div class="card rounded-lg relative group overflow-hidden cursor-pointer dark:text-white text-center" data-ingredient-id=${
        ingredient.idIngredient
      }>
        <div class="text-4xl">
          <i class="fa-solid fa-drumstick-bite"></i>
        </div>
        <h3 class="text-xl">${ingredient.strIngredient}</h3>
        <p class="text-sm">${
          ingredient.strDescription
            ? ingredient.strDescription.slice(0, 40)
            : ""
        }</p>
      </div>
    `;
  }
  document.querySelector(".ingredient-container .card-container").innerHTML =
    html;
}

document.addEventListener("DOMContentLoaded", async () => {
  const bars = document.querySelector(".home-page .bars .fa-solid");
  const header = document.querySelector("header.fixed");
  const navLiCollection = document.querySelectorAll(".nav-li li");

  await renderHomePage();
  viewMeal();

  bars.addEventListener("click", () => {
    header.classList.toggle("-translate-x-[200px]");
    header.classList.toggle("translate-x-0");
    bars.classList.toggle("fa-bars");
    bars.classList.toggle("fa-xmark");

    navLiCollection.forEach((element, index) => {
      if (header.classList.contains("translate-x-0")) {
        setTimeout(() => {
          element.style.transition = `transform 0.5s ease ${index * 0.1}s`;
          element.classList.remove("translate-y-[1000%]");
          element.classList.add("translate-y-0");
        }, 50);
      } else {
        element.style.transition = "transform 0.5s ease";
        element.classList.remove("translate-y-0");
        element.classList.add("translate-y-[1000%]");
      }
    });
  });

  document.querySelector(".nav-li").addEventListener("click", async (e) => {
    const recipesContainer = document.querySelector(
      "#recipes .recipes-container"
    );
    const categoriesContainer = document.querySelector(".categories-container");
    const areaContainer = document.querySelector(".area-container");
    const ingredientContainer = document.querySelector(".ingredient-container");
    const contactContainer = document.querySelector(".contact-container");
    const recipesDetails = document.querySelector(".recipes-details");

    // click categories
    if (e.target.innerText.toLowerCase() === "categories") {
      await renderCategories();
      recipesContainer.classList.add("hidden");
      areaContainer.classList.add("hidden");
      ingredientContainer.classList.add("hidden");
      contactContainer.classList.add("hidden");
      recipesDetails.classList.add("hidden");
      categoriesContainer.classList.remove("hidden");
    }
    // click area list
    if (e.target.innerText.toLowerCase() === "area") {
      await renderListArea();
      recipesContainer.classList.add("hidden");
      categoriesContainer.classList.add("hidden");
      contactContainer.classList.add("hidden");
      ingredientContainer.classList.add("hidden");
      recipesDetails.classList.add("hidden");
      areaContainer.classList.remove("hidden");
    }

    // click ingredinets list
    if (e.target.innerText.toLowerCase() === "ingredients") {
      await renderListIngredients();
      recipesContainer.classList.add("hidden");
      categoriesContainer.classList.add("hidden");
      areaContainer.classList.add("hidden");
      contactContainer.classList.add("hidden");
      recipesDetails.classList.add("hidden");
      ingredientContainer.classList.remove("hidden");
    }

    // click contanct us
    if (e.target.innerText.toLowerCase() === "contact us") {
      recipesContainer.classList.add("hidden");
      categoriesContainer.classList.add("hidden");
      areaContainer.classList.add("hidden");
      ingredientContainer.classList.add("hidden");
      recipesDetails.classList.add("hidden");
      contactContainer.classList.remove("hidden");
    }
  });
});
