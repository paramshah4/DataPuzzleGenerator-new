var totalAttribute=0;
var x = 1;
function display(val, ref, target) {
            if (target == 'old') {
                var idOfRadio = ref.id.split("_")[1];

                var x = document.getElementById("value_form_" + idOfRadio);
                var y = document.getElementById("num_form_" + idOfRadio);

                if (val == 1) {
                    x.style.display = 'inherit';
                    y.style.display = 'none';
                } else {
                    if (document.getElementById("derived_radio_" + idOfRadio).checked) {
                        document.getElementById("new_lower_" + idOfRadio).disabled = true;
                        document.getElementById("new_upper_" + idOfRadio).disabled = true;
                    } else {
                        document.getElementById("new_lower_" + idOfRadio).disabled = false;
                        document.getElementById("new_upper_" + idOfRadio).disabled = false;
                    }
                    x.style.display = 'none';
                    y.style.display = 'inherit';
                }
            } else if (target == 'derived') {
                var idOfRadio = ref.getAttribute("attrid");
                var isNumChecked = document.getElementById("num_" + idOfRadio).checked;

                var lowerLim = document.getElementById("new_lower_" + idOfRadio);
                var upperLim = document.getElementById("new_upper_" + idOfRadio);

                if (val == 1 && isNumChecked) {
                    lowerLim.disabled = true;
                    upperLim.disabled = true;
                } else if (val == 0 && isNumChecked) {
                    lowerLim.disabled = false;
                    upperLim.disabled = false;
                }
            }
        }

function addAttribute() {
            if (totalAttribute > 0) {
                var res = validateFirst(totalAttribute - 1);

                if (res.length > 0) {
                    alert(res);
                    return;
                }
            }

            var mainTable = document.getElementById("outerTable");
            var div = document.createElement("div");
            div.setAttribute("style", "border: 1px solid;padding: 10px; box-shadow: 5px 10px 8px #888888;margin-top: 15px;");

            div.setAttribute("id", "childdiv" + x);
            x += 1;

            //First Row of the form
            var r1 = document.createElement("tr");

            var r1c1 = document.createElement("td");
            r1c1.innerHTML = "Name of the Attribute:";

            var r1c2 = document.createElement("td");
            var attrName = document.createElement("input");
            attrName.setAttribute("name", "attr_name");
            attrName.setAttribute("maxlength", "12");
            attrName.setAttribute("id", "attr_name_" + totalAttribute);
            attrName.setAttribute("required", "required");

            r1c2.appendChild(attrName);
            r1c2.setAttribute("style", "width:360px");

            r1.appendChild(r1c1);
            r1.appendChild(r1c2);
            div.appendChild(r1);

            var r5 = document.createElement("tr");
            var r5c1 = document.createElement("td");
            var btn = document.createElement("button");
            btn.innerHTML = "Remove the attribute";
            btn.type = "button";
            btn.setAttribute("class", "btn-remove-attr");

            function f(id) {
                console.log("#" + id);
                return "#" + id;

            }
            $(document).ready(function() {
                $("button.btn-remove-attr").off("click").click(function() {
                    if (confirm("Are you sure you want to delete the attribute?")) {
                        // console.log("I said OK!!");
                        var dividremove = $(this).closest('div').attr('id');
                        $(f(dividremove)).remove();
                        totalAttribute -= 1;
                        console.log("Total attributes " + totalAttribute);
                    }


                });
            });
            r5c1.appendChild(btn);
            r5.appendChild(r5c1);


            //Second row of the form.
            var r2 = document.createElement("tr");

            var r2c1 = document.createElement("td");
            r2c1.innerHTML = "Type of the Attribute:";

            var r2c2 = document.createElement("td");

            var numRadio = document.createElement("input");
            numRadio.setAttribute("type", "radio");
            numRadio.setAttribute("name", "radio_" + totalAttribute);
            numRadio.setAttribute("id", "num_" + totalAttribute);
            numRadio.setAttribute("checked", true);
            numRadio.setAttribute("onchange", "display(0, this, 'old')");
            numRadio.setAttribute("value", "0");

            var catRadio = document.createElement("input");
            catRadio.setAttribute("type", "radio");
            catRadio.setAttribute("name", "radio_" + totalAttribute);
            catRadio.setAttribute("id", "cat_" + totalAttribute);
            catRadio.setAttribute("onchange", "display(1, this, 'old')");
            catRadio.setAttribute("value", "1");

            r2c2.appendChild(numRadio);
            r2c2.appendChild(document.createTextNode("Numerical"));

            r2c2.appendChild(document.createElement("br"));

            r2c2.appendChild(catRadio);
            r2c2.appendChild(document.createTextNode("Categorical"));

            r2.appendChild(r2c1);
            r2.appendChild(r2c2);


            // //Fourth row of the form.
            // var r4 = document.createElement("tr");

            // var r4c1 = document.createElement("td");
            // r4c1.innerHTML = "Derived?:"

            // var r4c2 = document.createElement("td");

            // var baseRadio = document.createElement("input");
            // baseRadio.setAttribute("type", "radio");
            // baseRadio.setAttribute("name", "derived_" + totalAttribute);
            // baseRadio.setAttribute("attrid", totalAttribute);
            // baseRadio.setAttribute("id", "base_radio_" + totalAttribute);
            // baseRadio.setAttribute("checked", true);
            // baseRadio.setAttribute("onchange", "display(0, this, 'derived')");
            // baseRadio.setAttribute("value", "0");

            // var derivedRadio = document.createElement("input");
            // derivedRadio.setAttribute("type", "radio");
            // derivedRadio.setAttribute("name", "derived_" + totalAttribute);
            // derivedRadio.setAttribute("id", "derived_radio_" + totalAttribute);
            // derivedRadio.setAttribute("attrid", totalAttribute);
            // derivedRadio.setAttribute("onchange", "display(1, this, 'derived')");
            // derivedRadio.setAttribute("value", "1");

            // r4c2.appendChild(baseRadio);
            // r4c2.appendChild(document.createTextNode("No"));

            // r4c2.appendChild(derivedRadio);
            // r4c2.appendChild(document.createTextNode("Yes"));

            // r4.appendChild(r4c1);
            // r4.appendChild(r4c2);

            //Third row of the form.
            var r3 = document.createElement("tr");

            var r3c1 = document.createElement("td");
            r3c1.innerHTML = "Values:";

            var r3c2 = document.createElement("td");
            i = 1;


            var catFormDiv = document.createElement("div");
            catFormDiv.setAttribute("style", "display:none");
            catFormDiv.setAttribute("id", "value_form_" + totalAttribute);

            var catValues = document.createElement("input");
            catValues.setAttribute("type", "text");
            catValues.setAttribute("name", "tagValue");
            catValues.setAttribute("id", "cat_values_" + totalAttribute);
            catValues.setAttribute("placeholder", "Values separated by comma");

            catFormDiv.appendChild(catValues);

            var numFormDiv = document.createElement("div");
            numFormDiv.setAttribute("id", "num_form_" + totalAttribute);

            var lowerLim = document.createElement("input");
            var upperLim = document.createElement("input");


            lowerLim.setAttribute("type", "text");
            lowerLim.setAttribute("id", "new_lower_" + totalAttribute);
            lowerLim.setAttribute("placeholder", "Lower Bound");

            upperLim.setAttribute("type", "text");
            upperLim.setAttribute("id", "new_upper_" + totalAttribute);
            upperLim.setAttribute("placeholder", "Upper Bound");

            numFormDiv.appendChild(lowerLim);
            numFormDiv.appendChild(upperLim);

            r3c2.appendChild(catFormDiv);
            r3c2.appendChild(numFormDiv);

            r3.appendChild(r3c1);
            r3.appendChild(r3c2);
            div.appendChild(r2);
            div.appendChild(r3);

            div.appendChild(r5);
            mainTable.appendChild(div);

            totalAttribute += 1;
        }

        function validateFirst(id) {
            console.log(id)
            if (document.getElementById("attr_name_" + id) != null) {
                var attrName = document.getElementById("attr_name_" + id).value;
                console.log(attrName);
                var isCat = document.getElementById("cat_" + id).checked;
                // var isBase = document.getElementById("base_radio_" + id).checked;

                var res = "";

                if (attrName.length == 0) {
                    res += "Attribute Name not provided, ";
                }

                if (isCat) {
                    var catValue = document.getElementById("cat_values_" + id).value;
                    if (catValue.length == 0) {
                        res += "Categorical label(s) are not provided, ";
                    }
                } else  {
                    var lowerLimit = document.getElementById("new_lower_" + id).value;
                    var upperLimit = document.getElementById("new_upper_" + id).value;

                    if (lowerLimit.length == 0) {
                        res += "Lower Limit not provided, ";
                    }
                    if (upperLimit.length == 0) {
                        res += "Upper Limit not provided, ";
                    }
                }

                if (res.length > 0) {
                    res = res.slice(0, -2);
                    res += "!";
                }

                return res;
            } else {
                return validateFirst(id - 1);
            }

}    
function prepareData() {
    var data = {
        "base": [],
        "header":''
    };

    for (var x = 0; x < totalAttribute; x++) {
        // console.log("derived_radio_" + x);
            // var isDerived = document.getElementById("derived_radio_" + x).checked;

            var isCat = document.getElementById("cat_" + x).checked;
            var values = [];
            var type = "";
            var name = document.getElementById("attr_name_" + x).value;

            name = name.toUpperCase();
            data['header']+=name+','
            if(x==totalAttribute-1){
                data['header']=data['header'].slice(0, -1);
            }
            if (isCat) {
                type = "categorical";
                var temp = document.getElementById("cat_values_" + x).value.split(",");

                for (var i = 0; i < temp.length; i++) {
                    var s = temp[i].trim();
                    s = s.charAt(0).toUpperCase() + s.slice(1);
                    values.push(s);  
                }

            } else {
                type = "numerical";
                values = [document.getElementById("new_lower_" + x).value, document.getElementById("new_upper_" + x).value];
            }

            var curr = {
                "attributeName": name,
                "attributeType": type,
                "values": values
            }


            data['base'].push(curr);
        }
    
    return data;
}