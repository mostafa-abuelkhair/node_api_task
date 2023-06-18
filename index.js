
let http = require('http');
let url = require('url');
let yup = require('yup');

const productScheme = yup.object({
        title: yup.string().required(),
        price: yup.number().required(),
        description: yup.string().required(),
        categoryId: yup.number().required(),
        images: yup.array()
  });

let categorized = [];

const getData = async (req,resUser) => {
   try {

        const res = await fetch("https://api.escuelajs.co/api/v1/products");

        const products = await res.json();
        
        products.forEach( p => {
            let index = categorized.findIndex( e=> e.category.id === p.category.id);
            const {category: _, ...newProduct} = p;
            if(index == -1){categorized.push( {category : p.category , products: [newProduct] } )}
            else{ categorized[index].products.push(newProduct) }
        });


        const cur = url.parse(req.url, true).query.cur;

        
        const res2 = await fetch("https://api.exchangerate.host/latest?base=USD");

        const data = await res2.json();

        const rate = data.rates[cur];

        if (rate === undefined){resUser.end("currency not found")}
        else {
            categorized.forEach( c => { c.products.forEach( p=>{ p.price = p.price*rate } ) }  );

            resUser.setHeader("Content-Type", "application/json");
            resUser.end(JSON.stringify(categorized));
         }

   }
    catch (error) {console.log(error)}
};


const postProduct =  async (product,resUser)=>{

    const res = await fetch("https://api.escuelajs.co/api/v1/products",{
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

    const product_response = await res.json();

    resUser.setHeader("Content-Type", "application/json");
    resUser.end( JSON.stringify(product_response) );

}




const server = http.createServer((req, res) => {

    const path = url.parse(req.url, true).pathname;

    if (path==="/products"){

        const method = req.method;
        
        if (method==="GET"){ getData(req,res); }

        else if(method==="POST"){

            const chunks = [];
            req.on("data", (chunk) => {
              chunks.push(chunk);
            });

            req.on("end", () => {
                try{

                    const product = productScheme.validateSync(JSON.parse(chunks.toString()), {
                        strict: true,
                      });
        
                    postProduct(product,res); 
   
                }
                catch(error){
                    res.writeHead(400);
                    res.end(error.toString());
                }
    
            });

        }
        
    }
    else{
        res.writeHead(404);
        res.end("path not found, use /products path to get or post products ");
    }


})


server.listen(8080, () => {
    console.log("SERVER is running on http://localhost:8080");
  });