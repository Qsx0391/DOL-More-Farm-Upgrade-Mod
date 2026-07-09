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
        while (workTime >= 10 && updated) {
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
            // till + cultivator
            if (V.farmerCanTill) {
                for (let i = 0; i < plotsFarm.length; i++) {
                    let plot = plotsFarm[i];
                    let tillingTimeTemp = V.farm.cultivator && (!plot.greenhouse || V.farm.cultivator >=2) ? 15 :tillingTime;
                    if (tillingTimeTemp > workTime) break;
                    if (plot.stage === 0 && plot.till === 0) {
                        plot.till = 1;
                        workTime -= tillingTimeTemp;
                        updated = true;
                        console.log("till: " + i);
                    }
                }
            }
            // plant + seeder
            if (V.farmerCanPlant) {
                for (let i = 0; i < plotsFarm.length; i++) {
                    let plot = plotsFarm[i];
                    let planTime = V.farm.seeder && (!plot.greenhouse || V.farm.seeder >=2) ? 20 :180;
                    if (planTime > workTime) break;
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
                            workTime -= planTime;
                            updated = true;
                            console.log("plant: " + i + " " + plantType);
                        }
                    }
                }
            }
            // harvest + harvester
            if (V.farmerCanHarvest) {
                for (let i = 0; i < plotsFarm.length; i++) {
                    let plot = plotsFarm[i];
                    let harvestTime = V.farm.harvester && (!plot.greenhouse || V.farm.harvester >=2) ? 10 :60;
                    if (harvestTime > workTime) break;
                    if (plot.stage >= 5) {
                        let plantType = plot.plant;
                        if (!V.farm.stock[plantType]) {
                            V.farm.stock[plantType] = 0;
                        }
                        let tending_amount = random(10, Math.trunc(V.farm.farmer_skill / 2)+ 50) ;
                        if(V.farm.harvester >=3)
                            tending_amount = Math.trunc(V.farm.farmer_skill / 2) + random(10,50) ;
                        tending_amount *= setup.foodstuff[plantType].tending.yield_multiplier;
                        tending_amount *= 1 + (Math.clamp(plot.quality, 1, 4) - 1) * 0.2;
                        tending_amount = Math.trunc(tending_amount * V.settings.tendingYieldModifier);
                        if(tending_amount)
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
                        workTime -= harvestTime;
                        updated = true; 
                        console.log("harvest: " + i + " " + plantType + " " + tending_amount);
                    }
                }
            }
        }
    }
}
window.farmerTendingDay = farmerTendingDay;

function farmerSell() {
    if (!V.farmerCanSell || --V.farmerSellTimer > 0) {
        return;
    } 
    V.farmerSellTimer = 7;

    // 初始化农贸工厂数据
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
        if ((["truffles", "eggs", "milk"].includes(item) || ["produce", "vegetable", "fruit", "mushroom"].includes(setup.foodstuff[item].category)) && V.farm.stock[item] >= 250) {
            const amount = Math.floor(V.farm.stock[item] / 250) * 250;
            V.farm.stock[item] -= amount;
            console.log("sell: " + item + " " + amount);
             let Tkey = item;
                if(item === "eggs") Tkey = "chicken_egg";
                else if (item === "milk") Tkey = "bottle_of_milk";
                else if (item === "truffles") Tkey = "truffle";
            if (V.farmersProduce.selling[Tkey] === undefined) {
                V.farmersProduce.selling[Tkey] = amount;
            } else {
                V.farmersProduce.selling[Tkey] += amount;
            }
        }
    }
};
window.farmerSell = farmerSell;


function calcTillingTime() {
    let baseTime = 360;
    return Math.trunc(baseTime - V.farm.farmer_skill * 3 / 10);
}
window.calcTillingTime = calcTillingTime;

function getPlantableList() {
    let result = [];
    V.farmerPlantable.forEach(each => {
        let plant = setup.foodstuff[each];
        if (plant.tending?.seasons?.includes(Time.season)) {
            result.push(each);
        }
    })
    return result;
}
window.getPlantableList = getPlantableList;
