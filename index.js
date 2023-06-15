
let categorized = [];

 const getData = async () => {
   try {

        const res = await fetch("https://api.escuelajs.co/api/v1/products");

        const products = await res.json();
        
        products.forEach( p => {
            let index = categorized.findIndex( e=> e.category.id === p.category.id);
            const {category: _, ...newProduct} = p;
            if(index == -1){categorized.push( {category : p.category , products: [newProduct] } )}
            else{ categorized[index].products.push(newProduct) }
        });


       const res2 = await fetch("https://api.exchangerate.host/latest?base=USD");

       const data = await res2.json();

       const rate = data.rates.EGP;

       categorized.forEach( c => { c.products.forEach( p=>{ p.price = p.price*rate } ) }  );

       console.log(categorized);
    
   }
    catch (error) {console.log(error)}
};

getData();
