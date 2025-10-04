const {connectDB,mongoose}=require("./connection");
const {book}=require("./books");
async function main(){
    await connectDB();
    // const books=await book.find().select("genre");
    // console.log("all books:",books)
    // const latestBooks=await book.find(
    //     {published_year:{$gt:1940}}
    // )
    // console.log("found:",latestBooks)
    // const author=await book.find({publisher:"T. Egerton, Whitehall"}).select("author");
    // console.log("romancebook",author)
    // await book.updateOne({author:"Jane Austen"},{price:10.50});
    // console.log("bookupdated")
    await book.deleteOne({title:"The Catcher in the Rye"});
    console.log("bookdeleted")
}
main();