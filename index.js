import express from "express"
// import cors from "cors";
const app = express();
// app.use(cors());


app.get("/api/products", (req, res) => {
    const products = [
        {
            id: 1,
            name: "table wooden",
            price: 200,
        },
        {
            id: 2,
            name: "table glass",
            price: 200,
        },
        {
            id: 3,
            name: "table fiber",
            price: 200,
        },
        {
            id: 4,
            name: "table plastic",
            price: 2500,
        },
        {
            id: 5,
            name: "table metal",
            price: 200,
        },
    ]

    // http://localhost:3000/api/products?search=metal

    if (req.query.search) {
        const filteredProducts = products.filter((product) => product.name.includes(req.query.search))
        res.send(filteredProducts);
        return;
    }

    setTimeout(() => {
        res.send(products)
    }, 3000)
})

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})