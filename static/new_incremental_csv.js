var headersCSV="";
var queryStorage=[];
var uploadedCsvFile;
var uploadedCsvFileName;
var originalCsvContent;
var data_content_length;
var csvData;
var csvHeaders;
var auxCsvPresent=false;
var auxCsvData;
var auxCsvHeaders;
var targetAttribute;
var targetAttributeType;
var target_attr_index;




function upload_csv()
{
    uploadedCsvFile=document.getElementById('primarycsvfileUpload').files[0];
    let auxfile=document.getElementById('auxcsvfileUpload').files[0];
    uploadedCsvFileName=uploadedCsvFile.name.replace(/.*[\/\\]/, '');
    showSpinner();
    uploadFile(uploadedCsvFile,'primary').then(function(csv){
        csvData=csv[0]
        csvHeaders=csv[1]
        data_content_length=csvData.length;
        console.log(`Uploaded CSV file name = ${uploadedCsvFileName}`)
        let div=document.getElementById("target_attr");
        let select=document.getElementById("select_target_attr");
        for(var i=0;i<csvHeaders.length;i++){
            let option=document.createElement("option");
            option.setAttribute("value",csvHeaders[i]);
            option.innerHTML=csvHeaders[i];
            select.append(option);
        }
        
        if(auxfile!= undefined){
            auxCsvPresent=true
            uploadFile(auxfile,'aux').then(function(csv){
                auxCsvData=csv[0]
                auxCsvHeaders=csv[1]
            })
        }
        div.style.display="block";
        hideSpinner();

    })



}

function uploadFile(file,type) {
    return new Promise(function(resolve, reject) {
    let reader = new FileReader()
    reader.readAsText(file);
    reader.onload = function(event) {
        var final_data=[]
        var csv = event.target.result;
        var rows = csv.split('\n');
        rows[0]=rows[0].trim();
        if(type=='primary'){
        headersCSV=rows[0];
        originalCsvContent=csv
        }
        var headers=rows[0].split(',');

    
        for (var i = 1; i < rows.length; i++) {
            rows[i]=rows[i].trim()
            cols = rows[i].split(',');
            final_data.push(cols);
        }
        resolve([final_data,headers])
        }
    })
}



function csvTosql(){

    var target_attr=document.getElementById("select_target_attr").value;
    targetAttribute=target_attr;
    var target_attr_type=document.getElementById("type_attribute").value;
    targetAttributeType=target_attr_type;
    target_attr_index=csvHeaders.indexOf(target_attr)
    data=csvData
    header=csvHeaders
    data.pop()
    var sendData= {'data':data,'headers':header,"target_attr":target_attr_index}
    if(auxCsvPresent){
        auxCsvData.pop()
        sendData['auxdata']=auxCsvData
        sendData['auxheaders']=auxCsvHeaders
    }

    //var SERVER_URL = window.location.protocol + "//" + window.location.host;
    var REST_CALL = "/csvTosql";
    showSpinner()
    $.ajax({
        url: REST_CALL,
        data: JSON.stringify(sendData),
        type: 'POST',
        contentType: "application/json",
        success: function(res) {
            console.log(res);
            if(res["result"] > 0){
                let successwr=document.getElementById("success-wrapper");
                successwr.style.display="block";
                let tableinfo=document.getElementById("table_info");
                tableinfo.innerHTML='';
                let table1=createTableInfoDiv('primary_table',csvHeaders)
                tableinfo.append(table1);
                if(auxCsvPresent){
                    let table2=createTableInfoDiv('aux_table',auxCsvHeaders)
                    tableinfo.append(table2);
                }
            
            }
            console.log("YOOOOOO");
            hideSpinner();
        },
        error: function (err) {
            console.log("ERROR")
            console.log(err)
            hideSpinner();
        },
        dataType: 'json',
    });
}

function createTableInfoDiv(tablename,header){
    let maindiv=document.createElement("div");
    let div1=document.createElement("div");
    div1.setAttribute("class","tablename");
    div1.innerHTML= "TABLE NAME :  "+ tablename;
    let div2=document.createElement("div");
    div2.setAttribute("class","fieldnames");
    let fieldnames="";
    for(let i=0;i<header.length;i++){
        fieldnames+=header[i]+","
    }  
    div2.innerHTML= "FIELD NAMES :  "+fieldnames;
    maindiv.append(div1)
    maindiv.append(div2)
    return maindiv
}

const spinner = document.getElementById("spinner");
const waiting=document.getElementById("waiting");

function showSpinner() 
{
    spinner.className = "show";
    waiting.style.display="block";
}

function hideSpinner() 
{
    spinner.className = spinner.className.replace("show", "");
    waiting.style.display="none";
}

function runQuery()
{
    let verification_wrap=document.getElementById("verification-wrapper");
    verification_wrap.style.display="none";
    let sqlquery=document.getElementById("sqlstatements").value;
    let eachquery=sqlquery.split(";");
    let final_data=[]
    for(let i=0;i<eachquery.length-1;i++){
        eachquery[i]=eachquery[i].trim()
        eachquery[i]+=';';
        //console.log(eachquery[i]);        
        final_data.push(eachquery[i])
    }
    console.log(final_data);
    let sendData={"data":final_data,"target_attr":targetAttribute}
    var REST_CALL = "/runSqlQuery";
    showSpinner()
    $.ajax({
        url: REST_CALL,
        data: JSON.stringify(sendData),
        type: 'POST',
        contentType: "application/json",
        success: function(res) {
            console.log(res);
            let status=document.getElementById("status_query");
            if(res['error']==''){
                if(res["result"] > 0){
                    // document.getElementById("sqlstatements").value='';
                    // var numberOfNa=(parseInt(res["number_of_na"])/data_content_length)*100
                    // numberOfNa=numberOfNa.toFixed(2)
                    // total_percent_na=numberOfNa
                    // console.log(numberOfNa)
                    status.innerHTML="SUCCESS, Queries executed! "+ res["result"]+ " rows affected!";
                    // status.innerHTML="SUCCESS, Queries executed! "+ res["result"]+ " rows affected! There are "+numberOfNa+"% NAs remaining in the target atrribute.";
                    let queryHistory=document.getElementById("queryHistory");
                    queryHistory.style.display="block";
                    for(let i=0;i<eachquery.length-1;i++){
                        if(!queryStorage.includes(eachquery[i])){
                            queryStorage.push(eachquery[i])   
                        }
                    }
                    populateQueryHistory();
                }
                else{
                    status.innerHTML="SUCCESS, NO rows affected";
                }
            }
            else{
                status.innerHTML=res["error"];
            }


            console.log("YOOOOOO");
            hideSpinner();
        },
        error: function (err) {
            console.log("ERROR")
            console.log(err)
            let status=document.getElementById("status_query");
            status.innerHTML="ERROR :"+err;
            hideSpinner();
        },
        dataType: 'json',
    });
}

function createFileName()
{
    var date = new Date()
    var dd = String(date.getDate()).padStart(2, '0');
    var month = date.toLocaleString('default', {
        month: 'long'
    });
    if(uploadedCsvFileName != undefined)
    {
        var filename = "Data-Puzzle" + "-" + dd + "-" + month + "-" + uploadedCsvFileName;
        console.log(filename)
        return filename;
    }
}

function createVerifyTableFileName()
{
    var date = new Date()
    var dd = String(date.getDate()).padStart(2, '0');
    var month = date.toLocaleString('default', {
        month: 'long'
    });
    if(uploadedCsvFileName != undefined)
    {
        var filename = "Verify-Data-Puzzle" + "-" + dd + "-" + month + "-" + uploadedCsvFileName;
        console.log(filename)
        return filename;
    }
}

function createQueryHistoryFileName(csvFileName)
{
    var fileName = csvFileName
    if(fileName.endsWith('.csv'))
    {
        fileName = fileName.substring(0, fileName.length - 4) 
    }
    return fileName.concat('-QueryHistory.txt')     
}

function downloadCsv()
{
    fetch('/getDataSql', {
        method: 'post',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({
            tableName: "primary_table"
        })
    })
    .then(response => response.json())
    .then(data => data.result)
    .then(csv_data => {
        var original_csv = prepareOriginalCsv(csv_data)
        var computedFileName = createFileName();
        var newCsvFileName = prompt("Download the new csv file as:", computedFileName);
        if(!containsCsvExtension(newCsvFileName))
        {
            newCsvFileName = newCsvFileName + ".csv";
        }
        if(newCsvFileName != null)
        {
            downloadFile(original_csv, newCsvFileName, "text/csv");
            downloadFile(getQueryHistoryText(), createQueryHistoryFileName(newCsvFileName),"text/plain")
        }        
    })
    .catch(error => console.log(error));
}

function containsCsvExtension(fileName)
    {
        if(fileName.length >= 4)
        {
            var ext = fileName.substring(fileName.length - 4);
            if(ext === ".csv".toLowerCase() || ext === ".csv".toUpperCase())
                return true;
            return false;
        }
        return false;
    }

function getQueryHistoryText()
{
    var textquery="";
    for(let i=0;i<queryStorage.length;i++){
        textquery+=queryStorage[i]+"\n";
    }
    return textquery;
}

function getCsvData()
{
    fetch('/getDataSql', {
            method: 'post',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({
                tableName: "primary_table"
            })
        })
        .then(response => response.json())
        .then(data => data.result)
        .then(csv_data => {
            downloadFilesAsZip(csv_data)
        })
        .catch(error => console.log(error));
}

function prepareOriginalCsv(csv_data)
{
    var original_csv = headersCSV + "\n";
    if(csv_data.length > 0){
        csv_data.forEach(function(row) {  
        original_csv += row.join(',');  
        original_csv += "\n";  
        });
    }
    return original_csv;
}

function downloadQueryHistory(){
    downloadFile(getQueryHistoryText(), createQueryHistoryFileName(createFileName()),"text/plain");
}

function downloadVerificationTable()
{
    fetch('/getDataSql', {
        method: 'post',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({
            tableName: "verify_table"
        })
    })
    .then(response => response.json())
    .then(data => data.result)
    .then(csv_data => {
        var original_csv = prepareOriginalCsv(csv_data)
        downloadFile(original_csv, createVerifyTableFileName(),"text/csv");
        downloadFile(getQueryHistoryText(), createQueryHistoryFileName(),"text/plain")
    })
    .catch(error => console.log(error));
}

function downloadFile(text,filename,filetype)
{
    let file = new File([text], filename, {
        type: filetype,
    });

    saveAs(file, filename);
}

function createZipFileName()
{
    var date = new Date()
    var dd = String(date.getDate()).padStart(2, '0');
    var month = date.toLocaleString('default', {
        month: 'long'
    });
    if(uploadedCsvFileName != undefined)
    {
        var filename="";
        if (uploadedCsvFileName.includes("Data-Puzzle-")){
            filename= uploadedCsvFileName+ "-" + dd + "-" + month + ".zip";
        }
        else{
            filename = "Data-Puzzle" + "-" + uploadedCsvFileName+ "-" + dd + "-" + month + ".zip";
        }
        console.log(filename)
        return filename;
    }
}

function downloadFilesAsZip(csv_data)
{   
    var zip = new JSZip();
    zip.file(createFileName(), prepareOriginalCsv(csv_data))
    if(uploadedCsvFile != undefined)
        zip.file(uploadedCsvFileName, originalCsvContent)
    else
        console.log(`Error: Uploaded csv file name is undefined`)
    var queryHistory = getQueryHistoryText()
    zip.file(createQueryHistoryFileName(), queryHistory)
    zip.generateAsync({type:"blob"})
    .then(function (blob) {
    saveAs(blob, createZipFileName());
    });
}

function addNoiseAttr(){
    let noise_value=document.getElementById("noise_value").value;
    console.log(noise_value);
    var final_data={};
    final_data["selected_value"]=targetAttribute;
    final_data["noise_value"]=noise_value;
    final_data["type_attribute"]=targetAttributeType;
    final_data["total_data_length"]=data_content_length;
    final_data["target_attr_idx"]=target_attr_index;
    var REST_CALL = "/addNoiseSql";
    //let sendData={"data":final_data}
    showSpinner()
    $.ajax({
        url: REST_CALL,
        data: JSON.stringify(final_data),
        type: 'POST',
        contentType: "application/json",
        success: function(res) {
            console.log(res);
            let status=document.getElementById("status_query");
            if(res['error']==''){
                console.log("check")
                if(res["result"] > 0){
                    //queryStorage.push("Added "+noise_value+"% Noise to Column: " + targetAttribute);
                    status.innerHTML="SUCCESS, Queries executed! "+ res["result"]+ " rows affected!";
                    let queryHistory=document.getElementById("queryHistory");
                    queryHistory.style.display="block";
                    populateQueryHistory();
                }
                else{
                    status.innerHTML="SUCCESS, NO rows affected";
                }
            }
            else{
                status.innerHTML=res["error"];
            }
            hideSpinner();
        },
        error: function (err) {
            console.log("ERROR")
            console.log(err)
            let status=document.getElementById("status_query");
            status.innerHTML="ERROR :"+err;
            hideSpinner();
        },
        dataType: 'json',
    });
}

function verification(){
    var final_data={};
    final_data["headers"]=csvHeaders;
    final_data["final_data"]=csvData;
    final_data["target_attribute"]=targetAttribute;
    final_data["target_attr_index"]=target_attr_index
    final_data["queryExecute"]=queryStorage
    var REST_CALL = "/verificationSQL";
    showSpinner()
    $.ajax({
        url: REST_CALL,
        data: JSON.stringify(final_data),
        type: 'POST',
        contentType: "application/json",
        success: function(res) {
            console.log(res);
            let status=document.getElementById("status_query");
            if(res['error']==''){
                let total_percent_na=(parseInt(res["result"])/data_content_length) * 100
                total_percent_na=total_percent_na.toFixed(2);
                let verification_wrap=document.getElementById("verification-wrapper");
                let verify_info=document.getElementById("verify_info");
                verify_info.innerHTML="There are "+total_percent_na+"% NAs remaining the target attribute column. You can update the remaining NAs by running queries above."
                verification_wrap.style.display="block";
            }
            else{
                status.innerHTML=res['error']
            }
            
            hideSpinner();
        },
        error: function (err) {
            console.log("ERROR")
            console.log(err)
            let errordiv=document.getElementById("validate_error");
            errordiv.innerHTML="ERROR :"+err;
            hideSpinner();
        },
        dataType: 'json',
    });

}

function randomlyUpdateNA(){
    // console.log(targetAttributeType)
    // console.log(csvData)
    // console.log(targetAttribute)
    // var target_attr_index=csvHeaders.indexOf(targetAttribute)
    // console.log(target_attr_index)
    var updateValue;
    if(targetAttributeType=='numerical'){
        var sum=0;
       for(var i=0;i<csvData.length-1;i++){
        sum+=parseFloat(csvData[i][target_attr_index]);
       }
       updateValue=sum/data_content_length;
       updateValue=updateValue.toFixed(2);
    }
    else{
        var hmap = {};
        var max_el = csvData[0][target_attr_index], maxCount = 1;
        for(var i=0;i<csvData.length-1;i++){
            var val=csvData[i][target_attr_index];
            if(hmap[val]==null){
                hmap[val]=1
            }
            else{
                hmap[val]++;
            }
            if(hmap[val] > maxCount){
                maxCount=hmap[val];
                max_el=val;
            }
        }
        console.log(hmap);
        updateValue=max_el;
    }
    var final_data={};
    final_data["updateValue"]=updateValue;
    final_data["target_attribute"]=targetAttribute;
    final_data["target_attribute_type"]=targetAttributeType;
    var REST_CALL = "/randomlyUpdateNAs";
    showSpinner()
    $.ajax({
        url: REST_CALL,
        data: JSON.stringify(final_data),
        type: 'POST',
        contentType: "application/json",
        success: function(res) {
            console.log(res);
            let status=document.getElementById("status_query");
            if(res['error']==''){
                let errordiv=document.getElementById("validate_error");
                errordiv.innerHTML="ERROR : "+res['result']
            }
            else{
                status.innerHTML=res['error']
            }
            
            hideSpinner();
        },
        error: function (err) {
            console.log("ERROR")
            console.log(err)
            let errordiv=document.getElementById("validate_error");
            errordiv.innerHTML="ERROR :"+err;
            hideSpinner();
        },
        dataType: 'json',
    });
}




function upload_queryHistory(){
    var inputFile=document.getElementById("queryhistory_upload");
    var file = new FileReader();
    file.onload = () => {
    console.log(file.result)
    document.getElementById("sqlstatements").value=file.result;
      let eachquery=file.result.trim().split(';');
      for(let i=0;i<eachquery.length-1;i++){
        eachquery[i]=eachquery[i].trim()
        eachquery[i]+=';';
        if(!queryStorage.includes(eachquery[i])){
            queryStorage.push(eachquery[i]) 
        }
      }
      populateQueryHistory();
    }
    file.readAsText(inputFile.files[0]);
}

function populateQueryHistory(){
    console.log(queryStorage)
    let ol=document.getElementById("queryList");
    ol.innerHTML="";
    for(let i=0;i<queryStorage.length;i++){
        let li=document.createElement("li");
        li.innerHTML=queryStorage[i];
        ol.append(li);
    }
}