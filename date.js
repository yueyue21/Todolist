//jshint esversion:6

//console.log(module);

//module.exports ="hello";

//module.exports = getDate;
module.exports.getDate = function () {
  const date = new Date();
  const option = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  return today = date.toLocaleDateString("en-US", option);

}

module.exports.getDay = getDay;
function getDay() {
  const date = new Date();
  const option = {
    weekday: "long"
  };

  return today = date.toLocaleDateString("en-US", option);
}
