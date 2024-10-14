let data;
const getDataButton = document.getElementById('get-data')
const downloadDataButton = document.getElementById('download-data')

const resultsDiv = document.getElementById("results");

function getFormData() {
  const location = document.getElementById("location").value;
  const radius =
    document.getElementById("radius").value ||
    document.getElementById("radius").options[0].value;
  const minPrice =
    document.getElementById("minPrice").value ||
    document.getElementById("minPrice").options[0].value;
  const maxPrice =
    document.getElementById("maxPrice").value ||
    document.getElementById("maxPrice").options[0].value;
  const minBedrooms =
    document.getElementById("minBedrooms").value ||
    document.getElementById("minBedrooms").options[0].value;
  const maxBedrooms =
    document.getElementById("maxBedrooms").value ||
    document.getElementById("maxBedrooms").options[0].value;
  const propertyTypes =
    document.getElementById("propertyTypes").value ||
    document.getElementById("propertyTypes").options[0].value;
  const maxDaysSinceAdded =
    document.getElementById("maxDaysSinceAdded").value ||
    document.getElementById("maxDaysSinceAdded").options[0].value;

  const formData = {
    location,
    radius,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    propertyTypes,
    maxDaysSinceAdded,
  };

  console.log(formData);
  return formData;
}
function generateCSV(data) {
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));

  data.forEach((row) => {
    const values = headers.map((header) => {
      const escaped = ("" + row[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
}

function downloadCSV(data, filename = "properties.csv") {
  const csvData = generateCSV(data);
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  a.click();
  window.URL.revokeObjectURL(url);
}

function generateResultsTable() {

  if (!resultsDiv) {
    console.error('No element found with ID "results"');
    return;
  }
  // Filter out duplicates by propertyName and price
  const uniqueData = Array.from(
    new Map(data.map((item) => [item.propertyName + item.price, item])).values()
  );

  // Calculate total number of properties and average property price
  const totalProperties = uniqueData.length;
  const totalPrices = uniqueData.reduce(
    (acc, curr) => acc + (parseInt(curr.price) || 0),
    0
  );

  // Calculate average Property Price and create span
  const averagePrice =  totalProperties > 0 ? (totalPrices / totalProperties).toFixed(0).toLocaleString() : 0;
  const avgPriceSpan = document.createElement("span");
 
  // Calculate average price based on bedrooms and put it in an object
  const bedroomPrices = {};

  uniqueData.forEach(item => {
    const bedrooms = item.bedrooms;
    const price = parseInt(item.price) || 0;

    if (bedroomPrices[bedrooms]) {
      bedroomPrices[bedrooms].totalPrice += price;
      bedroomPrices[bedrooms].count += 1;
    } else {
      bedroomPrices[bedrooms] = {
        totalPrice: price,
        count: 1
      };
    }
  });

  const averagePricesByBedrooms = {};

  Object.keys(bedroomPrices).forEach(bedrooms => {
    averagePricesByBedrooms[bedrooms] = (bedroomPrices[bedrooms].totalPrice / bedroomPrices[bedrooms].count).toFixed(0);
  });

  avgPriceSpan.textContent = `Average Price: £${averagePrice}`;
  
  // Create a div to display average price by bedrooms
  const avgPriceByBedroomsDiv = document.createElement('div');

  avgPriceByBedroomsDiv.classList.add('average-prices');
  avgPriceByBedroomsDiv.innerHTML = '<h3>Average Price by Number of Bedrooms:</h3>';
  avgPriceByBedroomsDiv.appendChild(avgPriceSpan)

  Object.keys(averagePricesByBedrooms).forEach(bedrooms => {
    const s = document.createElement('span');
    s.textContent = ` | ${bedrooms} Bedrooms: £${averagePricesByBedrooms[bedrooms]}`;
    avgPriceByBedroomsDiv.appendChild(s);
  });

 

  // Create total properties 
  const totalP = document.createElement("p");
  totalP.classList.add('total-properties')
  totalP.textContent = `Total Properties: ${totalProperties}`;
    

  // Create the table element
  const table = document.createElement("table");
  table.setAttribute("border", "1");

  // Create the table header row
  const headerRow = document.createElement("tr");
  const headers = ["Property Name", "Price", "Type", "Bedrooms", "Bathrooms", "Link"];
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Create table rows for each data item
  data.forEach(item => {
    const row = document.createElement('tr');
    Object.values(item).forEach((value, index) => {
      const td = document.createElement('td');
      if (index === headers.length - 1) { // Last column, add link
        const link = document.createElement('a');
        link.href = value;
        link.textContent = 'View Property';
        link.target = '_blank';
        td.appendChild(link);
      } else {
        td.textContent = value;
      }
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  // Clear any existing content and append the new table
  resultsDiv.innerHTML = "";

  resultsDiv.appendChild(totalP);
  resultsDiv.appendChild(avgPriceByBedroomsDiv);
  resultsDiv.appendChild(table);
}
function addSpinner(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`No element found with ID "${containerId}"`);
    return;
  }

  const spinnerDiv = document.createElement('div');
  spinnerDiv.id = 'lds-spinner';
  spinnerDiv.className = 'lds-spinner';
  for (let i = 0; i < 12; i++) {
    const innerDiv = document.createElement('div');
    spinnerDiv.appendChild(innerDiv);
  }
  container.appendChild(spinnerDiv);
}

document.getElementById("get-data").addEventListener("click", async () => {
  getDataButton.disabled = true;
  const formData = getFormData();
  if (formData.location === "") return // exit if no location
  // show loading spinner
  resultsDiv.innerHTML = "";


  addSpinner('results')
  try {
    const response = await fetch("http://localhost:3000/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    r = await response.json();
    data = r.data; // data is global scoped above, so we can use in generateCSV

    console.log("Server response:", data);
    getDataButton.disabled = false;
    downloadDataButton.disabled = false
    downloadDataButton.classList.add('download-button-enabled')

    generateResultsTable(data);
  } catch (error) {
    console.error("Error sending data:", error);
    getDataButton.disabled = false;
    downloadDataButton.disabled = false
  }
});

document.getElementById("download-data").addEventListener("click", () => {
  if (data) downloadCSV(data);
  else console.log("no data");
});
