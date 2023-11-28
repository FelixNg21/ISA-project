const version = "v2";
const url = `https://elainesweb.com/COMP4537/project/${version}`;



const viewEndpointStats = () => {
  const xhttp = new XMLHttpRequest();
  xhttp.withCredentials = true;
  let endpoint = `/endpoint`;
  xhttp.open("GET", url + endpoint, true);
  xhttp.send();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {

        // Parse JSON data
        var responseList = JSON.parse(this.response);

        // Create a table element
        var table = document.createElement("table");

        // Create table header
        var thead = table.createTHead();
        var headerRow = thead.insertRow();
        Object.keys(responseList[0]).forEach(function (key) {
          var th = document.createElement("th");
          th.appendChild(document.createTextNode(key));
          headerRow.appendChild(th);
        });

        // Create table body
        var tbody = table.createTBody();
        responseList.forEach(function (item) {
          var row = tbody.insertRow();
          Object.values(item).forEach(function (value) {
            var cell = row.insertCell();
            cell.appendChild(document.createTextNode(value));
          });
        });
        const tableContainer = document.getElementById('table-container');
        const existingTable = tableContainer.querySelector('table');
        if (existingTable){
            tableContainer.replaceChild(table, existingTable)
        } else {
            tableContainer.appendChild(table)
        }
      }
    }
  };
};

const viewApikeyUsage = () => {
  const xhttp = new XMLHttpRequest();
  xhttp.withCredentials = true;
  let endpoint = '/apiusages';
  xhttp.open("GET", url+endpoint, true)
  xhttp.send();
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4){
      if (this.status == 200){
        //parse JSON data
        var responseList = JSON.parse(this.response);

        //create table element
        var table = document.createElement("table");

        // Create table header
        var thead = table.createTHead();
        var headerRow = thead.insertRow();
        Object.keys(responseList[0]).forEach(function (key) {
          var th = document.createElement("th");
          th.appendChild(document.createTextNode(key));
          headerRow.appendChild(th);
        });

        // Create table body
        var tbody = table.createTBody();
        responseList.forEach(function (item) {
          var row = tbody.insertRow();
          Object.values(item).forEach(function (value) {
            var cell = row.insertCell();
            cell.appendChild(document.createTextNode(value));
          });
        });

        const tableContainer = document.getElementById('table-apicalls')
        const existingTable = tableContainer.querySelector('table');
        if (existingTable){
            tableContainer.replaceChild(table, existingTable)
        } else {
            tableContainer.appendChild(table)
        }
      }
    }
  }
}
