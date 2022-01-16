'use strict';

import { Application , Router, send, renderFileToString} from "./deps.js";
const itemList = JSON.parse(Deno.readTextFileSync(Deno.cwd()+"/assets/products.json")); 
const router = new Router();

router.get("/", async (context) => {
    try {
        context.cookies.set("totalItems", null);
        console.log("\nhome:");

        // count total items and save to cookie
        let totalItems = 0;
        for(let i = 0; i < itemList.length; i++)
        {
            if(context.cookies.get(itemList[i].id))
            {
                totalItems += parseInt(context.cookies.get(itemList[i].id));
            }
        }
        context.cookies.set("totalItems", totalItems);

        context.response.body = await renderFileToString(Deno.cwd() + 
        "/frontend/home.ejs", { itemList: itemList, totalItems: totalItems });
        context.response.type = "html";
    } catch (error) {
        console.log(error);
    }
});

router.post("/changeAmount", async (context) => {
    try {
        console.log("\nchangeAmount:");
        const body = await context.request.body().value;

        if(body.get("prductId-decrease"))
        {
            const item = body.get("prductId-decrease");
            const value = parseInt(context.cookies.get(item)) > 0 ? parseInt(context.cookies.get(item))-1 : 0;
            context.cookies.set(item, value);
        }
        else if(body.get("prductId-increase"))
        {
            const item = body.get("prductId-increase");
            const value = parseInt(context.cookies.get(item))+1;
            context.cookies.set(item, value);
        }

        context.response.redirect("http://localhost:8000/cart");
    } catch (error) {
        console.log(error);
    }
});

router.post("/product", async (context) => {
    try {
        console.log("\nproduct:");
        const body = await context.request.body().value;
        console.log("Body context: "+body);
        const productId = body.get("productId");
        console.log("Product ID: "+productId);
        const totalItems = (context.cookies.get("totalItems")) ? context.cookies.get("totalItems") : 0;
        context.response.body = await renderFileToString(Deno.cwd() + 
            "/frontend/product.ejs", { productId: productId, itemList: itemList, totalItems: totalItems });
        context.response.type = "html";
    
    } catch (error) {
        console.log(error);
    }
});

router.post("/addProduct", async (context) => {
    try {
        console.log("\naddProduct:");
        const body = await context.request.body().value;
        const productId = body.get("productId");
        const amount = parseInt(body.get("amount"));

        console.log("Product Id: "+productId+", Amount: "+amount);

        if(!context.cookies.get(productId)){
            console.log("productId undefined");
            context.cookies.set(productId, amount);
        }
        else{
            console.log("productId defined");
            const temp = parseInt(context.cookies.get(productId))+amount;
            context.cookies.set(productId, temp);
        }

        //Cookies are delayed by one Cycle, but work (?)
        console.log("Cookie content of "+productId+": "+context.cookies.get(productId));
        context.response.redirect("http://localhost:8000");
    } catch (error) {
        console.log(error);
    }
});

router.get("/cart", async (context) => {
    try {
        console.log("\ncart:");
        let itemDictionary = new Map();
        for(let i = 0; i< itemList.length; i++){
            if(context.cookies.get(itemList[i].id)){
                itemDictionary.set(itemList[i].id, {itemName: itemList[i].productName, itemCart: context.cookies.get(itemList[i].id), itemOffer: itemList[i].specialOffer});
            }
        }
        context.response.body = await renderFileToString(Deno.cwd() + 
            "/frontend/cart.ejs", { itemDictionary: itemDictionary });
        context.response.type = "html";
    } catch (error) {
        console.log(error);
    }
});

router.post("/checkout", async (context) => {
    try {
        console.log("\nLogOut:");
        context.response.body = await renderFileToString(Deno.cwd() + 
        "/frontend/LogOut.ejs", { });
       
        context.response.type = "html";
    } catch (error) {
        console.log(error);
    }
});

router.post("/finish", async (context) => {
    try {
        const body = await context.request.body().value;
        const fname = body.get("first-name");
        const lname = body.get("last-name");
        const mail = body.get("mail-adress");
        console.log(context.cookies);

        for(let i = 0; i < itemList.length; i++)
        {
            if(context.cookies.get(itemList[i].id))
            {
                context.cookies.set(itemList[i].id, 0);
            }
        }
        context.response.body = await renderFileToString(Deno.cwd() + 
            "/frontend/finish.ejs", { firstName: fname, lastName: lname });
        context.response.type = "html";
    } catch (error) {
        console.log(error);
    }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (context) => {
    await send(context, context.request.url.pathname, {
        root: `${Deno.cwd()}`,
    });
}); 


await app.listen({ port: 8000 });