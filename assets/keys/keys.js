module.exports = function(status)  {
  if (!status) {
    status = "development";
  }

  var uri = {
    development:"http://localhost:4994",
    production:"http://tripper.shub.club"
  }


  return {
          uri:uri[status],
          status:status
        }
}
