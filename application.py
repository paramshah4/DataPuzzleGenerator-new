from flask import Flask, render_template, request
from flask.globals import current_app
from flask.helpers import send_file, send_from_directory
from flask.wrappers import Response
from flask_cors import CORS
import json
import os
import fnmatch
import math
import random

from numpy import rad2deg
import tree_helper as thelper
import inc_tree_helper as ihelper
from os import path
from datetime import date
import perfect_prediction_model as accuracycalc
import pandas as pd
from io import BytesIO
import datageneration_numerictarget as dg_nt
import perfect_prediction_model_numerictarget as accuracycalc_numeric
import distribution_datagen 
import pymysql
from pymysql import MySQLError
#import csv
#from sqlalchemy import create_engine
#import urllib
#from urllib.parse import quote  


import config as conf


application = Flask(__name__)
CORS(application)

tree_object = thelper.Tree()
inc_tree_object = ihelper.IncrementalTree()
prediction_model_object = accuracycalc.predictionmodel()
foldername = None
schemaname = None
treename = None
global_file_names = []
global_json_file = []
global_csv_file = []
global_module_name = ""
global_server_data=[]
dg_nt_object = dg_nt.numeric_datageneration()
prediction_model_numerictarget_object = accuracycalc_numeric.predictionmodel_numtarget()
derivedpycode = []
datagenration_distributions_object= distribution_datagen.datagenration_distributions()


@application.route('/', methods=['GET'])
def render_index():
    return render_template("homepage.html")


@application.route('/getIncrementalCSV', methods=['POST'])
def get_csv():
    csv_file = request.files['csv_file'].read()
    inc_tree_object.csv_file = csv_file
    res = inc_tree_object.extract_metadata()

    res = json.dumps(res)
    return render_template("incrementalCSV.html", res=res)


@application.route('/getIncrementalTreeData', methods=['POST'])
def get_incremental_tree_data():
    serverData = request.get_json()
    res = inc_tree_object.main_method(serverData)
    res = json.dumps(res)

    return res

@application.route('/powerlawgeneration', methods=['POST'])
def powerlawgeneration():
    serverData = request.form['inp_powerlaw']
    serverData = json.loads(serverData)
    range0=serverData["range0"]
    range1=serverData["range1"]
    n=serverData["n"]
    tuples=serverData["tuples"]
    attrname=serverData["attrname"]
    powerlawdata=datagenration_distributions_object.powerlawdistribution(range0,range1,n,tuples,attrname)
    powerlawdata = json.dumps(powerlawdata)
    return powerlawdata
    

@application.route('/gausslawgeneration', methods=['POST'])
def gaussawgeneration():
    serverData = request.form['inp_gausslaw']
    serverData = json.loads(serverData)
    mean=serverData["mean"]
    sd=serverData["sd"]
    tuples=serverData["tuples"]
    attrname=serverData["attrname"]
    gaussawdata=datagenration_distributions_object.guassiandistribution(mean,sd,tuples,attrname)
    gaussawdata = json.dumps(gaussawdata)
    return gaussawdata

@application.route('/getData', methods=['POST'])
def get_attr_data():
    serverData = request.form.get("entire_data")
    print("serverData", serverData)
    serverData = json.loads(serverData)

    res = {}

    def get_yes_no(key):
        if(key == "base"):
            return "no"

        return "yes"

    for key in serverData.keys():
        # if (key != "targetvariabletype"):
        if (key != "globalfilename" and key != "targetvariabletype"):
            for attr in serverData[key]:
                res[attr["attributeName"]] = {
                    "type": attr["attributeType"],
                    "values": attr["values"],
                    "derived": get_yes_no(key)
                }
    if (serverData["targetvariabletype"][0] == "categorical"):
        res["targetvariabletype"] = "categorical"
    else:
        res["targetvariabletype"] = "numerical"
    global global_file_names
    if(len(serverData["globalfilename"]) > 0):
        if(len(global_file_names) > 0):
            global_file_names.pop()
    if(len(serverData["globalfilename"])>0):
        print("i am here")
        global_file_names.append(serverData["globalfilename"][0])
    else:
        global_file_names.append("userproject")
    if(res["targetvariabletype"] == "categorical"):
        res.pop('targetvariabletype', None)
        res = json.dumps(res)
        return render_template("index.html", res=res)
    else:
        derived = []
        base = []
        res.pop('targetvariabletype', None)

        for key in res.keys():
            if (res[key]["derived"] == "yes"):
                derived.append(key)
            else:
                base.append(key)
        res["derived_attribute"] = derived
        res["base"] = base

        # print(res)
        res = json.dumps(res)
        return render_template("numerictarget.html", res=res)
        
@application.route('/getlaunchtool', methods=['POST'])
def launch_tool():
    return render_template("addAttribute.html")

@application.route('/getTree', methods=['POST'])
def get_tree_data():
    serverData = request.form.get("entire_tree_data")
    
    if(len(global_json_file) > 0):
        global_json_file.pop()
    global_json_file.append(serverData)
    serverData = json.loads(serverData)
    if(len(global_server_data)>0):
        global_server_data.pop()
    global_server_data.append(serverData)
    print("Appended")

    tree_object.main_method(serverData)

    res = {"base": list(tree_object.base),
           "derived": list(tree_object.derived),
           "filename":global_file_names[len(global_file_names)-1]}
    print("res: ", res)
    res = json.dumps(res)
    return render_template("downloadData.html", res=res)


@application.route('/generateData', methods=['POST'])
def generate_tree():
    serverData = request.form['res']
    serverData = json.loads(serverData)

    map_dic = serverData["derived_atts"]
    N = serverData["data_points"]
    # print(N)
    module_name = serverData["module_name"]
    if (module_name != None):

        code = request.files['py_file'].read()
        derivedpycode .append(code) 

        try:
            f = open("CodeModules/" + module_name + ".py", 'wb')
            f.write(code)
            f.close()
        except:
            msg = "Failed to upload file, upload file again!"
            res = {"error": "Exception: " + msg}
            return json.dumps(res)

    print("len(global_server_data)",len(global_server_data))
    if(len(global_server_data)>0):
        tree_object.main_method(global_server_data[0])
    if(len(serverData.keys()) == 3):
        res = tree_object.generate_data(map_dic, module_name, N)
        
        res = json.dumps(res)

        return res
    else:
        attributes_info = serverData["attributes_data"]
        attributes_info = json.loads(attributes_info)
        res = dg_nt_object.generate_data(
            map_dic, module_name, N, attributes_info)
        res = json.dumps(res)
        # global_module_name=res["modulename"]

        return res


@application.route('/perfectpredictionmodel', methods=['POST'])
def calculate_accuracy():

    # json_file = request.files.get('json_file').read()
    if(global_csv_file):
        csv_file = global_csv_file[0]
    else:
        msg = "Error: Generate and Download the csv file to validate!"
        return msg
    if(len(global_json_file) > 0):
        jsondata = json.loads(global_json_file[0])
    else:
        return "Error: Generate and Download the csv file to validate yyye!"
    # print("jsondata")

    # print(jsondata)
    # print("csv data")
    # print(csv_file)
    prediction_model_object.csv_file = csv_file
    prediction_model_object.json_file = jsondata
    if(derivedpycode):
        prediction_model_object.derivedcode = derivedpycode[0].decode("utf-8")
        derivedpycode.pop()
    accuracy = prediction_model_object.perfect_prediction_model()
    global_csv_file.pop()

    return str(accuracy)

    """
    N = int(request.args.get('n'))
    res = tree_object.generate_data(N)
    res = json.dumps(res)
    
    return res
    """


@application.route('/perfectpredictionmodel_numerictarget', methods=['POST'])
def calculate_accuracy_numerictarget():
    if(global_csv_file):
        csv_file = global_csv_file[0]
    else:
        msg = "Error: Generate and Download the csv file to validate!"
        return msg
    prediction_model_numerictarget_object.csvfile = csv_file
    if(derivedpycode):
        prediction_model_numerictarget_object.derivedcode = derivedpycode[0].decode("utf-8-sig")
        derivedpycode.pop()
    else:
        msg = "Error: Check logs"
        return msg 
    mse=prediction_model_numerictarget_object.perfect_prediction_model_numtar()
    global_csv_file.pop()
    return str(mse)


@application.route('/schemasave', methods=['POST'])
def saveschema():
    filename = request.form['nameOfSchema']
    if(len(global_file_names) > 0):
        del global_file_names[:]
    if(filename != None):
        global_file_names.append(filename)
    filedata = request.files.get('jsonData')
    return savefile_and_returnfilename("schemafiles", filename, "json", filedata)


@application.route('/treesave', methods=['POST'])
def savestree():
    if(len(global_file_names) == 0):
        return "Error: You did not save the earlier schema file. Enter new file name"
    print("global_file_names",global_file_names)
    filename = global_file_names[len(global_file_names)-1]
    filedata = request.files.get('jsonData')
    return savefile_and_returnfilename("treefiles", filename, "json", filedata)


@application.route('/downloadcsv', methods=['POST'])
def download_csv():

    # filename = global_file_names[0]
    filedata = request.files.get('file')
    # filename=request.form['filename']
    df = pd.read_csv(filedata)
    global_csv_file.append(df)
    print("len(global_csv_file)",len(global_csv_file))
    # global_file_names.append(filename)
    if(len(global_file_names) == 0):
        return "Error: You did not save the earlier schema file. Enter new file name"
    else:
        filename = global_file_names[len(global_file_names)-1]
        return savefile_and_returnfilename("csvfiles", filename, "csv", filedata)

@application.route('/downloadcsvdistribution', methods=['POST'])
def download_csv_distri():

    # filename = global_file_names[0]
    filedata = request.files.get('file')
    filename=request.form['filename']
    df = pd.read_csv(filedata)
    global_csv_file.append(df)
    
    # global_file_names.append(filename)
    
    return savefile_and_returnfilename("csvfiles", filename, "csv", filedata)


@application.route('/csvTosql', methods=['POST'])
def csvToSql():
    rows_returned=0
    data=request.get_json()
    print(data)
    headers=data["headers"]
    val_data=data["data"]
    target_attr=data["target_attr"]
    aux_data_present=False
    if('auxdata' in data):
        aux_data=data["auxdata"]
        aux_headers=data['auxheaders']
        aux_data_present=True
        sql_create_aux=generateCreateTableQuery(aux_headers,"aux_table")

    sql_create_test=generateCreateTableQuery(headers,"primary_table")
    conn = pymysql.connect(
        host= conf.host,
        port = conf.port, 
        user = conf.user, 
        password = conf.password, 
        db = conf.db, 
        )
    cur = conn.cursor()
    print("START")
    try:
        cur.execute("DROP TABLE IF EXISTS primary_table;")
        cur.execute("DROP TABLE IF EXISTS aux_table;")
        cur.execute(sql_create_test)
        conn.commit()
        insertQuery_test=createInsertSqlQuery(val_data,'primary_table',-1,False)
        print(insertQuery_test)
        rows_returned+=cur.execute(insertQuery_test)
        conn.commit()

        if(aux_data_present):
            cur.execute(sql_create_aux)
            conn.commit()
            insertQuery_test=createInsertSqlQuery(aux_data,'aux_table',-1,False)
            #print(insertQuery_test)
            rows_returned+=cur.execute(insertQuery_test)
            conn.commit()
    except pymysql.Error as e:
        rows_returned = "Error occured: " + str(e)
        print(rows_returned)



    return {"result":rows_returned}

@application.route('/runSqlQuery', methods=['POST'])
def runSQLQuery():
    rows_returned=0
    error=''
    data=request.get_json()
    val_data=data["data"]
    target_attr=data["target_attr"]
    conn = pymysql.connect(
        host= conf.host,
        port = conf.port, 
        user = conf.user, 
        password = conf.password, 
        db = conf.db, 
        )
    cur = conn.cursor()
    try:
        for vals in val_data:
            #print(vals)
            rows_returned += cur.execute(vals)
        conn.commit()
    except pymysql.Error as e:
        error = "Error occured: " + str(e)
        print(error)
    
    return {"result":rows_returned,"error":error}


@application.route('/getDataSql', methods=['POST'])
def getDatafromSql():
    data = request.get_json()
    tableName = data["tableName"]
    rows_returned=0
    conn = pymysql.connect(
        host= conf.host,
        port = conf.port, 
        user = conf.user, 
        password = conf.password, 
        db = conf.db, 
        )
    cur = conn.cursor()
    try:
        cur.execute("CREATE TEMPORARY TABLE test_table1 SELECT * FROM " + tableName)
        cur.execute("ALTER TABLE test_table1 DROP COLUMN ID")
        cur.execute("SELECT * FROM test_table1")
        details = cur.fetchall()
        cur.execute("DROP TEMPORARY TABLE test_table1")
        conn.commit()
        #print(details)
    except pymysql.Error as e:
        rows_returned = "Error occured: " + str(e)
        print(rows_returned)
    
    return {"result":details}


@application.route('/addNoiseSql', methods=['POST'])
def addNoiseSql():
    data=request.get_json()
    #print(data)
    selected_attribute=data["selected_value"]
    type_attribute=data["type_attribute"]
    noise_value=data["noise_value"]
    total_data_length=data["total_data_length"]
    target_index=data["target_attr_idx"]

    total_data_retrieved_length=math.floor(int(total_data_length)*(int(noise_value)/100))

    rows_returned=0
    error=''
    conn = pymysql.connect(
        host= conf.host,
        port = conf.port, 
        user = conf.user, 
        password = conf.password, 
        db = conf.db, 
    )
    cur = conn.cursor()
    try:
        if (type_attribute=="numerical"):
            numeric_query="UPDATE primary_table set "+selected_attribute+"=RAND()*(("+selected_attribute+"*1.10)- ("+selected_attribute+"*0.9))+ ("+selected_attribute+"*0.9)  where ID in (select * FROM (SELECT ID FROM primary_table ORDER BY RAND() LIMIT "+str(total_data_retrieved_length)+") temp_tab);"
            print(numeric_query)
            rows_returned=cur.execute(numeric_query)
            print(rows_returned)
        else:
            cat_query="Select * from primary_table"

            cur.execute(cat_query)
            random_data=cur.fetchall()
            cur.execute("Select DISTINCT("+selected_attribute+") from primary_table")
            unique_values=cur.fetchall()

            random_data=list(random_data)

            random.shuffle(random_data)
            for i in range(total_data_retrieved_length):
                random_data[i]=list(random_data[i])
                original_value=random_data[i][target_index+1]
                while True:
                    random_index=random.choice(unique_values)
                    random_value=random_index[0]
                    if(random_value != original_value):
                        break
                random_data[i][target_index+1]=random_value
                # print(val)
                # updateQuery="Update primary_table set "+selected_attribute+"='"+random_value+"' where ID="+str(id)+";"
                # rows_returned+=cur.execute(updateQuery)
            cur.execute("truncate primary_table")
            insert_noise_data=createInsertSqlQuery(random_data,'primary_table',-1,True)
            #print(insert_noise_data)
            cur.execute(insert_noise_data)
        conn.commit()
    except pymysql.Error as e:
        error = "Error occured: " + str(e)
       
    return {"result":total_data_retrieved_length,"error":error}

@application.route('/randomlyUpdateNAs', methods=['POST'])
def randomlyUpdateNAs():
    data=request.get_json()
    target_attribute=data["target_attribute"]
    target_attribute_type=data["target_attribute_type"]
    update_value=data["updateValue"]
    rows_returned=0
    error=''
    conn = pymysql.connect(
        host= conf.host,
        port = conf.port, 
        user = conf.user, 
        password = conf.password, 
        db = conf.db, 
    )
    cur = conn.cursor()
    try:
        rows_returned=cur.execute("Update verify_table set "+target_attribute+"='"+update_value+"' where "+target_attribute+" is null")
        cur.execute("select t."+target_attribute+",o."+target_attribute+" from primary_table as t inner join verify_table as o on t.ID=o.ID")
        details=cur.fetchall()
        mse=calculateError(details,target_attribute_type)
        conn.commit()
    except pymysql.Error as e:
        error = "Error occured: " + str(e)

    return {"result":mse,"error":error}

@application.route('/newIncremental', methods=['GET'])
def newIncremental():
    return render_template("new_incremental_csv.html")

@application.route('/add_attr_to_CSV', methods=['GET'])
def add_attr_to_CSV():
    return render_template("add_attr_csv.html")    


@application.route('/generateRandomCSV', methods=['POST'])
def generateRandomCSV():
    serverData = request.form.get("entire_data_csv")
    print("serverData", serverData)
    return render_template("generate_random_csv.html", res=serverData)




@application.route('/verificationSQL', methods=['POST'])
def verificationSQL():
    data=request.get_json()
    headers=data["headers"]
    final_data=data["final_data"]
    target_attribute=data["target_attribute"]
    target_attr_index=data["target_attr_index"]
    queryExecute=data["queryExecute"]
    number_na=-1
    rows_returned=0
    error=''
    sql_create_verify=generateCreateTableQuery(headers,"verify_table")
    conn = pymysql.connect(
        host= conf.host,
        port = conf.port, 
        user = conf.user, 
        password = conf.password, 
        db = conf.db, 
        )
    cur = conn.cursor()
    print("START")
    try:
        cur.execute("DROP TABLE IF EXISTS verify_table;")
        cur.execute(sql_create_verify)
        print(final_data)
        print(target_attr_index)
        #insertQuery_test=createInsertSqlQuery(final_data,'verify_table',target_attr_index,False)
        insertQuery="INSERT verify_table SELECT * FROM primary_table;"
        # print(insertQuery)
        rows_returned+=cur.execute(insertQuery)
        conn.commit()
        update_nas="Update verify_table set "+target_attribute+"=NULL"
        print(update_nas)
        cur.execute(update_nas)
        for vals in queryExecute:
            print(vals)
            vals=vals.replace("primary_table", "verify_table")
            rows_returned += cur.execute(vals)
        cur.execute("Select count(*) from verify_table where "+target_attribute+" is null;")
        details=cur.fetchall()
        number_na=details[0][0]
        print(number_na)
        conn.commit()
    except pymysql.Error as e:
        error = "Error occured: " + str(e)
        print(rows_returned)
    return {"result":number_na,"error":error}




@application.route('/sqlsnippet', methods=['GET'])
def sqlsnippet():
    return render_template("sqlSnippet.html")

@application.route('/sqlTutorialCode', methods=['POST'])
def sqlTutorialCode():
    data=request.get_json()
    sqlcode=data["sqlcode"]
    # print(sqlcode)
    error=''
    details=[]
    conn = pymysql.connect(
    host= "209.97.156.178",
    port = 3307, 
    user = "student", 
    password = "cs336", 
    db = "BarBeerDrinker", 
    )
    cur = conn.cursor()
    print("START")
    try:
        cur.execute(sqlcode)
        details=cur.fetchall()
        field_names = [i[0] for i in cur.description]
        details=list(details)
        details = [[str(j) for j in i] for i in details]
        details.insert(0,field_names)
        print(details)
        print(field_names)
    except pymysql.Error as e:
        error = "Error occured: " + str(e)
    return {"result":details,"error":error}

# @application.route('/testFileUpload', methods=['POST'])
# def testFileUpload():
#     file=request.files['file']
#     df = pd.read_csv(file)
#     print(df)
#     engine = create_engine('mysql+pymysql://{0}:%s@{1}:{2}/{3}'.format(conf.user,conf.host,conf.port,conf.db) % quote(conf.password))
#     try:
#         df.to_sql(name='test_file', con=engine, if_exists = 'replace', index=False)
#     except pymysql.Error as e:
#         error = "Error occured: " + str(e)
#     return "YOO"

# @application.route('/testingFile', methods=['GET'])
# def testingFile():
#     return render_template("testFileUpload.html")

def generateCreateTableQuery(headers,tablename):
    sql="CREATE TABLE "+tablename+"(ID INT NOT NULL,"
    for i,head in enumerate(headers):
        sql+=head+" "+"VARCHAR(250)"
        if(i!=len(headers)-1):
            sql+=","
    sql+=");"
    print(sql)
    return sql


def createInsertSqlQuery(val_data,tablename,target_attribute_id,without_id):
    final_query=""
    insertQuery="INSERT INTO "+tablename+" VALUES "
    random.shuffle(val_data)
    for j in range(len(val_data)):
        val=val_data[j]
        if(without_id):
            values="("
        else:
            values="("+str(j)+","
        for i,d in enumerate(val):
            if(target_attribute_id!=-1 and i==target_attribute_id):
                values+="NULL"
            else:
                d=str(d)
                d=d.replace('"','')
                values+='"'+d+'"'
            if(i!=len(val)-1):
                values+=","
        final_query+=values+")"
        if(j!=len(val_data)-1):
            final_query+=","
    return insertQuery+final_query

def calculateError(data,target_attribute_type):
    print(data)
    print(target_attribute_type)
    mse=0
    cnt=0
    if target_attribute_type=='numerical':
        for val in data:
            mse+=(float(val[0])-float(val[1]))**2
            cnt+=1
    else:
        for val in data:
            if(val[1] != val[0]):
                mse+=1
            cnt+=1
    mse=mse/cnt
    return mse


def savefile_and_returnfilename(foldername, filename, fileextension, filedata):
    if (os.path.isdir(foldername) == False):
        os.makedirs(foldername)

    pathname = foldername+'/'+filename+'.'+fileextension
    pattern = filename + "*."+fileextension

    if(path.isfile(pathname)):
        for file in os.listdir(foldername):
            if fnmatch.fnmatch(file, pattern):
                if "-" in file:
                    version = int(file.split("-")[1].split(".")[0])
                    version = version+1
                    newfilename = filename+"-"+str(version) + '.'+fileextension
                    pathname = foldername+'/'+newfilename
                    while(path.isfile(pathname) == True):
                        version = version+1
                        newfilename = filename+"-" + \
                            str(version) + '.'+fileextension
                        pathname = foldername+'/'+newfilename

                    filedata.save(os.path.join(foldername, newfilename))
                else:
                    newfilename = filename+"-1" + '.'+fileextension
                    filedata.save(os.path.join(foldername, newfilename))
                break
    else:
        newfilename = filename + '.'+fileextension
        filedata.save(os.path.join(foldername, newfilename))

    newfilename = newfilename.split(".")[0]
    return newfilename


if __name__ == "__main__":
    application.run(debug=True)
