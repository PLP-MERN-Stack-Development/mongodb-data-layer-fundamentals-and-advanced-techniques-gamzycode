// queries.js - Complete MongoDB Queries Script (CommonJS)

const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 30000 });

const DB_NAME = "plp_bookstore";
const COLLECTION_NAME = "books";

async function executeQueries() {
    try {
        console.log("Attempting to connect to MongoDB Atlas...");
        await client.connect();
        console.log("✅ Successfully connected to MongoDB Atlas!");

        const db = client.db(DB_NAME);
        const booksCollection = db.collection(COLLECTION_NAME);

        console.log("\n--- 1. CRUD OPERATIONS ---");

        const fantasyBooks = await booksCollection.find(
            { genre: "Fantasy" },
            { projection: { title: 1, author: 1, price: 1, _id: 0 } }
        ).toArray();
        console.log("\n📚 Found Fantasy Books:", fantasyBooks);

        const updateFantasy = await booksCollection.updateMany(
            { genre: "Fantasy" },
            { $mul: { price: 1.1 } }
        );
        console.log(`✏️ Updated ${updateFantasy.modifiedCount} Fantasy book prices by 10%.`);

        const deleteOld = await booksCollection.deleteMany({ published_year: { $lt: 1950 } });
        console.log(`🗑️ Deleted ${deleteOld.deletedCount} books published before 1950.`);

        console.log("\n--- 2. ADVANCED QUERIES ---");

        const inStockAfter1950 = await booksCollection.find(
            { in_stock: true, published_year: { $gt: 1950 } },
            { projection: { title: 1, author: 1, price: 1, _id: 0 } }
        ).toArray();
        console.log("\n📘 Books In Stock & Published After 1950:", inStockAfter1950);

        const top3Books = await booksCollection.find(
            {},
            { projection: { title: 1, author: 1, price: 1, _id: 0 } }
        ).sort({ price: -1 }).limit(3).toArray();
        console.log("\n📕 Top 3 Most Expensive Books:", top3Books);

        const PAGE_SIZE = 5;
        const page1 = await booksCollection.find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } })
            .sort({ title: 1 }).skip(0).limit(PAGE_SIZE).toArray();
        console.log("\n📄 Pagination - Page 1 (First 5 Books, Sorted by Title):");
        page1.forEach(book => console.log(`  - ${book.title} by ${book.author} ($${book.price})`));

        const page2 = await booksCollection.find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } })
            .sort({ title: 1 }).skip(PAGE_SIZE).limit(PAGE_SIZE).toArray();
        console.log("\n📄 Pagination - Page 2 (Next 5 Books, Sorted by Title):");
        page2.forEach(book => console.log(`  - ${book.title} by ${book.author} ($${book.price})`));

        console.log("\n--- 3. AGGREGATION PIPELINE: Top 5 Authors by Avg Book Price ---");
        const topAuthors = await booksCollection.aggregate([
            { $group: { _id: "$author", avgPrice: { $avg: "$price" }, totalBooks: { $sum: 1 } } },
            { $sort: { avgPrice: -1 } },
            { $limit: 5 }
        ]).toArray();
        topAuthors.forEach(a => console.log(`  - ${a._id}: $${a.avgPrice.toFixed(2)} (${a.totalBooks} books)`));

        console.log("\n--- 4. AGGREGATION PIPELINE: Average Price by Genre ---");
        const avgPriceByGenre = await booksCollection.aggregate([
            { $group: { _id: "$genre", avgPrice: { $avg: "$price" }, totalBooks: { $sum: 1 } } },
            { $sort: { avgPrice: -1 } }
        ]).toArray();
        console.log("📊 Average Book Price by Genre:");
        avgPriceByGenre.forEach(g => console.log(`  - ${g._id}: $${g.avgPrice.toFixed(2)} (${g.totalBooks} books)`));

        console.log("\n--- 7. AGGREGATION PIPELINE: Author with Most Books ---");
        const topAuthorByBooks = await booksCollection.aggregate([
            { $group: { _id: "$author", bookCount: { $sum: 1 } } },
            { $sort: { bookCount: -1 } },
            { $limit: 1 }
        ]).toArray();
        if (topAuthorByBooks.length > 0) {
            const author = topAuthorByBooks[0];
            console.log(`🏆 Author with Most Books: ${author._id} (${author.bookCount} books)`);
        } else {
            console.log("No authors found in the collection.");
        }

        console.log("\n--- 8. AGGREGATION PIPELINE: Books Grouped by Publication Decade ---");
        const booksByDecade = await booksCollection.aggregate([
            {
                $group: {
                    _id: { $concat: [{ $toString: { $subtract: ["$published_year", { $mod: ["$published_year", 10] }] } }, "s"] },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();
        console.log("📚 Books Grouped by Publication Decade:");
        booksByDecade.forEach(d => console.log(`  - ${d._id}: ${d.count} books`));

        console.log("\n--- 5. INDEXING ---");
        await booksCollection.createIndex({ title: 1 });
        console.log("✅ Created index on 'title' field.");

        console.log("\n--- 6. COMPOUND INDEX ---");
        await booksCollection.createIndex({ author: 1, published_year: 1 });
        console.log("✅ Created compound index on 'author' and 'published_year' fields.");

        const indexes = await booksCollection.indexes();
        console.log("📄 Current Indexes on 'books' Collection:", indexes);

        console.log("\n--- 7. SORTING ---");
        const booksAsc = await booksCollection.find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } }).sort({ price: 1 }).toArray();
        console.log("\n⬆️ Books Sorted by Price (Ascending):");
        booksAsc.forEach(book => console.log(`  - ${book.title} by ${book.author} ($${book.price})`));

        const booksDesc = await booksCollection.find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } }).sort({ price: -1 }).toArray();
        console.log("\n⬇️ Books Sorted by Price (Descending):");
        booksDesc.forEach(book => console.log(`  - ${book.title} by ${book.author} ($${book.price})`));

        // 🧠 NEW TASK 8: Demonstrating Index Performance with explain()
        console.log("\n--- 8. INDEX PERFORMANCE TEST (Using explain()) ---");

        const indexedExplain = await booksCollection.find({ title: "The Alchemist" }).explain("executionStats");
        console.log("\n📊 Indexed Query Explain Plan:");
        console.log(JSON.stringify(indexedExplain.executionStats, null, 2));

        const nonIndexedExplain = await booksCollection.find({ price: 10.99 }).explain("executionStats");
        console.log("\n📉 Non-Indexed Query Explain Plan:");
        console.log(JSON.stringify(nonIndexedExplain.executionStats, null, 2));

        console.log("\n✅ Query execution complete.");
    } catch (error) {
        console.error("❌ Error occurred:", error);
    } finally {
        await client.close();
        console.log("🔌 Connection closed.");
    }
}

executeQueries();


