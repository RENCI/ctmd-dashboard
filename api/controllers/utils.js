module.exports = {
    stringToInteger: s => {
	let i = parseInt(s)
	if (isNaN(i)) {
            return 0
	} else {
            return i
	}
    },
    stringToDate : s => {
	if (s != null) {
            return new Date(s)
	} else {
            return null
	}
    }
}
