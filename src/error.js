let errors = []
let errorOccurEvent = new Event("errorOccur")

function setError(error) {
    document.dispatchEvent(errorOccurEvent)
    errors.push(error)
    console.error(error)
}

export { errors, setError }