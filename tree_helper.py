import random
import numpy as np
from importlib import import_module
import importlib
from math import fsum

class TreeNode:
    def __init__(self, val):
        self.val = val
        self.children = []
        self.hasDistribution = ""

class Tree:
    def __init__(self):
        self.tree = None
        self.adj_list = None
        self.dic = {}
        self.target = {}
        self.root_id = -1
        self.base = set()
        self.derived = set()
        self.psuedo_data = []
        
        self.attributes = {}
        self.categorical = []
        self.numerical = []
        
        self.derived_attributes = {}
        self.derived_numerical = []
        self.derived_categorical = []
        self.derived_kvpair={}
        self.flag=0
        
    def clear_previous(self):
        self.tree = None
        self.adj_list = None
        self.dic = {}
        self.target = {}
        self.root_id = -1
        self.base = set()
        self.derived = set()
        self.psuedo_data = []
        self.map_dic = {}
        self.module = ""
        
        self.attributes = {}
        self.categorical = []
        self.numerical = []
        
        self.derived_attributes = {}
        self.derived_numerical = []
        self.derived_categorical = []
                
    def prepare_adj_list(self):
        adj_list = {}
        
        for i in self.tree:
            if(not i.isdigit()):
                continue
            
            if(str(self.tree[i]["pid"]) != "0"):
                key = self.tree[i]["pid"]
                value = self.tree[i]["id"]
                
                if(key in adj_list):
                    adj_list[key].append(value)
                else:
                    adj_list[key] = [value]
        # print(adj_list);
        self.adj_list = adj_list
        
    def build_tree(self, curr_id):
        node = self.dic[curr_id]
        
        if(curr_id not in self.adj_list):
            k = self.tree[str(curr_id)]
            this = self.target["distribution"]
            
            if("distribution" in k and len(k["distribution"]) > 0):
                this = k["distribution"]
                
            self.dic[curr_id].hasDistribution = this
            # print(self.dic[curr_id].hasDistribution)
            return
        
        for x in self.adj_list[curr_id]:
            temp = TreeNode(x)
            # print(x)
            node.children.append(temp)
            self.dic[x] = temp
            
            self.build_tree(x)
        
    
    def set_attr_type(self, attr_info, isBase):
        if(isBase):
            self.attributes = attr_info
            for x in attr_info:
                if(attr_info[x]["type"] == "numerical"):
                    self.numerical.append(x)
                else:
                    self.categorical.append(x)
        else:
            self.derived_attributes = attr_info
            for x in attr_info:
                if(attr_info[x]["type"] == "numerical"):
                    self.derived_numerical.append(x)
                else:
                    self.derived_categorical.append(x)
    
    def get_attribute_name(self, node_name):
        # print("node name"+node_name)
        if(">" in node_name or "<" in node_name):
            if(">" in node_name):
                ls = node_name.split(">=")
            else:
                ls = node_name.split("<")
        else:
                ls = node_name.split("=")

        # print(ls)
        
        
        if(len(ls) == 2):
            ls[0] = ls[0].strip()
            ls[1] = ls[1].strip()
            # print(ls)
            return ls
        
        return [node_name, 0]
        
    def generate_label(self, distribution):
        if(self.target["type"] == "categorical" ):
            values = self.target["values"]
            
            if(isinstance(self.target["values"], str)):
                values = self.target["values"].split(",")
            
            # print("distribution",distribution)
            probabilities = distribution.split(",")
            probabilities = [int(x) / 100 for x in probabilities]
            # print("probabilities",probabilities)
            
            if(fsum(probabilities) != 1.0):
                return ""
            
            x = np.random.choice(values, p=probabilities)
            return str(x)
    
    def generate_random_tuple(self):
        curr = list(self.attributes)
        # print("curr in generate_random_tuple ", curr)
        # print("self.categorical",self.categorical)
        # print("self.numerical",self.numerical)
        
        # print("self.derived_attributes",self.derived_attributes)
        # print("self.derived_numerical",self.derived_numerical) 
        # print("self.derived_categorical",self.derived_categorical)

        # if(len(curr)==0):
        #     self.main_method()
        
        curr_tuple = {}
        
        if(self.target["name"] in curr):
            curr.remove(self.target["name"])
        
        while(curr):
            key = random.choice(curr)
            
            values = self.attributes[key]["values"]
            value = ""
            
            if(key in self.categorical):
                value = random.choice(values)
            else:
                lower = int(values[0])
                upper = int(values[1])
                
                value = random.randint(lower, upper)
            
            curr_tuple[key] = value
            curr.remove(key)
        
        # print("curr_tuple", curr_tuple)
        return curr_tuple
        
    def decision_making(self, children):
        for x in children:
            nn = self.tree[str(x.val)]["name"]
            aname, val = self.get_attribute_name(nn)
            
            if(aname in self.derived):
                return True
            
        return False
     
    def get_derived_value(self, attr_name, t):
        method_name = self.map_dic[attr_name]["method_name"]
        params = self.map_dic[attr_name]["parameters"]
        ismasked=self.map_dic[attr_name]["masked"]
        args_dic = {}
        
        """
        Older approach with underscore.
        
        for x in params:
            if(" " in x):
                _x = x.replace(" ","_")
                args_dic[_x] = t[x]
        """
        
        for x in params:
            args_dic[x] = t[x]
      
        method_itself = getattr(self.module, method_name)
        # print("method_itself", method_itself)
        try:
            new_val = method_itself(**args_dic)
        except Exception as e:
            # print("OCCURED!")
            new_val = "Exception: " + repr(e) + " for '" + attr_name + "' in .py file."
    
        # print("new_val", new_val)
        return new_val
        
    def dfs_search(self, t, root):
        
       
        if(not isinstance(root, TreeNode)):
            return ""
        
        node_name = self.tree[str(root.val)]["name"]
        # print(node_name);
        attribute_name, attr_value = self.get_attribute_name(node_name)
        
        #print("Node and Attribute Name: ", node_name, attribute_name)
        
        if(len(root.children) == 0):
            #print("I am the root and my distribution is "+root.hasDistribution)
            
            return root.hasDistribution
        
        if(self.decision_making(root.children)):
            self.flag=0
            self.derived_kvpair={}
            any_node = self.tree[str(root.children[0].val)]["name"]
            # print("I am going to get attr name")
            adv_attr_name, adv_val = self.get_attribute_name(any_node)
            # print("adv_attr_name",adv_attr_name)
            
            ret = self.get_derived_value(adv_attr_name, t)
            # print("ret",ret)
            ismasked=self.map_dic[adv_attr_name]["masked"]
            if ismasked=="no":
                self.derived_kvpair[adv_attr_name]=ret;
                self.flag=1
            
            if(type(ret) == str and "Exception" in ret):
                return ret
                
            isCat = adv_attr_name in self.derived_categorical
            
            nextNode = ""
            
            if(isCat):
                if(ret not in self.derived_attributes[adv_attr_name]["values"]):
                    return "Exception: Out of domain value provided for '" + adv_attr_name + "' in .py file."
                
                nextNode = adv_attr_name + " = " + ret
            else:
                if(ret >= int(adv_val)):
                    nextNode = adv_attr_name + " >= " + adv_val
                else:
                    nextNode = adv_attr_name + " < " + adv_val
                # print("Next Node!! :"+ nextNode)
            
            mchild = -1
            
            for x in root.children:
                # print("Next Node: "+nextNode)
                if(self.tree[str(x.val)]["name"] == nextNode):
                    mchild = x.val
            
            if(mchild != -1):
                return self.dfs_search(t, self.dic[int(mchild)])
            
            return ""
            
        possible_children = {}
        
        for x in root.children:
            possible_children[self.tree[str(x.val)]["name"]] = x.val
        # print("Possible childer:")
        # print(possible_children)
        matching_child = -1
        # print("my all t")
        # print(t)
        for x in t:
            if(x in self.numerical):
                for key in possible_children:
                    if(x in key):
                        threshold = int(key.split(" ")[-1])
                        
                        if(int(t[x]) >= threshold):
                            matching_child = possible_children[x + " >= " + str(threshold)]
                        else:
                            matching_child = possible_children[x + " < " + str(threshold)]
                        break
            else:
                y = x + " = " + t[x]
                # print("this is the x in line 283")
                # print(x)
                if(y in possible_children):
                    matching_child = possible_children[y]
                    # print("I am the matching child")
                    # print(matching_child)
                    # print("self.dic[matching_child] is")
                    # print(self.dic[matching_child])
                    break
                else:
                    if(len(possible_children)==2):
                        for key in possible_children:
                            if(x==key.split("=")[0].strip()):
                                matching_child = (list(possible_children.items())[1][1])
                                # print("matchinf child ", matching_child)
                                break


        
        if(matching_child != -1):
            return self.dfs_search(t, self.dic[matching_child])
        else:
            for x in root.children:
                temp = self.dfs_search(t, x)
                
                if(len(temp) > 0):
                    return temp
                
            return ""
    
    def convert_to_csv(self):
        if(len(self.psuedo_data) == 0):
            return
            
        cols = []
        # print(self.psuedo_data)
        
        for i in self.psuedo_data[0][0]:
            # print("maybe cols name", i)
            cols.append(i)
        # if(self.derived_attributes):
        #     for i in self.derived_attributes:
        #         cols.append(i)

        final_data = []
        cols.sort()
        
        for i in self.psuedo_data:
            curr = []
            
            for x in cols:
                if(x in i[0]):
                    curr.append(i[0][x])
                # else:
                #     result=self.get_derived_value(x,i[0])
                #     curr.append(result)
            
            curr.append(i[1])
            final_data.append(curr)
        
        cols.append(self.target["name"])
        
        return {
            "cols" : cols,
            "data" : final_data
        }
    
    def generate_data(self, map_dic, module_name, N):
        # N = 10
        # print("Here i am ", N)
        self.map_dic = map_dic
        if(module_name!= None):
            try:
                self.module = import_module("CodeModules." + module_name)
                importlib.reload(self.module)
            except Exception as e:
                return {"error" : "Exception: " + str(e)}
        
        self.psuedo_data = []
        # print("Here i am ", N)
        # print(type(N))
        for x in range(int(N)):
            temp_t = self.generate_random_tuple()
            ans = self.dfs_search(temp_t, self.dic[self.root_id])
            
            # print("TRYING ON TUPLE: ", temp_t)
            # print("DISTRIBUTION WE GOT: ", ans)
            
            if("Exception" in ans):
                return {"error" : ans}
            
            res = self.generate_label(ans)
            # print("res", res)
            if(self.flag==1):
                temp_t.update(self.derived_kvpair)
                self.flag=0;
                self.derived_kvpair={}
                # print("temp_t",temp_t)
            self.psuedo_data.append([temp_t, res])
            
                
            
        return self.convert_to_csv()
    
    def main_method(self, tree):
        self.clear_previous()
        
        base_attr_info = {}
        derived_attr_info = {}
        
        for a in tree["attr_info"]:
            temp = {}
            temp[a] = tree["attr_info"][a]
            
            if(tree["attr_info"][a]["derived"] == "yes"):
                derived_attr_info.update(temp)
                self.derived.add(a)
            else:
                base_attr_info.update(temp)
                self.base.add(a)
                
        if(tree["target_variable"]["derived"] == "no"):
            self.base.add(tree["target_variable"]["name"])
        else:
            self.derived.add(tree["target_variable"]["name"])
        
        self.tree = tree
        self.target = tree["target_variable"]
        
        self.set_attr_type(base_attr_info, True)
        self.set_attr_type(derived_attr_info, False)
        
        self.prepare_adj_list()
        
        temp1 = self.tree.keys()
        
        temp2 = []
        
        for i in temp1:
            if(i.isdigit()):
                temp2.append(int(i))
        
        self.root_id = min(temp2)
        self.dic[self.root_id] = TreeNode(self.root_id)
        # print(self.root_id);
        self.build_tree(self.root_id)