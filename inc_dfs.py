import pandas as pd

tree = {
   "1":{
      "id":1,
      "name":"Grade = A",
      "pid":0
   },
   "2":{
      "id":2,
      "name":"Grade = B",
      "pid":0
   },
   "3":{
      "id":3,
      "name":"Grade = C",
      "pid":0
   },
   "4":{
      "id":4,
      "name":"Grade = D",
      "pid":0
   },
   "5":{
      "id":5,
      "name":"Grade = F",
      "pid":0
   },
   "6":{
      "id":6,
      "name":"Text = Always",
      "pid":1
   },
   "7":{
      "id":7,
      "name":"Text = Never",
      "pid":1,
      "new_val":"A"
   },
   "8":{
      "id":8,
      "name":"Text = Sometimes",
      "pid":1
   },
   "9":{
      "id":9,
      "name":"Score >= 80",
      "pid":6,
      "new_val":"A"
   },
   "10":{
      "id":10,
      "name":"Score < 80",
      "pid":6,
      "new_val":"B"
   },
   "11":{
      "id":11,
      "name":"Score >= 60",
      "pid":8,
      "new_val":"A"
   },
   "12":{
      "id":12,
      "name":"Score < 60",
      "pid":8,
      "new_val":""
   },
   "13":{
      "id":13,
      "name":"Participation >= 80",
      "pid":2,
      "new_val":"A"
   },
   "14":{
      "id":14,
      "name":"Participation < 80",
      "pid":2
   },
   "15":{
      "id":15,
      "name":"Score >= 80",
      "pid":14,
      "new_val":"A"
   },
   "16":{
      "id":16,
      "name":"Score < 80",
      "pid":14,
      "new_val":"B"
   },
   "new_target_variable":{
      "name":"New Grade",
      "type":"categorical"
   },
   "old_target_variable":{
      "name":"Grade",
      "type":"categorical",
      "values":[
         "A",
         "B",
         "C",
         "D",
         "F"
      ]
   },
   "attr_info":{
      "Doze":{
         "type":"categorical",
         "values":[
            "Always",
            "Never"
         ]
      },
      "Participation":{
         "type":"numerical",
         "values":[
            0,
            100
         ]
      },
      "Question":{
         "type":"categorical",
         "values":[
            "Always",
            "Never"
         ]
      },
      "Score":{
         "type":"numerical",
         "values":[
            0,
            100
         ]
      },
      "Text":{
         "type":"categorical",
         "values":[
            "Always",
            "Never",
            "Sometimes"
         ]
      }
   }
}

adj_list = {}
considerable = []
paths = []
new_var_name = tree["new_target_variable"]["name"]

ls = tree.keys()
ls = [int(i) for i in ls if i.isdigit()]
lowerbound, upperbound = min(ls), max(ls)

for i in tree:
    if(i.isdigit()):
        if(str(tree[i]["pid"]) != "0"):
            if(tree[i]["pid"] in adj_list):
                adj_list[tree[i]["pid"]].append(i)
            else:
                adj_list[tree[i]["pid"]] = [i]

for i in range(lowerbound, upperbound):
    if(i not in adj_list):
        if("new_val" in tree[str(i)] and len(tree[str(i)]["new_val"]) > 0):
            considerable.append(i)
    
print(considerable)

while(considerable):
    curr = considerable.pop()
    new_val = tree[str(curr)]["new_val"]
    temp = []
    
    while(curr != 0):
        temp.append(tree[str(curr)]["name"])
        curr = tree[str(curr)]["pid"]
        
    temp = temp[::-1]
    paths.append((temp, new_val))
    
print(paths)

df = pd.read_csv('Sample.csv')
df[new_var_name] = ""

def check_eligibility(tup, path):
    for p in path:
        if(">=" in p):
            t = p.split(">=")
            t = [i.strip() for i in t]
            
            if(t[0] in tup):
                if(int(tup[t[0]]) < int(t[1])):
                    return False
                
        elif("<" in p):
            t = p.split("<")
            t = [i.strip() for i in t]
            
            if(t[0] in tup):
                if(int(tup[t[0]]) >= int(t[1])):
                    return False
            
        else:
            t = p.split("=")
            t = [i.strip() for i in t]
            
            if(t[0] in tup):
                if(tup[t[0]] != t[1]):
                    return False
            
    return True

def convert_to_dic(ls):
    curr = {}
    
    for x in ls:
        x = x.split("=")
        x = [i.strip() for i in x]
        
        curr[x[0]] = x[1]
        
    return curr

cnt = 0

for index, row in df.iterrows():
    tup = row.to_dict()
    
    for eachPath in paths:
        if(check_eligibility(tup, eachPath[0])):
            df[new_var_name].loc[index] = eachPath[1]
            cnt += 1
            break

print(cnt)
df.to_csv("Sample2.csv", index = False)







