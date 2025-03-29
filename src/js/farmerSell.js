// 农夫运送农产品到农贸工厂
function farmerSell() {
    if (!V.farm.farmer || !V.farmerCanSell || --V.farmerSellTimer > 0) {
        return;
    } 
    V.farmerSellTimer = 7;

    // 初始化农贸工厂数据（如果需要）
    if (V.farmersProduce === undefined) {
        V.farmersProduce = {
            selling: {},
            toSell: {},
            money: 0,
            sold: 0,
            totalSold: 0
        };
    }

    for (let item in V.farm.stock) {
        if ((["truffles", "eggs", "milk"].includes(item) || ["produce", "vegetable", "fruit", "shroom"].includes(setup.plants[item].type)) && V.farm.stock[item] >= 250) {
            const amount = Math.floor(V.farm.stock[item] / 250) * 250;
            V.farm.stock[item] -= amount;
            console.log("sell: " + item + " " + amount);
            if (V.farmersProduce.selling[item] === undefined) {
                V.farmersProduce.selling[item] = amount;
            } else {
                V.farmersProduce.selling[item] += amount;
            }
        }
    }
};
window.farmerSell = farmerSell;