// Mozilla Readability library (minimal stub for demo)
// For full functionality, use the official library: https://github.com/mozilla/readability
class Readability {
    constructor(doc) {
        this._doc = doc;
    }
    parse() {
        // This is a stub. In production, use the full Readability library.
        // Here, we just return the body text for demo purposes.
        return {
            title: this._doc.title,
            content: this._doc.body.innerText
        };
    }
}
