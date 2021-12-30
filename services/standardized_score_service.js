const math = require('mathjs');

module.exports = {
    get_statistics_info: (arr) => {
        let std = math.std(arr);
        let mean = math.mean(arr);
        return { mean: mean, std: std}
    },

    get_standardized_score: (value, mean, std) => {
        if (std == 0 || (value == 0 && mean == 0 && std == 0)) {
            return 0;
        }
        let z_score = (parseFloat(value) - parseFloat(mean)) / parseFloat(std);
        let t_score = z_score * 150 + 500;
        if (t_score < 0){
            return 0;
        }
        if (t_score > 1000){
            return 1000;
        }
        return t_score
    }
}