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

    for (let plantType in V.farm.stock) {
        if (V.farm.stock[plantType] >= 250) {
            const amount = Math.floor(V.farm.stock[plantType] / 250) * 250;
            V.farm.stock[plantType] -= amount;
            console.log("sell: " + plantType + " " + amount);
            if (V.farmersProduce.selling[plantType] === undefined) {
                V.farmersProduce.selling[plantType] = amount;
            } else {
                V.farmersProduce.selling[plantType] += amount;
            }
        }
    }
};
window.farmerSell = farmerSell;