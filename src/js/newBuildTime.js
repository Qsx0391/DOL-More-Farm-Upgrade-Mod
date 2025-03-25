function calc_build_time(buildTime) {
	if (State.variables.farm.construction_machinery >= 1) {
		return Math.ceil(buildTime / 2);
	} else {
		return buildTime;
	}
} 
window.calc_build_time = calc_build_time;

function get_build_time_str(buildTime) {
	const numStrs = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
	const realBuildTime = calc_build_time(buildTime);
	if (realBuildTime % 7 === 0) {
		return numStrs[realBuildTime / 7] + "个星期";
	} else if (realBuildTime <= 10) {
		return numStrs[realBuildTime] + "天时间";
	} else {
		return realBuildTime + "天时间";
	}
}
window.get_build_time_str = get_build_time_str;
