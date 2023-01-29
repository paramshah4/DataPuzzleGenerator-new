import tree_helper as th

tree = {
   "2":{
      "id":2,
      "name":"Root",
      "pid":0
   },
   "3":{
      "id":3,
      "name":"Score >= 90",
      "pid":2
   },
   "4":{
      "id":4,
      "name":"Score < 90",
      "pid":2
   },
   "5":{
      "id":5,
      "name":"Question = Never",
      "pid":3,
      "distribution":"0,100,0,0,0"
   },
   "6":{
      "id":6,
      "name":"Question = Always",
      "pid":3,
      "distribution":"100,0,0,0,0"
   },
   "7":{
      "id":7,
      "name":"Score >= 40",
      "pid":4
   },
   "8":{
      "id":8,
      "name":"Score < 40",
      "pid":4,
      "distribution":"0,0,0,0,100"
   },
   "9":{
      "id":9,
      "name":"Participation >= 50",
      "pid":7,
      "distribution":"10,70,20,10,0"
   },
   "10":{
      "id":10,
      "name":"Participation < 50",
      "pid":7,
      "distribution":"0,70,15,15,0"
   },
   "target_variable":{
      "name":"Grade",
      "distribution":"20,20,20,20,20",
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
      "Participation":{
         "type":"numerical",
         "values":[
            "0",
            "100"
         ]
      },
      "Score":{
         "type":"numerical",
         "values":[
            "0",
            "100"
         ]
      },
      "Doze":{
         "type":"categorical",
         "values":[
            "Never",
            "Always"
         ]
      },
      "Text":{
         "type":"categorical",
         "values":[
            "Never",
            "Sometimes",
            "Always"
         ]
      },
      "Question":{
         "type":"categorical",
         "values":[
            "Never",
            "Always"
         ]
      }
   }
}

temp_t = {
             "Score" : "80",
             "Question" : "Never",
             "Doze" : "Always",
             "Text" : "Never",
             "Participation" : "60"
         }

th_obj = th.Tree()
th_obj.main_method(tree)
print("Distribution: ",th_obj.dfs_search(temp_t, th_obj.dic[th_obj.root_id]))
print("*"*50)

"""
th_obj = th.Tree()
th_obj.main_method(tree)
th_obj.generate_data(100)

"""

"""
for x in range(10):
    temp_t = th_obj.generate_random_tuple()
    ans = th_obj.dfs_search(temp_t, th_obj.dic[th_obj.root_id])
    res = th_obj.generate_label(ans)
    
    print(temp_t)
    print(ans)
    print(res)
    
    print("*"*50)
"""

def prepare_adj_list_id(tree):
    adj_list = {}
    
    for i in tree:
        if(not i.isdigit()):
            continue
        
        if(str(tree[i]["pid"]) != "0"):
            key = tree[i]["pid"]
            value = tree[i]["id"]
            
            if(key in adj_list):
                adj_list[key].append(value)
            else:
                adj_list[key] = [value]
        
    return adj_list

class TreeNode:
    def __init__(self, val):
        self.val = val
        self.children = []
        self.hasDistribution = ""

default_distribution = "5,15,15,40,20,5"
dic = {}
root_id = int(min(tree))
dic[root_id] = TreeNode(root_id)

def build_tree_id(curr_id, adj):
    node = dic[curr_id]
    
    if(curr_id not in adj):
        k = tree[str(curr_id)]
        this = default_distribution
        
        if("distribution" in k):
            this = k["distribution"]
            
        dic[curr_id].hasDistribution = this
        return
    
    for x in adj[curr_id]:
        temp = TreeNode(x)
        node.children.append(temp)
        dic[x] = temp
        
        build_tree_id(x, adj)

adj = prepare_adj_list_id(tree)
build_tree_id(root_id, adj)

categorical = {"Doze off", "Asks question", "Texting", "Grade"}
numerical = {"Participation", "Score"}

t = [{
      "Doze off" : "Always", 
      "Asks question" : "Always", 
      "Participation" : "80", 
      "Texting" : "Always", 
      "Score" : "90"
     },
     {
      "Doze off" : "Always", 
      "Asks question" : "Sometimes", 
      "Participation" : "80"
     },
     {
      "Doze off" : "Never",
      "Texting" : "Always",
      "Score" : "100"
     },
     {
     "Doze off" : "Always",
     "Participation" : "51",
     "Score" : "25"
     },
     {
     "Doze off" : "Always",
     "Participation" : "25",
     "Score" : "80",
     "Texting" : "Never"
     },
     {
     "Doze off" : "Always",
     "Texting" : "Never",
     "Asks question" : "Always",
     "Participation" : "90"
     },
]

t1 = [
     {'Doze off': 'Never', 'Participation': 92},
     {
     "Doze off" : "Always",
     "Participation" : "51",
     "Score" : "25"
     }
]

def dfs_search(t, root):
    if(not isinstance(root, TreeNode)):
        return ""
    
    if(len(root.children) == 0):
        __attr = " ".join(tree[str(root.val)]["name"].split(" ")[:-2])
        
        if(__attr in t):
            return root.hasDistribution
    
        return ""
    
    possible_children = {}
    
    for x in root.children:
        possible_children[tree[str(x.val)]["name"]] = x.val
    
    matching_child = -1
    
    for x in t:
        if(x in numerical):
            for key in possible_children:
                if(x in key):
                    threshold = int(key.split(" ")[-1])
                    
                    if(int(t[x]) >= threshold):
                        matching_child = possible_children[x + " >= " + str(threshold)]
                    else:
                        matching_child = possible_children[x + " < " + str(threshold)]
                    break
        else:
            x = x + " = " + t[x]
            if(x in possible_children):
                matching_child = possible_children[x]
                break
    
    if(matching_child != -1):
        return dfs_search(t, dic[matching_child])
    else:
        for x in root.children:
            temp = dfs_search(t, x)
            
            if(len(temp) > 0):
                return temp
            
        return ""

for each_t in t1:
    print(dfs_search(each_t, dic[root_id]))
    print("-"*50)