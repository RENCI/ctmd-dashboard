export const isSiteActive = site => {
    if (!site.dateSiteActivated) {
        return false
    }
    const activationDate = new Date(site.dateSiteActivated)
    const now = new Date()
    return activationDate <= now
}

