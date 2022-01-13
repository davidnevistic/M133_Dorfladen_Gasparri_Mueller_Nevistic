function GetTotalItems(itemList)
{
    console.log("GetTotalItems performed");
    let totalItems = 0;
    for(let i = 0; i < itemList.length; i++)
    {
        if(context.cookies.get(itemList[i].id))
        {
            totalItems += parseInt(context.cookies.get(itemList[i].id));
        }
    }
    return totalItems;
}