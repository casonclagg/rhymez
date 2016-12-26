# Rhymez

Fast-ish rhymes for JavaScript.

#### Usage

    import Rhymez from "rhymez"
    let rhymez = new Rhymez()

    // Load data from file, should take around 500ms
    await rhymez.load()

    let rhymes = rhymez.rhyme("test")
    console.log(rhymes)
    // ["BEST", "REST" ...]

    let pronunciation = rhymez.pronunciation("test")
    console.log(pronunciation)
    // ["T", "EH1", "S", "T"]
