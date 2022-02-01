let searchParams = new URLSearchParams(window.location.search);
let page = 1;
let max_page = 1;
let query;
let search_response = sessionStorage.getItem("search_response")
if (searchParams.has("page")) page = searchParams.get("page")
if (search_response != null) {
    updateResponse()
    search_response = JSON.parse(search_response)
    parseResponse(search_response)
}
$("#txt_SearchField").keydown(function(e) {
    if (e.keyCode === 13) {
        e.preventDefault()
        $("#btn_Search").click()
    }
})
$("#btn_Search").click(function() {
    query = $("#txt_SearchField").val()
    if (query == undefined || query == "") {
        alert("Query is empty!")
        return
    }
    
    $("#movies").html('<div class="d-flex justify-content-center"><div class="spinner-border" role="status"></div></div>');
    sessionStorage.setItem("query", query)
    $.ajax({
        url: `https://yts.mx/api/v2/list_movies.json?limit=10&page=${page.toString()}&sort_by=year&order_by=desc&query_term=${query}`,
        dataType: 'json',
        success: function(data) {
            sessionStorage.setItem("search_response", JSON.stringify(data))
            parseResponse(data)
        }
    })
})

function parseResponse(response) {
    renderPagination(response["data"]["movie_count"])
    renderMovies(response["data"]["movies"], response["data"]["movie_count"]);
}

function renderPagination(movie_count) {
    if (searchParams.has("page")) page = parseInt(searchParams.get("page"))
    max_page = movie_count / 10;
    if (max_page % 1 > 0) max_page += 1

    let json = {
        previous: {
            value: page - 1,
            disabled: ""
        },
        current: {
            value: page,
            disabled: ""
        },
        nextpage: {
            value: page + 1,
            disabled: ""
        },
        lastpage: {
            value: page + 2,
            disabled: ""
        }
    }
    if (json["previous"]["value"] < 1) json["previous"]["disabled"] = "disabled"
    if (json["previous"]["value"] > max_page) json["previous"]["value"] = 1
    if (json["nextpage"]["value"] > max_page) json["nextpage"]["disabled"] = "disabled"
    if (json["lastpage"]["value"] > max_page) json["lastpage"]["disabled"] = "disabled"

    let pagination = `<li class="page-item ${json["previous"]["disabled"]}">
    <a class="page-link" href="?page=${json["previous"]["value"]}" tabindex="-1">Previous</a>
    </li>
    <li class="page-item active ${json["current"]["disabled"]}" aria-current="page" tabindex="-1"><a class="page-link" href="?page=${page}">${page}<span class="visually-hidden">(current)</span></a></li>
    <li class="page-item ${json["nextpage"]["disabled"]}">
    <a class="page-link" href="?page=${json["nextpage"]["value"]}" tabindex="-1">${json["nextpage"]["value"]}</a>
    </li>
    <li class="page-item ${json["lastpage"]["disabled"]}"><a tabindex="-1" class="page-link" href="?page=${json["lastpage"]["value"]}">${json["lastpage"]["value"]}</a></li>
    <li class="page-item ${json["nextpage"]["disabled"]}" >
    <a class="page-link" href="?page=${json["nextpage"]["value"]}" tabindex="-1">Next</a>
    </li>`
    $(".pagination").html(pagination)
}

function updateResponse() {
    $.ajax({
        url: `https://yts.mx/api/v2/list_movies.json?limit=10&page=${page.toString()}&sort_by=year&order_by=desc&query_term=${sessionStorage.getItem("query")}`,
        dataType: 'json',
        success: function(data) {
            sessionStorage.setItem("search_response", JSON.stringify(data))
            parseResponse(data)
        }
    })
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function renderMovies(movies, count) {
    if (count == 0)
    { 
        $("#movies").html("<h1>No results found</h1>")
        sessionStorage.clear();
        return;
    }
    let rendered = ""
    if (searchParams.has("movie_id")) 
    {
        var id = searchParams.get("movie_id");
        if (id != "")
    {
        var id = searchParams.get("movie_id");
        $("#TxtBox").remove()
        $("#movies").html('<div class="d-flex justify-content-center"><div class="spinner-border" role="status"></div></div>');
        MarkupFromID(id)
    }
    }
    //SEARCHONLY
    const trackers = "&tr=https://tracker.nanoha.org:443/announce&tr=https://tracker.nitrix.me:443/announce&tr=https://tracker.tamersunion.org:443/announce&tr=http://tracker-cdn.moeking.me:2095/announce&tr=https://tr.torland.ga:443/announce&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969"

    movies.forEach(movie => {
        let img = movie["large_cover_image"]
        let description = movie["summary"]
        let title = movie["title_long"]
        let id = movie["id"]
        let torrents = ""
        let magnets = ""
        movie["torrents"].forEach(torrent => {
            torrents += `<br>Torrent: <a href="${torrent["url"]}" target="_blank">${ucfirst(torrent["type"])} | ${torrent["quality"]} ${torrent["size"]}</a>`

            let magnet = `magnet:?xt=urn:btih:${torrent["hash"]}&dn=${encodeURI(title)}${trackers}`

            magnets += `<br>Magnet: <a href="${magnet}" target="_blank">${ucfirst(torrent["type"])} | ${torrent["quality"]} ${torrent["size"]}</a>`
        })
        rendered += `<div class="col">
        <div class="card mx-3 my-3" style="width: 18rem;">
        <img
          src="${img}"
          class="card-img-top"
          alt="..."
        />
        <div class="card-body">
          <a href="?movie_id=${id}" target="_blank">
            <h5 class="card-title">${title}</h5>
          </a>
          <p class="card-text">
            ${description}
          </p>
          ${torrents}<br>${magnets}
        </div>
      </div>
        </div>`
    });
    $("#movies").html(rendered)
}

async function MarkupFromID(id) 
{
    let response = JSON.parse(sessionStorage.getItem(id))
    let rendered
    if (response != null) 
    {
        rendered = GenerateHTML(response)
        $("#movies").html(rendered)
        return;
    }
    await $.ajax({
        url: `https://yts.mx/api/v2/movie_details.json?movie_id=${id}&with_images=true&with_cast=true`,
        dataType: 'json',
        success: function(response) 
        {
            sessionStorage.setItem(id, JSON.stringify(response))
            rendered = GenerateHTML(response)
        }
    })
    $("#movies").html(rendered)
}

function GenerateHTML(response) 
{
    let data
    const trackers = "&tr=https://tracker.nanoha.org:443/announce&tr=https://tracker.nitrix.me:443/announce&tr=https://tracker.tamersunion.org:443/announce&tr=http://tracker-cdn.moeking.me:2095/announce&tr=https://tr.torland.ga:443/announce&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969"
    let rendered = ""
    if (response != null) 
    {
        data = response["data"]["movie"]
        if (data["slug"] == null)
        {
            $("#movies").html(`<h1>No movie found with ID: ${searchParams.get('movie_id')}</h1>`)
            sessionStorage.clear();
            return;
        }
        let img = data["large_cover_image"]
        let description = data["description_intro"]
        let title = data["title_long"]
        let id = data["id"]
        let torrents = ""
        let magnets = ""
        let download_count = data["download_count"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        
        let genres = ""
        try
        {
            genres = data["genres"].join(", ")
        }catch ( error )
        {
            console.log(error);
        }
        data["torrents"].forEach(torrent => {
            torrents += `<br>Torrent: <a href="${torrent["url"]}" target="_blank">${ucfirst(torrent["type"])} | ${torrent["quality"]} ${torrent["size"]}</a>`

            let magnet = `magnet:?xt=urn:btih:${torrent["hash"]}&dn=${encodeURI(title)}${trackers}`

            magnets += `<br>Magnet: <a href="${magnet}" target="_blank">${ucfirst(torrent["type"])} | ${torrent["quality"]} ${torrent["size"]}</a>`
        })
        rendered = `<div class="col d-inline-flex shadow-3-strong p-3 rounded-3 flex-wrap"><img
        src="${img}"
        class="card-img-top"
        alt="..."
      />
      <div class="card-body">
        <a href="?movie_id=${id}" target="_blank">
          <h5 class="card-title">${title}</h5>
        </a>
        <p class="card-text">
          ${description}
        </p>
        Genres: ${genres}<br>
        Download Count: ${download_count}<br>
        ${torrents}<br>${magnets}
        <br>
        <br>
        <button class="btn-danger btn" onClick="window.close();">Back</button>
      </div></div>`
      document.title = title;
    }
    return rendered
}
if (searchParams.has("movie_id")) 
{   
    if (searchParams.get("movie_id") != "")
    {
        var id = searchParams.get("movie_id");
        $("#TxtBox").remove()
        $("#movies").html('<div class="d-flex justify-content-center"><div class="spinner-border" role="status"></div></div>');
        MarkupFromID(id)
    }
}