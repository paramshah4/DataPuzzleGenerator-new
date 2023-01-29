console.log("ATTRIBUTES WE HAVE RECEIVED FROM USER: ", attributes);
let selected = [];
function prepareData() {
    var res = {};
    var derived = attributes['derived_attribute'];

    for (var d = 0; d < derived.length; d++) {

        var methodName = document.getElementById("method_" + d).value;
        if (methodName == null) {
            alert("Please give the Corresponding Method in .py file before generating the data")
            return
        }
        console.log("selected", selected)

        if (selected == null) {
            alert("Please choose from arguments before generating the data")
        }
        res[derived[d]] = {
            "parameters": selected,
            "method_name": methodName
        }
    }

    return res;
}

function server_call() {
    var derivedAttrInfo = prepareData();

    let formdata = new FormData();
    let number_of_tuples = document.getElementById("number_tuple").value;
    let jsondata = JSON.stringify(attributes);
    if (document.getElementById("py_file").files[0]) {
        formdata.append("py_file", document.getElementById("py_file").files[0]);
        var fName = document.getElementById("py_file").files[0].name;

        var moduleName = fName.split(".")[0];
    }
    else {
        alert("Please upload python file before generating the data")
        return
    }

    var res = {
        "derived_atts": derivedAttrInfo,
        "module_name": moduleName,
        "data_points": number_of_tuples,
        "attributes_data": jsondata
    }
    formdata.append("res", JSON.stringify(res))
    var SERVER_URL = window.location.protocol + "//" + window.location.host;
    var REST_API = SERVER_URL + "/generateData";
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", REST_API, true);
    xhttp.onload = function (e) {
        if (xhttp.readyState === 4) {
            if (xhttp.status === 200) {

                console.log("RESPONSE RECEIVED!");
                var data = JSON.parse(xhttp.responseText);

                if ("error" in data) {
                    alert(data["error"]);
                } else {
                    download_csv(data, name);
                }

                if (attributes['derived_attribute'].length > 0) {
                    document.getElementById("py_file").value = ""
                };
                console.log("FILE INPUT RESET!");
            } else {
                alert("Error Occured! Check logs");
                console.error("Server error: ", xhttp.statusText);
            }
        }
    };
    xhttp.onerror = function (e) {
        console.error("Error connecting to: ", SERVER_URL);
    };
    xhttp.send(formdata);

}

function download_csv(obj, fname) {
    console.log("obj:", obj)
    console.log("obj['data']", obj["data"])
    var data = obj["data"];
    var csv = '';
    var header = []
    var rows = []

    for (var x = 0; x < obj["cols"].length; x++) {
        csv += obj["cols"][x] + ",";
    }
    for (var x = 0; x < obj["cols"].length; x++) {
        header.push(obj["cols"][x]);
    }

    data.forEach(function (row) {
        rows.push(row)
    });
    console.log("rows")
    console.log(rows)

    if (csv.length > 0) {
        csv = csv.slice(0, -1);
    }

    csv += "\n";

    data.forEach(function (row) {
        csv += row.join(',');
        csv += "\n";
    });
    console.log(csv)
    let file = new File([csv], "fe.csv", {
        type: "text/plain",
    });
    var formdata = new FormData();
    formdata.append("file", file);
    // formdata.append("filename", document.getElementById("file_name").value)
    var SERVER_URL = window.location.protocol + "//" + window.location.host;
    var REST_CALL = SERVER_URL + "/downloadcsv";

    $.ajax({
        url: REST_CALL,
        data: formdata,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (data) {
            var date = new Date()
            var dd = String(date.getDate()).padStart(2, '0');
            var month = date.toLocaleString('default', {
                month: 'long'
            });
            if (data.includes("Error")) {
                filename = prompt(data);
                filename = "DataPuzzle-" + filename + "-csv-" + dd + month
            } else {
                if (data.includes("-")) {
                    filename = "DataPuzzle-" + data.split("-")[0] + "-csv-" + data.split("-")[1] + "-" + dd + month
                } else {
                    filename = "DataPuzzle-" + data.split("-")[0] + "-csv-" + dd + month
                }
            }

            saveAs(file, filename + ".csv");


        }
    });

}

function handleClick(cb) {
    if (cb.checked == true) {
        if (!selected.includes(cb.value)) {
            selected.push(cb.value)
            console.log("selected", selected)
        }

    }
    else {
        if (selected.includes(cb.value)) {
            selected.splice(selected.indexOf(cb.value), 1)
        }
    }
}

function onButtonClick() {


    var SERVER_URL = window.location.protocol + "//" + window.location.host;
    var REST_CALL = SERVER_URL + "/perfectpredictionmodel_numerictarget";
    var formData = new FormData();


    $.ajax({
        url: REST_CALL,
        type: 'POST',
        processData: false,
        contentType: false,
        data: formData,
    }).done(function (response) { //
        if (response.includes("Error")) {
            alert(response);
            var div = document.getElementById('server-results');
            console.log(div)
            div.setAttribute("style", "display:none;")

        } else {
            serverresult=document.getElementById('server-results')
            serverresult.setAttribute("style","display: block;margin-left: 30px;padding-top: inherit;")
            var message = '<h4>MSE is ' + response + ' </h4>'
            $("#server-results").html(message);
        }
    });
}
$(document).ready(function () {
    var derived = attributes['derived_attribute'];
    var base = attributes['base']
    var mainTable = document.getElementById("outerTable");
    var mainoutertable = document.getElementById("mainoutertable");
    mainoutertable.setAttribute("style", "border-collapse: separate;border-spacing: 1em;")
    var p = document.createElement("h4");
    p.innerHTML = "Upload Derived Attribute's Definition Code:"
    p.setAttribute("style", "padding-left: 100px")


    var inp = document.createElement("input");
    inp.setAttribute("name", "py_file");
    inp.setAttribute("id", "py_file");
    inp.setAttribute("type", "file");
    inp.setAttribute("value", "Upload Code");
    inp.setAttribute("accept", ".py");
    inp.setAttribute("style", "padding-left: 300px")
    mainTable.appendChild(p);
    var divforinput = document.createElement("div")
    divforinput.setAttribute("style", "padding-left: 100px")
    divforinput.appendChild(inp)
    mainTable.appendChild(divforinput);
    mainTable.appendChild(inp);
    for (var x = 0; x < derived.length; x++) {

        var r1 = document.createElement("tr");

        var r1c1 = document.createElement("td");
        r1c1.innerHTML = "Name of the Attribute:";

        var r1c2 = document.createElement("td");
        r1c2.innerHTML = derived[x];

        r1.appendChild(r1c1);
        r1.appendChild(r1c2);

        var r2 = document.createElement("tr");

        var r2c1 = document.createElement("td");
        r2c1.innerHTML = "Corresponding Method in .py file:";

        var r2c2 = document.createElement("td");
        var methodName = document.createElement("input");
        methodName.setAttribute("name", "method_name");
        methodName.setAttribute("id", "method_" + x);
        methodName.setAttribute("required", "required");

        r2c2.appendChild(methodName);

        r2.appendChild(r2c1);
        r2.appendChild(r2c2);

        var r3 = document.createElement("tr");

        var r3c1 = document.createElement("td");
        r3c1.innerHTML = "Arguments:";

        var r3c2 = document.createElement("td");

        // var baseDropdown = document.createElement("select");
        // baseDropdown.setAttribute("name", "func_argument");
        // baseDropdown.setAttribute("id", "arg_" + x);
        // baseDropdown.multiple = true;

        // for (var b = 0; b < base.length; b++) {
        //     var optTag = document.createElement("option");
        //     optTag.setAttribute("value", base[b]);
        //     optTag.setAttribute("id", "opt_" + x + "_" + b);

        //     var t = document.createTextNode(base[b]);
        //     optTag.appendChild(t);

        //     baseDropdown.appendChild(optTag);
        // }
        var parentElement = document.getElementById('myParentElement');
        var count = 0;
        for (var b = 0; b < base.length; b++) {
            count += 1;
            var newlabel = document.createElement("label")
            var checkbox = document.createElement("input");
            checkbox.id = 'box' + count;
            checkbox.type = 'checkbox';
            checkbox.onclick = handleClick(this);
            checkbox.setAttribute('onclick', 'handleClick(this);');
            checkbox.value = base[b]
            newlabel.innerHTML = base[b];
            parentElement.append(checkbox)
            newlabel.setAttribute("for", 'box' + count);
            parentElement.append(newlabel)
            var breakline = document.createElement("br");
            parentElement.append(breakline)

        }

        r3c2.appendChild(parentElement);

        r3.appendChild(r3c1);
        r3.appendChild(r3c2);

        mainTable.appendChild(r1);
        mainTable.appendChild(r2);
        mainTable.appendChild(r3);

        var hLine = document.createElement("hr");
        hLine.setAttribute("style", "width:230%");

        mainTable.appendChild(hLine);
    }





});