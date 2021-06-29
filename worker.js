// Config

const aliases = {
	neko: "nekolestial",
	trus: "WhoToTrus",
	ink: { creatorName: "inkwaves", sort: "recent" },
	john: "JohnDrinkin",
	blu: "GuestCapone",
	evil: "EvilArtist",
	ivy: "Spectaqual",
	polarcub: "polarcub_art",
}

const sortTypes = {
	relevance: undefined,
	favorites: 1, f: 1,
	sales: 2, s: 2,
	recent: 3, r: 3,
	"price-ascending": 4, price: 4, pa: 4, c: 4, "$": 4,
	"price-descending": 5, pd: 5, e: 5,
}

const sortAggregations = {
	all: 5, a: 5,
	week: 3, w: 3,
	day: 1, d: 1,
}

// Code

const baseUrl = "https://www.roblox.com/catalog"

const patterns = [
	// ugc.works/<sort>/username
	{ regex: /^\/(.)(.?)\/([\w\d]+)\/?$/i, captures: [ "sort", "sortAggregation", "creatorName" ] },
	{ regex: /^\/(.)(.?)\/([\w\d]+)\/([^\/]+)\/?$/i, captures: [ "sort", "sortAggregation", "creatorName", "searchQuery" ] },

	// ugc.works/neko/username/sales/week
	{ regex: /^\/([\w\d]+)\/?$/i, captures: [ "creatorName" ] },
	{ regex: /^\/([\w\d]+)\/([^\/]+)\/?$/i, captures: [ "creatorName", "searchQuery" ] },
	{ regex: /^\/([\w\d]+)\/([^\/]+)\/(\w+)\/?$/i, captures: [ "creatorName", "searchQuery", "sort" ] },
	{ regex: /^\/([\w\d]+)\/([^\/]+)\/(\w+)\/(\w+)\/?$/i, captures: [ "creatorName", "searchQuery", "sort", "sortAggregation" ] },
]

function constructRedirectUrl(data) {
	let parameters = {
		Category: 13, // Community Creations
		Subcategory: 40, // All Creations
	}

	if (data.creatorName) {
		let alias = aliases[data.creatorName]

		if (alias) {
			if (typeof alias === "string") {
				data = { creatorName: data }
			}

			data = Object.assign({}, data, alias)
		}

		parameters.CreatorName = data.creatorName
	}

	if (data.searchQuery) {
		parameters.Keyword = data.searchQuery.replace("-", " ")
	}

	if (data.sort && sortTypes[data.sort]) {
		parameters.SortType = sortTypes[data.sort]
	}

	if (data.sortAggregation && sortAggregations[data.sortAggregation]) {
		parameters.SortAggregation = sortAggregations[data.sortAggregation]
	}

	let query = new URLSearchParams(parameters)
	return `${baseUrl}?${query.toString()}`
}

function getUrlData(url) {
	let pathname = (new URL(url)).pathname
	
	let pattern = patterns.find((pattern) => {
		return !!pattern.regex.test(pathname)
	})

	if (pattern) {
		let data = {}

		let match = pathname.match(pattern.regex)
		pattern.captures.forEach((capture, index) => {
			let value = match[index + 1].toLowerCase()
			if (value.length > 0) {
				data[capture] = value
			}
		})

		return data
	} else {
		return null
	}
}

async function handleRequest(request) {
	let data = getUrlData(request.url)

	if (!data) {
		return new Response(`Unknown match for url "${request.url}"`, {
			status: 401,
		})
	}

	let redirect = constructRedirectUrl(data)

	let headers = new Headers()
	headers.append("Location", redirect)

	return new Response("", {
		status: 307,
		headers: headers,
	})
}

addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event.request))
})