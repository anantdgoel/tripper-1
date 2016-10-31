module.exports = function(status)  {
  if (!status) {
    status = "development";
  }

  var uri = {
    development:"https://tripper-1.herokuapp.com/",
    production:"https://tripper-1.herokuapp.com/"
  }


  return {
          uri:uri[status],
          status:status
        }
}
