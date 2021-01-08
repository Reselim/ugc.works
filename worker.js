const aliases = {
	neko: "nekolestial",
}

const baseUrl = "https://www.roblox.com/catalog"

function constructRedirect(creatorName, searchQuery) {
	creatorName = aliases[creatorName] || creatorName

	let parameters = {
		Category: 13, // Community Creations
		Subcategry: 40, // All Creations
		CreatorName: creatorName,
	}

	if (searchQuery) {
		parameters.Keyword = searchQuery.replace("-", " ")
	}

	let query = new URLSearchParams(parameters)
	return `${baseUrl}?${query.toString()}`
}

function getUrlData(urlString) {
	let url = new URL(urlString)
	let paths = url.pathname.split("/")

	if (paths[1]) {
		return {
			creatorName: paths[1],
			searchQuery: paths[2] || null,
		}
	} else {
		throw "Unknown creator name"
	}
}

async function handleRequest(request) {
	let data = getUrlData(request.url)
	let target = constructRedirect(data.creatorName, data.searchQuery)

	let headers = new Headers()
	headers.append("Location", target)

	return new Response("", {
		status: 301,
		headers: headers,
	})
}

addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event.request))
})