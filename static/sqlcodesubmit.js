const sheetId = '1Iu-zCunodM-l1xH1sU50Huf6BDWoBBBG7xd_7u8plgk';
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const query = encodeURIComponent('Select *')
var jsondataquery={}
const storagesectionid="section-id-";




function createSqlSnippets(ele,sectionid){
   
    var data=jsondataquery[sectionid]
    var prevsection=localStorage['current-section']
    var prevele=document.getElementById(prevsection);
    prevele.classList.remove("active");
    ele.classList.add("active");
    localStorage['current-section']=storagesectionid+sectionid
    document.getElementById("section-heading").innerHTML=data.name
    document.getElementById("section-description").innerHTML=data.description
    maindiv=document.getElementById("maincontainer");
    maindiv.style.display="block";
    maincontainer.innerHTML=" ";
    if(!("snippets" in data)){
        return;
    }
    var snippetdata=data.snippets
    for(let i=0;i<snippetdata.length;i++){
        txt="";
        txt=txt + "<div class='ws-grey' style='padding:15px;padding-bottom:40px;margin-bottom:40px;box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);'>"
        txt=txt+"<h3>"+parseInt(i+1)+". " + snippetdata[i].title +"</h3>"
        txt=txt+"<div class='CodeMirror cm-s-default CodeMirror-wrap'>" +  "<div class='CodeMirror-vscrollbar' cm-not-content='true' style='width: 12px; pointer-events: none;'>" +
                "<div style='min-width: 1px; height: 0px;'></div></div>" + "<div class='CodeMirror-hscrollbar' cm-not-content='true' style='height: 12px; pointer-events: none;'>" +
                "<div style='height: 100%; min-height: 1px; width: 0px;'></div>" + "</div><div class='CodeMirror-scrollbar-filler' cm-not-content='true'></div>" +
                "<div class='CodeMirror-gutter-filler' cm-not-content='true'></div>" +"<div class='CodeMirror-scroll' tabindex='-1'>" +
                "<div class='CodeMirror-sizer' style='margin-left: 5px; margin-bottom: 0px; border-right-width: 30px; min-height: 53px; padding-right: 0px; padding-bottom: 0px;'>" + 
                "<div style='position: relative; top: 0px;'><div class='CodeMirror-lines'><div style='position: relative; outline: none;'>" + "<div class='CodeMirror-measure'>" +
                "<span><span>​</span>x</span>" + " </div><div class='CodeMirror-measure'></div>" + "<div style='position: relative; z-index: 1;'></div>" + "<div class='CodeMirror-cursors'></div>";
        txt=txt+ "<div class='CodeMirror-code' autocorrect='off' autocapitalize='off' spellcheck='false' contenteditable='true' tabindex='0' id='sql-code-example-"+i+"'>"+snippetdata[i].query+"</div></div></div></div></div>"
        txt=txt+ "<div style='position: absolute; height: 30px; width: 1px; border-bottom: 0px solid transparent; top: 53px;'></div><div class='CodeMirror-gutters' style='display: none; height: 83px;'></div></div></div>"+
        "<p>Edit the SQL Statement, and click Run SQL to see the result.</p>"+
        "<button class='ws-btn' type='button' onclick='sqlCodeSubmit("+i+");'>Run SQL »</button>" + "<h3>Result:</h3>" + 
        "<div id='resultSQL-"+i+"'>" + "<iframe id='iframeResultSQL-"+i+"' frameborder='0' name='view' style='display: none;'></iframe>" + 
        "<div class='w3-white' id='divResultSQL-"+i+"' style='display: block; padding:10px;'>" + "  Results will be displayed here" + 
        "</div></div> </div>  ";
        var childiv=document.createElement("div");
        childiv.setAttribute("id","example-"+i);
        childiv.innerHTML=txt;
        maindiv.append(childiv);
    }
}

function sqlCodeSubmit(id){
    var resultContainer = document.getElementById("divResultSQL-"+id);
    resultContainer.innerHTML = "";
    sqlcode=document.getElementById("sql-code-example-"+id).innerHTML;
    console.log(sqlcode)
    sqlcode=sqlcode.replaceAll("&nbsp;"," ");
    var div = document.createElement("div");
    div.innerHTML = sqlcode;
    sqlcode = div.textContent || div.innerText || "";
    statement_type=sqlcode.split(" ")[0].toLowerCase();
    if(statement_type == "update" || statement_type == "insert" || statement_type == "upsert"){
        resultContainer.innerHTML="Cannot perform write operations.";
        return
    }
    console.log(sqlcode);
    var REST_CALL = "/sqlTutorialCode";
    var sendData={"sqlcode":sqlcode}
    $.ajax({
        url: REST_CALL,
        data: JSON.stringify(sendData),
        type: 'POST',
        contentType: "application/json",
        success: function(result) {
            console.log(result);
            res=result['result']
            console.log(res)
            var len=parseInt(res.length)-1;
            console.log(len);
            if(len > 0){
                txt = "";
                txt = txt + "<div style='padding:10px;'><div style='margin-bottom:10px;'>Number of Records: " + len + "</div>";
                txt = txt + "<table class='ws-table-all notranslate'><tr>";
                for (j = 0; j < res[0].length; j++) {
                    txt = txt + "<th>" + res[0][j] + "</th>";  
                }
                txt = txt + "</tr>";
                for (i = 1; i < len+1; i++) {
                    txt = txt + "<tr>";       
                    for (j = 0; j < res[0].length; j++) {
                        if (res[i][j] == null) {
                            txt = txt + "<td><i>null</i></td>";  
                        } else {
                            txt = txt + "<td>" + res[i][j] + "</td>";
                        }                                    
                    }
                    txt = txt + "</tr>";       
                }
                resultContainer.innerHTML =  txt + "</table></div>";
            }
            else{
            resultContainer.innerHTML= result['error']
            }
            
        },
        error: function (err) {
            console.log("ERROR")
            console.log(err)
        },
        dataType: 'json',
    });
}



function init(){
    var sheetName= 'Sheet1';
    var url = `${base}&sheet=${sheetName}&tq=${query}`
    fetchGoogleSheetsData(url,"sqlsnippets")
    sheetName = 'Sheet2';
    url = `${base}&sheet=${sheetName}&tq=${query}`
    fetchGoogleSheetsData(url,"sections")
}

// function fetchGoogleSheetsData(url,type) {
//     console.log(type)
//     fetch(url)
//         .then(res => res.text())
//         .then(rep => {
//             //Remove additional text and extract only JSON:
//             const jsonData = JSON.parse(rep.substring(47).slice(0, -2));
//             var data_rows=jsonData.table.rows
//             if(type=="sections"){
//                 createSectionJson(data_rows)
//             }
//             else{
//                 createSqlJson(data_rows)
//             }
//         })
// }

async function fetchGoogleSheetsData(url,type){
    $.ajax({
        url: url,
        success: function(result) {
            const jsonData = JSON.parse(result.substring(47).slice(0, -2));
            var data_rows=jsonData.table.rows
            if(type=="sections"){
                createSectionJson(data_rows)
            }
            else{
                createSqlJson(data_rows)
            }
        },
        async:false
    });
}

function createSectionJson(data_rows){
    console.log("Hello this is section json")
    for(let i=0;i<data_rows.length;i++){
        var details=data_rows[i].c
        var sectionid=details[0].v
        if(!(sectionid in jsondataquery)){
            jsondataquery[sectionid]={}
        }
        jsondataquery[sectionid]["name"]=details[1].v
        jsondataquery[sectionid]["description"]=details[2].v
    }
    createSectionLHS()
}

function createSqlJson(data_rows){
    console.log("Hello this is sql json")
    for(let i=0;i<data_rows.length;i++){
        var dictsnip={}
        var details=data_rows[i].c
        var sectionid=details[2].v
        dictsnip["title"]=details[0].v;
        dictsnip["query"]=details[1].v;
        if(sectionid in jsondataquery){
            if("snippets" in jsondataquery[sectionid]){
                jsondataquery[sectionid]["snippets"].push(dictsnip)
            }
            else{
                jsondataquery[sectionid]["snippets"]=[dictsnip]
            }
        }
        else{
            jsondataquery[sectionid]={"snippets":[dictsnip]}
        }
    }
}

function createSectionLHS(){
    var licurrent;
    var parentul=document.getElementById("sql-sections");
    for (const [key, value] of Object.entries(jsondataquery)) {
        let li=document.createElement("li");
        if(!("current-section" in localStorage)|| localStorage['current-section']==storagesectionid+key){
            li.setAttribute("class","chapter active");
            licurrent=li;
            localStorage['current-section']=storagesectionid+key
        }
        let a=document.createElement("a");
        li.setAttribute("onclick","createSqlSnippets(this,'"+key+"');")
        li.setAttribute("id",storagesectionid+key)
        let i=document.createElement("i");
        i.setAttribute("class","fa fa-check");
        let b=document.createElement("b")
        b.innerHTML=parseInt(key)+1
        let textNode = document.createTextNode(" "+value.name);
        a.append(i);
        a.append(b);
        a.append(textNode)
        li.append(a)
        parentul.append(li);
      }
      licurrent.click();
}
