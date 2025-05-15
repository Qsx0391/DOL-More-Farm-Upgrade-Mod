function newDailyFarmEvents() {
    if (!V.farm) {
        return;
    }
    if (V.farm.farmer) {
        farmerSell();
        if (Time.weekDay === 1) {
            V.farm.farmer_unpaid++;
		    V.farm.farmer_patience = 0;
        }
    }
    if (V.farm.compost >= 1) {
        V.compost_timer--;
        if (V.compost_timer < 1) {
            V.fertiliser_stored++;
            V.compost_timer = 7;
        }
    }
    if (V.farm.stock && V.farm.cold_store >= 1) {
        V.farm.stock.truffles = Math.ceil(V.farm.stock.truffles * 1.25);
		V.farm.stock.milk = Math.ceil(V.farm.stock.milk * 1.25);
		V.farm.stock.eggs = Math.ceil(V.farm.stock.eggs * 1.25);
        V.farm.stock.cream = Math.ceil(V.farm.stock.cream * 1.25);
    }
    if (V.farm_stage >= 9) {
		if (V.lurkers_stored >= 1 || (V.farm.laboratory >= 1 && V.flowers_stored >= 1000)) {
			V.farm.still_timer--;
			if (V.farm.still_timer < 1) {
				if (V.lurkers_stored >= 1) { 
                    V.lurkers_stored--; 
                } else { 
                    V.flowers_stored -= 1000; 
                }
				V.phials_stored++;
				V.farm.still_timer = 7;
				V.farm.still_timer = V.farm.laboratory >= 1 ? 1 : 7;
			}
            if (V.lurkers_stored >= 1) {
                V.farm.still_timer++;
            }
		}
	}
}
window.newDailyFarmEvents = newDailyFarmEvents;