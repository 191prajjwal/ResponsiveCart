let productData;



function increment()
{
    
}

async function fetchData(){
    let data = await fetch("https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889")

    productData = await data.json()
    console.log(productData.items[0])

    let img= document.getElementById("productIMG")

  img.children[0].attributes[0].value=productData.items[0].image

  let name = document.getElementById("productName")
  name.innerHTML=productData.items[0].product_title

 let price= document.getElementById("price")

 price.innerHTML= `Rs. ${productData.items[0].price.toFixed(2).number.toLocaleString('en-US')}`

}

fetchData()

