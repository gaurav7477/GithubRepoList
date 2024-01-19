import { GITHUB_API_TOKEN } from "./config.js";

const showSearch = () => {
  const searchContainer = document.querySelector("searchContainer");
  searchContainer.style.display = "flex";
  const repoSearchContainer = document.querySelector("reposearchContainer");
  searchContainer.style.display = "flex";
}



document.addEventListener("DOMContentLoaded", () => {
  const repositoriesContainer = document.getElementById(
    "repositoriesContainer"
  );
  const paginationContainer = document.getElementById("paginationContainer");
  const mainContent = document.querySelector(".main");
  const nextButton = document.getElementById("nextButton");
  const prevButton = document.getElementById("prevButton");

  const nextNavigateButton = document.getElementById("nextNavigateButton");
  const prevNavigateButton = document.getElementById("prevNavigateButton");

  const profileImg = document.getElementById("profileImg");
  const userNameElement = document.getElementById("userName");
  const userBioElement = document.getElementById("userBio");
  const userLocationElement = document.getElementById("userLocation");
  const userLinkElement = document.getElementById("userLink");
  const userGithubLink = document.getElementById("userGithubLink");

  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");

  const searchRepoInput = document.getElementById("searchRepoInput");
  const searchRepoButton = document.getElementById("searchRepoButton");

  let currentPage = 1; // Initial page
  const perPage = 10; // Fixed per_page value

  // Function to fetch repositories
  let username = "gaurav7477";
  const accessToken = GITHUB_API_TOKEN;
  console.log(accessToken);

  const loader = document.getElementById("loader");

  // Function to show loader
  const showMainContent = () => {
    mainContent.style.display = "flex";
  };

  const showLoader = () => {
    loader.style.display = "block";
  };

  // Function to hide loader
  const hideLoader = () => {
    loader.style.display = "none";
  };

  const handleSearch = () => {
    const searchTerm = searchInput.value.trim();

    if (searchTerm !== "") {
      // Perform actions for the search term, e.g., fetch user data for the searched user
      username = searchTerm; // Update the username with the searched term
      currentPage = 1; // Reset current page when performing a new search

      // Fetch data for the searched user
      fetchUserData();
      fetchRepositories();
    }
  };
  searchButton.addEventListener("click", handleSearch);

  // Optionally, you can also handle search on pressing Enter in the input field
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  });

  const handleRepoSearch = () => {
    const repoSearchTerm = searchRepoInput.value.trim();

    if (repoSearchTerm !== "") {
      // Perform actions for the repository search term
      currentPage = 1; // Reset current page when performing a new search

      // Fetch repositories for the searched term
      fetchRepositoriesSearch(repoSearchTerm);
    }
  };

  // Add event listener for repository search button
  searchRepoButton.addEventListener("click", handleRepoSearch);

  // Optionally, you can also handle search on pressing Enter in the input field
  searchRepoInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleRepoSearch();
    }
  });

  const fetchUserData = async () => {
    showLoader(); // Show loader before fetching data

    const apiUrl = `https://api.github.com/users/${username}`;

    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    try {
      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const userData = await response.json();
      displayUserData(userData);
      console.log(userData);
    } catch (error) {
      console.error(error);
    } finally {
      hideLoader(); // Hide loader regardless of success or failure
      showMainContent();
    }
  };

  const fetchRepositoriesSearch = async (repoSearchTerm) => {
    showLoader(); // Show loader before fetching data
    const apiUrl = `https://api.github.com/users/${username}/repos`;
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    try {
      let allRepositories = [];
      let page = 1;
      let fetchMore = true;

      while (fetchMore) {
        const response = await fetch(
          `${apiUrl}?page=${page}&per_page=${perPage}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const repositories = await response.json();
        if (repositories.length > 0) {
          allRepositories = [...allRepositories, ...repositories];
          page++;
        } else {
          fetchMore = false;
        }
      }
      const filteredRepositories = allRepositories.filter((item) =>
        item.name.toLowerCase().includes(repoSearchTerm.toLowerCase())
      );

      displayRepositories(filteredRepositories);
      displayPagination(allRepositories.length); // Update pagination with the total number of repositories
    } catch (error) {
      console.error(error);
    } finally {
      hideLoader(); // Hide loader regardless of success or failure
      showMainContent();
    }
  };
  const fetchRepositories = async () => {
    showLoader(); // Show loader before fetching data

    const apiUrl = `https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${perPage}`;

    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    try {
      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const repositories = await response.json();
      displayRepositories(repositories);
      displayPagination();
    } catch (error) {
      console.error(error);
    } finally {
      hideLoader(); // Hide loader regardless of success or failure
      showMainContent();
    }
  };

  // Function to display repositories on the page
  const displayRepositories = (repositories) => {
    repositoriesContainer.innerHTML = "";

    repositories.forEach((repo) => {
      const repoContainer = document.createElement("div");
      repoContainer.classList.add("repo-container");

      const heading = document.createElement("h4");
      heading.classList.add("repo-heading");

      const description = document.createElement("p");
      description.classList.add("repo-description");

      const languagesList = document.createElement("ul");
      languagesList.classList.add("repo-languages");

      heading.textContent = repo.name;
      description.textContent = repo.description || "No description available.";

      // Fetch languages for the repository
      fetchLanguages(repo.languages_url)
        .then((languages) => {
          languages.forEach((language) => {
            const languageItem = document.createElement("li");
            languageItem.classList.add("repo-list");
            languageItem.textContent = language;
            languagesList.appendChild(languageItem);
          });
        })
        .catch((error) => console.error("Error fetching languages:", error));

      repoContainer.appendChild(heading);
      repoContainer.appendChild(description);

      repoContainer.appendChild(languagesList);

      repositoriesContainer.appendChild(repoContainer);
    });
  };

  // Function to fetch languages for a repository
  const fetchLanguages = async (languagesUrl) => {
    const response = await fetch(languagesUrl);
    if (!response.ok) {
      throw new Error(
        `Error fetching languages: ${response.status} - ${response.statusText}`
      );
    }
    const languagesData = await response.json();
    return Object.keys(languagesData);
  };

  const displayPagination = () => {
    const totalRepositories = 100; // Assume you know the total number of repositories

    const totalPages = Math.ceil(totalRepositories / perPage);

    paginationContainer.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const pageLink = document.createElement("a");
      pageLink.classList.add("page-link");
      pageLink.textContent = i;
      pageLink.addEventListener("click", () => {
        currentPage = i;
        fetchRepositories();
      });

      paginationContainer.appendChild(pageLink);
    }
  };
  fetchUserData();
  // Initial fetch
  fetchRepositories();

  // Add event listener to the next button
  nextButton.addEventListener("click", () => {
    currentPage++;
    fetchRepositories();
  });

  // Add event listener to the previous 
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchRepositories();
    }
  });

  nextNavigateButton.addEventListener("click", () => {
    currentPage++;
    fetchRepositories();
  });

  // Add event listener to the previous button
  prevNavigateButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchRepositories();
    }
  });

  const displayUserData = (userData) => {
    // Update individual HTML elements with the fetched data
    profileImg.innerHTML = `<img src="${userData.avatar_url}" alt="${userData.name}" />`;
    userNameElement.textContent = userData.name || userData.login;
    userBioElement.textContent = userData.bio || "No bio available";
    userLocationElement.textContent = userData.location || "No location";
    userLinkElement.innerHTML = `Twitter: <a href="${
      userData.twitter_username
        ? `https://twitter.com/${userData.twitter_username}`
        : "#"
    }" target="_blank">${userData.twitter_username}</a>`;

    userGithubLink.href = userData.html_url;
    userGithubLink.textContent = userData.html_url;
  };

  document.getElementById("searchToggle").addEventListener("click", () => {
    const searchContainer = document.querySelector(".searchContainer");
    searchContainer.style.display = (searchContainer.style.display == "none")? "flex":"none";
    const repoSearchContainer = document.querySelector(".reposearchContainer");
    repoSearchContainer.style.display = (repoSearchContainer.style.display == "none")? "flex":"none";
  });
});
