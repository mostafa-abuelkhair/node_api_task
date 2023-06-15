
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

        console.log(categorized );
        
   }
    catch (error) {console.log(error)}
};

getData();
