const {mongoose}=require("./connection");
const {Schema}=mongoose;
const bookSchema=new Schema(
    {
    title:String,
    author:String,
    genre:String,
    published_year:Number,
    price:Number,
    in_stock:Boolean,
    pages:Number,
    publisher:String
    }
    ,{timestamps:true}
);
const book=mongoose.model("book",bookSchema);
module.exports={book};