let searchParams = new URLSearchParams(window.location.search);
let page = 1;
let max_page = 1;
let query;
let search_response = sessionStorage.getItem("search_response")
if (searchParams.has("page")) page = searchParams.get("page")
if (search_response != null)
{
    updateResponse()
    search_response = JSON.parse(search_response)
    parseResponse(search_response)
}
$("#txt_SearchField").keydown(function(e)
{
    if (e.keyCode === 13)
    {
        e.preventDefault()
        $("#btn_Search").click()
    }
})
$("#btn_Search").click(function()
{
    query = $("#txt_SearchField").val()
    if (query == undefined || query == "") 
    {
        alert("Query is empty!")
        return
    }
    sessionStorage.setItem("query",query)
    $.ajax({
        url: `https://yts.mx/api/v2/list_movies.json?limit=10&page=${page.toString()}&sort_by=year&order_by=desc&query_term=${query}`,
        dataType: 'json',
        success: function(data) 
        {
            sessionStorage.setItem("search_response",JSON.stringify(data))
            parseResponse(data)
        }
    })
})
function parseResponse(response)
{
    renderPagination(response["data"]["movie_count"])
    renderMovies(response["data"]["movies"])
}

function renderPagination(movie_count)
{   
    if (searchParams.has("page")) page = parseInt(searchParams.get("page"))
    max_page = movie_count / 10;
    if (max_page % 1 > 0) max_page += 1
    
    let json = 
    {
        previous: {value:page-1,disabled:""},
        current: {value:page,disabled:""},
        nextpage: {value:page+1,disabled:""},
        lastpage: {value:page+2,disabled:""}
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

function updateResponse()
{
    $.ajax({
        url: `https://yts.mx/api/v2/list_movies.json?limit=10&page=${page.toString()}&sort_by=year&order_by=desc&query_term=${sessionStorage.getItem("query")}`,
        dataType: 'json',
        success: function(data) 
        {
            sessionStorage.setItem("search_response",JSON.stringify(data))
            parseResponse(data)
        }
    })
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

function renderMovies(movies)
{
    let rendered = ""
    movies.forEach(movie => {
        let img = movie["large_cover_image"]
        let description = movie["summary"]
        let title = movie["title_long"]
        let torrents = ""
        movie["torrents"].forEach(torrent=>{
            torrents += `<br><a href="${torrent["url"]}" target="_blank">${ucfirst(torrent["type"])} | ${torrent["quality"]} ${torrent["size"]}</a>`
        })
        rendered += `<div class="col">
        <div class="card mx-3 my-3" style="width: 18rem;">
        <img
          src="${img}"
          class="card-img-top"
          alt="..."
        />
        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <p class="card-text">
            ${description}
          </p>
          ${torrents}
        </div>
      </div>
        </div>`
    });
    $("#movies").html(rendered)
}