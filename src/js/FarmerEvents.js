function farmerTendingDay() {
    if (!V.farm || !V.farm.farmer) {
        return;
    }
    let workTime = 8 * 60;
    let plotsFarm = V.plots.farm;
    let tillingTime = calcTillingTime();
    let plantableList = getPlantableList();
    if (V.farm.farmer) {
        let updated = true;
        while (workTime >= 60 && updated) {
            updated = false;
            // water
            if (V.farmerCanWater) {
                for (let i = 0; i < plotsFarm.length && workTime >= 60; i++) {
                    let plot = plotsFarm[i];
                    if (plot.stage >= 1 && plot.stage < 5 && plot.water === 0) {
                        plot.water = 1;
                        workTime -= 60;
                        updated = true;
                        console.log("water: " + i);
                    }
                }
            }
            // till
            if (V.farmerCanTill) {
                for (let i = 0; i < plotsFarm.length && workTime >= tillingTime; i++) {
                    let plot = plotsFarm[i];
                    if (plot.stage === 0 && plot.till === 0) {
                        plot.till = 1;
                        workTime -= tillingTime;
                        updated = true;
                        console.log("till: " + i);
                    }
                }
            }
            
            // plant
            if (V.farmerCanPlant) {
                for (let i = 0; i < plotsFarm.length && workTime >= 60; i++) {
                    let plot = plotsFarm[i];
                    if (plot.stage === 0 && plot.till >= 1) {
                        let plantType, n;
                        if (plot.greenhouse && (n = V.farmerPlantable.length) > 0) {
                            plantType = V.farmerPlantable[random(n - 1)];
                        } else if ((n = plantableList.length) > 0) {
                            plantType = plantableList[random(n - 1)];
                        }
                        if (plantType) {
                            plantSeedsInPlot(plot, plantType);
                            plot.water = V.farm.irrigation > i ? 1 : 0;
                            workTime -= 60;
                            updated = true;
                            console.log("plant: " + i + " " + plantType);
                        }
                    }
                }
            }
            
            // harvest
            if (V.farmerCanHarvest) {
                for (let i = 0; i < plotsFarm.length && workTime >= 60; i++) {
                    let plot = plotsFarm[i];
                    if (plot.stage >= 5) {
                        let plantType = plot.plant;
                        if (V.farm.stock[plantType] === undefined) {
                            V.farm.stock[plantType] = 0;
                        }
                        let tending_amount = random(10, Math.trunc(V.farm.farmer_skill / 2)) + 50;
                        tending_amount *= setup.plants[plantType].multiplier;
                        tending_amount *= 1 + (Math.clamp(plot.quality, 1, 4) - 1) * 0.2;
                        tending_amount = Math.trunc(tending_amount * V.tending_yield_factor);
                        V.farm.stock[plantType] += tending_amount;
                        if (plot.baseQuality && !V.backgroundTraits.includes("greenthumb")) {
                            if (plot.fertiliserDecay > 0) {
                                plot.fertiliserDecay--;
                            }
                            if (plot.fertiliserDecay === 0 && plot.quality > plot.baseQuality) {
                                plot.quality--;
                                if (plot.quality > plot.baseQuality) {
                                    plot.fertiliserDecay = 3;
                                }
                            }
                        }
                        plot.water = 0;
                        plot.days = 0;
                        plot.plant = "none";
                        plot.till = 0;
                        plot.stage = 0;
                        workTime -= 60;
                        updated = true; 
                        console.log("harvest: " + i + " " + plantType + " " + tending_amount);
                    }
                }
            }
        }
    }
}
window.farmerTendingDay = farmerTendingDay;

// 农夫运送农产品到农贸工厂
function farmerSell() {
    if (!V.farmerCanSell || --V.farmerSellTimer > 0) {
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

function calcTillingTime() {
    let baseTime = 6 * 60;
    return Math.trunc(baseTime - V.farm.farmer_skill * 3 / 10);
}
window.calcTillingTime = calcTillingTime;

function getPlantableList() {
    let result = [];
    V.farmerPlantable.forEach(each => {
        let plant = setup.plants[each];
        if (plant.season.includes(Time.season)) {
            result.push(each);
        }
    })
    return result;
}
window.getPlantableList = getPlantableList;
