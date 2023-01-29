# -*- coding: utf-8 -*-
"""
Created on Wed Apr 14 10:39:42 2021
@author: Vraj
"""

import tree_helper as t
from importlib.machinery import SourceFileLoader
from importlib import import_module

tree = {
   "1":{
      "id":1,
      "name":"Root",
      "pid":0
   },
   "2":{
      "id":2,
      "name":"Bride age >= 25",
      "pid":1
   },
   "3":{
      "id":3,
      "name":"Bride age < 25",
      "pid":1,
      "distribution":"99,1,0"
   },
   "4":{
      "id":4,
      "name":"Groom age >= 30",
      "pid":2
   },
   "5":{
      "id":5,
      "name":"Groom age < 30",
      "pid":2,
      "distribution":"70,5,25"
   },
   "6":{
      "id":6,
      "name":"Age diff >= 5",
      "pid":4
   },
   "7":{
      "id":7,
      "name":"Age diff < 5",
      "pid":4
   },
   "8":{
      "id":8,
      "name":"Person comp = Yes",
      "pid":6
   },
   "9":{
      "id":9,
      "name":"Person comp = No",
      "pid":6,
      "distribution":"90,0,10"
   },
   "10":{
      "id":10,
      "name":"Adjusted inc >= 1",
      "pid":8,
      "distribution":"10,10,80"
   },
   "11":{
      "id":11,
      "name":"Adjusted inc < 1",
      "pid":8
   },
   "target_variable":{
      "name":"Status",
      "distribution":"40,20,40",
      "type":"categorical",
      "values":[
         "Married",
         "Divorced",
         "Separated"
      ],
      "derived":"no"
   },
   "attr_info":{
      "Bride age":{
         "type":"numerical",
         "values":[
            "18",
            "60"
         ],
         "derived":"no"
      },
      "Groom age":{
         "type":"numerical",
         "values":[
            "18",
            "60"
         ],
         "derived":"no"
      },
      "Bride salary":{
         "type":"numerical",
         "values":[
            "10",
            "1000"
         ],
         "derived":"no"
      },
      "Groom salary":{
         "type":"numerical",
         "values":[
            "10",
            "1000"
         ],
         "derived":"no"
      },
      "Bride pers":{
         "type":"categorical",
         "values":[
            "A",
            "B"
         ],
         "derived":"no"
      },
      "Groom pers":{
         "type":"categorical",
         "values":[
            "A",
            "B"
         ],
         "derived":"no"
      },
      "Age diff":{
         "type":"numerical",
         "values":[
            "",
            ""
         ],
         "derived":"yes"
      },
      "Person comp":{
         "type":"categorical",
         "values":[
            "Yes",
            "No"
         ],
         "derived":"yes"
      },
      "Adjusted inc":{
         "type":"numerical",
         "values":[
            "",
            ""
         ],
         "derived":"yes"
      }
   }
}
obj = t.Tree()

great_tuple = {'Groom salary': 798, 'Bride pers': 'B', 'Bride age': 45, 'Bride salary': 986, 'Groom pers': 'No', 'Groom age': 30}
great_tuple_2 = {'Groom age': 43, 'Bride age': 54, 'Bride pers': 'B', 'Bride salary': 203, 'Groom salary': 439, 'Groom pers': 'Yes'}
great_tuple_3 = {'Bride salary': 639, 'Bride pers': 'B', 'Bride age': 44, 'Groom salary': 816, 'Groom age': 32, 'Groom pers': 'Yes'}

map_dic = {
    "Age diff" : {
        "parameters" : ["Bride age", "Groom age"],
        "method_name" : "getAgeDiff"
        },
    "Person comp" : {
        "parameters" : ["Bride pers", "Groom pers"],
        "method_name" : "getPersonComp"
        },
    "Adjusted inc" : {
        "parameters" : ["Groom salary", "Bride salary", "Groom age", "Bride age"],
        "method_name" : "getAdjustedInc"
        }
    }

obj.main_method(tree)
res = obj.generate_data(map_dic, "derived_def")

print(res)

#obj.map_dic = map_dic
#obj.module = import_module("CodeModules.derived_def")
#print(obj.dfs_search(great_tuple, obj.dic[obj.root_id]))

"""
#tt = {'Groom salary': 798, 'Bride pers': 'B', 'Bride age': 45, 'Bride salary': 986, 'Groom pers': 'No', 'Groom age': 16}
#obj.dfs_search(tt, obj.dic[obj.root_id])


print(obj.tree[str(obj.dic[4].children[0].val)]["name"])

s = """
def person_comp(self, bp, gp):
    if(gp == bp):
        return 'Yes'
    
    return 'No'
"""

#class_method = getattr(obj, "get_attribute_name")
#class_method(great_tuple, obj.dic[obj.root_id])
#print(class_method("Personality comp = Yes"))

#class_method = getattr(t, "trial_method")
#class_method(10)

file_name = "derived_def"

#ff = SourceFileLoader("derived_def",r"\quiz_generator\example\derived_def.py").load_module()
ff = import_module("derived_def")




da = "Age diff"
vals = {
        "Bride age" : 26,
        "Groom age" : 39
        }

method = getattr(ff, map_dic[da]["method_name"])
args = [vals[map_dic[da]["parameters"][0]], vals[map_dic[da]["parameters"][1]]]
pp = method(args)

#prath = ff.__dict__[map_dic[da]["method_name"]]
#print(prath([vals[map_dic[da]["parameters"][0]], vals[map_dic[da]["parameters"][1]]]))

"""