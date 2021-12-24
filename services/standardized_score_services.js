const math = require('mathjs');

function get_statistics_info(arr) {
    let std = math.std(arr);
    let mean = math.mean(arr);
    return { mean: mean, std: std}
}

function get_standardized_score(value, mean, std) {
    let z_score = (parseFloat(value) - parseFloat(mean)) / parseFloat(std);
    let t_score = z_score * 150 + 500;
    if (t_score > 1000){
        return 1000;
    }
    return t_score
}

let array = [6, 7, 7, 12.21, 13, 13, 15.123, 16, 19, 22]
let a = get_statistics_info(array);
// console.log(a.mean, a.std)
let score = get_standardized_score(35, a.mean, a.std);
console.log(score)