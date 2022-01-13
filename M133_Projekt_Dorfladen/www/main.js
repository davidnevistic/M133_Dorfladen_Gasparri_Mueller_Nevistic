'use strict';

import { Application , Router, renderFileToString} from "./deps.js";
const itemList = JSON.parse(Deno.readTextFileSync(Deno.cwd()+"/assets/produkte.json")); 
const router = new Router();

router.get("/", async (context) => {
    try {
        console.log("\nhome:");

        // count total items and save to cookie
        let alleItems = 0;
        for(let i = 0; i < itemList.length; i++)
        {
            if(context.cookies.get(itemList[i].id))
            {
                alleItems += parseInt(context.cookies.get(itemList[i].id));
            }
        }
        context.cookies.set("alleItems", alleItems);

        context.response.body = await renderFileToString(Deno.cwd() + 
        "/frontend/home.ejs", { itemList: itemList, alleItems: alleItems });
        context.response.type = "html";
    } catch (error) {
        console.log(error);
    }
});

router.get("/test", async (context) => {
    try {
        console.log("\ntest:");
        const alleItems = (context.cookies.get("alleItems")) ? context.cookies.get("alleItems") : 0;
        context.response.body = await renderFileToString(Deno.cwd() + 
        "/frontend/test.ejs", { alleItems: alleItems });
        context.response.type = "html";           
    } catch (error) {
        console.log(error);
    }
});

router.post("/info", async (context) => {
    try {
        console.log("\ninfo:");
        const body = await context.request.body().value;
        console.log("Body context: "+body);
        const fName = body.get("first-name");
        console.log("Firstname: "+fName);
        context.response.body = await renderFileToString(Deno.cwd() + 
            "/frontend/info.ejs", { firstName: fName, itemList: items });
        context.response.type = "html";
    
    } catch (error) {
        console.log(error);
    }
});

router.post("/Produkt", async (context) => {
    try {
        console.log("\nProdukt:");
        const body = await context.request.body().value;
        console.log("Body context: "+body);
        const produktID = body.get("produktID");
        console.log("Produkt ID: "+produktID);
        const alleItems = (context.cookies.get("alleItems")) ? context.cookies.get("alleItems") : 0;
        context.response.body = await renderFileToString(Deno.cwd() + 
            "/frontend/produkt.ejs", { produktID: produktID, itemList: itemList, alleItems: alleItems });
        context.response.type = "html";
    
    } catch (error) {
        console.log(error);
    }
});

router.post("/addProdukt", async (context) => {
    try {
        console.log("\naddProdukt:");
        const body = await context.request.body().value;
        const produktID = body.get("produktID");
        const menge = parseInt(body.get("menge"));

        console.log("Produkt Id: "+produktID+", menge: "+menge);

        if(!context.cookies.get(produktID)){
            console.log("produktID undefined");
            context.cookies.set(produktID, menge);
        }
        else{
            console.log("produktID defined");
            const temporaer = parseInt(context.cookies.get(produktID))+menge;
            context.cookies.set(produktID, temporaer);
        }

        //Cookies are delayed by one Cycle, but work (?)
        console.log("Cookie content of "+produktID+": "+context.cookies.get(produktID));
        context.response.redirect("http://localhost:8000");
    } catch (error) {
        console.log(error);
    }
});

router.post("/cart", async (context) => {
    try {
        console.log("\ncart:");
        let itemDictionary = new Map();
        for(let i = 0; i< itemList.length; i++){
            if(context.cookies.get(itemList[i].id)){
                itemDictionary.set(itemList[i].id, {itemName: itemList[i].ProduktName, itemCart: context.cookies.get(itemList[i].id), itemOffer: itemList[i].specialOffer});
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
        console.log("\ncheckout: ");
        context.response.redirect("http://localhost:8000");
    } catch (error) {
        console.log(error);
    }

});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });