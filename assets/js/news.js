var md = window.markdownit({ html: true });
var req = new XMLHttpRequest();
var page;
var renderPage;
var pageUpdated = false;
var maxPage;

document.addEventListener("DOMContentLoaded", function () {
  window.scrollTo(0, 0);
  var urlParams = new URLSearchParams(new URL(window.location).search);
  if (urlParams.has("post")) {
    var postId = urlParams.get("post");
    if (!getPostData(`${postId}.md`)) window.location.href = "/news.html";
    renderFullPost(postId);
  } else {
    maxPage = Math.ceil(getAllPosts()["postFiles"].length / 10);
    page = parseInt(urlParams.get("page"));
    if (isNaN(page)) page = 1;
    renderPage = page;
    if (renderPage !== 1)
      document.querySelector("#news .prev").classList.remove("hidden");
    renderAllPosts(page, true);
  }
});

document.addEventListener("scroll", function () {
  if (
    document.getElementById("news").getBoundingClientRect().bottom <=
    window.innerHeight + 25
  ) {
    loadNextPosts(page + 1);
  }
});

function renderAllPosts(currentPage, initial, prev) {
  var loadingEl = document.querySelector("#news .loading");
  var allPosts = getAllPosts()
    ["postFiles"].reverse()
    .slice(currentPage * 10 - 10, currentPage * 10);
  if (allPosts.length === 0) {
    if (!initial) return;
    page = maxPage;
    renderPage = maxPage;
    var url = new URL(window.location.href);
    url.searchParams.set("page", page);
    window.history.replaceState({}, "DNA Studio | News", url.href);
    allPosts = getAllPosts()
      ["postFiles"].reverse()
      .slice(page * 10 - 10, page * 10);
  }
  for (postFile of allPosts) {
    var post = parsePost(postFile);
    var postEl = document.createElement("div");
    postEl.classList.add("post");
    postEl.innerHTML = shortPostTemplate(
      post.title,
      post.date,
      post.description
    );
    postEl.addEventListener("click", function (e) {
      var url = new URL(window.location);
      url.searchParams.set("post", postFile.replace(".md", ""));
      window.location.href = url;
    });
    if (prev) {
      console.log("Prev");
      document
        .querySelector("#news")
        .insertBefore(
          postEl,
          document.querySelector("#news .prev").nextSibling
        );
    } else {
      document.querySelector("#news").insertBefore(postEl, loadingEl);
      console.log("Next");
    }
    if (page === maxPage) loadingEl.classList.add("hidden");
  }
  pageUpdated = false;
}

function renderFullPost(postId) {
  var post = parsePost(`${postId}.md`);
  console.log(post);
  document.getElementById("news").remove();

  var titleH1 = document.querySelector("main .title-row h1.title");
  titleH1.innerHTML = post.title;

  var postEl = document.createElement("div");
  postEl.id = "post";
  postEl.innerHTML = fullPostTemplate(post.title, post.date, post.body).trim();
  document.querySelector("main").appendChild(postEl);

  var arrowBack = document.createElement("span");
  arrowBack.classList.add("material-icons");
  arrowBack.innerHTML = "arrow_back";
  arrowBack.addEventListener("click", function (e) {
    window.history.back();
  });
  document.querySelector("main .title-row").insertBefore(arrowBack, titleH1);
}

function parsePost(postFile) {
  var data = getPostData(postFile);
  var info = data
    .split("---")
    .slice(1, 2) // Get Font matter
    .join()
    .split("\n") // Set every property to a separate element
    .slice(1, -1); // Remove empty elements
  var body = data.split("---").slice(2).join();
  var settings = {};
  for (property of info) {
    var [key, value] = property.split(":");
    settings[key] = value.trim();
  }
  return {
    ...settings,
    body,
  };
}

function getAllPosts() {
  var data;
  req.onreadystatechange = function (e) {
    if (e.target.readyState === 4) {
      data = JSON.parse(e.target.responseText);
    }
  };
  req.open("GET", "/posts/data.json", false);
  req.send();
  return data;
}

function loadNextPosts(newPage) {
  var url = new URL(window.location.href);
  url.searchParams.set("page", newPage);
  if (!pageUpdated && newPage <= maxPage) {
    pageUpdated = true;
    window.history.pushState({}, "DNA Studio | News", url.href);
    page = newPage;
    renderAllPosts(newPage);
  }
}

function loadPrevPosts() {
  var url = new URL(window.location.href);
  if (!pageUpdated && page > 1 && (!renderPage || renderPage > 1)) {
    pageUpdated = true;
    if (!renderPage) renderPage = page - 1;
    else renderPage = renderPage - 1 >= 1 ? renderPage - 1 : 1;
    url.searchParams.set("page", renderPage);
    window.history.pushState({}, "DNA Studio | News", url.href);
    renderAllPosts(renderPage, false, true);
    if (renderPage === 1)
      document.querySelector("#news .prev").classList.add("hidden");
  }
}

function getPostData(postFile) {
  var post = null;
  req.onreadystatechange = function (e) {
    if (e.target.readyState === 4) {
      post = e.target.responseText;
    }
  };
  req.open("GET", `/posts/${postFile}`, false);
  req.send();
  if (req.status === 404) return null;
  return post;
}

function shortPostTemplate(title, date, description) {
  return `
    <h2 class="title">${title}</h2>
    <hr>
    <p class="date">${formatDate(date)}</p>
    <p>
      ${description}
    </p>
  `;
}

function fullPostTemplate(title, date, body) {
  return `
    <h2 class="title">${title}</h2>
    <p class="date">${formatDate(date)}<h6>
    <p>
      ${md.render(body)}
    </p>
  `;
}

function formatDate(dateInMillis) {
  var date = new Date(parseInt(dateInMillis));
  var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  function ordinalNum(num) {
    if (num.toString().endsWith("1")) return `${num}st`;
    if (num.toString().endsWith("2")) return `${num}nd`;
    if (num.toString().endsWith("3")) return `${num}rd`;
    return `${num}th`;
  }
  return `${months[date.getMonth()]} ${ordinalNum(
    date.getDate()
  )} ${date.getFullYear()}`;
}
