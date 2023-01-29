import pandas as pd
import numpy as np
from io import BytesIO

class IncrementalTree:
    def __init__(self):
        self.csv_file = None
        self.tree = None
        self.adj_list = {}
        self.candidates = []
        self.paths = []
        self.whole_df = None
        self.new_var_name = ""
    
    def clear_previous(self):
        self.tree = None
        self.adj_list = {}
        self.candidates = []
        self.paths = []
        self.whole_df = None
        self.new_var_name = ""
        
    def extract_metadata(self):
        df = pd.read_csv(BytesIO(self.csv_file), nrows=25)
        whole_df = pd.read_csv(BytesIO(self.csv_file))
        
        attr_details = {}
        
        for name, dtype in df.dtypes.iteritems():
            if(np.issubdtype(np.int32, dtype) or np.issubdtype(np.int64, dtype) or np.issubdtype(np.float64, dtype)):
                attr_details[name] = {
                    "type":"numerical",
                    "values": [min(whole_df[name]), max(whole_df[name])]
                }
            elif(np.issubdtype(np.object, dtype)):
                whole_df[name] = whole_df[name].astype(str)
                attr_details[name] = {
                    "type": "categorical",
                    "values" : sorted(whole_df[name].unique())
                }
                
        return attr_details
    
    def build_adj_list(self):
        for i in self.tree:
            if(i.isdigit()):
                if(str(self.tree[i]["pid"]) != "0"):
                    if(self.tree[i]["pid"] in self.adj_list):
                        self.adj_list[self.tree[i]["pid"]].append(i)
                    else:
                        self.adj_list[self.tree[i]["pid"]] = [i]
    
    def candidate_generation(self):
        ls = self.tree.keys()
        ls = [int(i) for i in ls if i.isdigit()]
        low, high = min(ls), max(ls)
    
        for i in range(low, high):
            if(i not in self.adj_list):
                if("new_val" in self.tree[str(i)] and len(self.tree[str(i)]["new_val"]) > 0):
                    self.candidates.append(i)
            
    def path_generation(self):
        curr_cand = self.candidates.copy()
        
        while(curr_cand):
            curr = curr_cand.pop()
            if ("new_val" in self.tree[str(curr)]):
                new_val = self.tree[str(curr)]["new_val"]
                temp = []
                
                while(curr != 0):
                    temp.append(self.tree[str(curr)]["name"])
                    curr = self.tree[str(curr)]["pid"]
                    
                temp = temp[::-1]
                self.paths.append((temp, new_val))
            

    def check_eligibility(self, tup, path):
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
    
    def tuple_to_dic(self, tup):
        dic = {}
        
        for t in tup:
            ls = t.split("=")
            ls = [i.strip() for i in ls]
            
            dic[ls[0]] = ls[1]
            
        return dic
        
    def main_method(self, tree):
        self.clear_previous()
        
        self.whole_df = pd.read_csv(BytesIO(self.csv_file))
        self.tree = tree
        self.new_var_name = self.tree["new_target_variable"]["name"]
        old_var_name= self.tree["old_target_variable"]["name"]
        self.build_adj_list()
        self.candidate_generation()
        self.path_generation()
        
        self.whole_df[self.new_var_name] = ""
        cnt = 0
       
        for index, row in self.whole_df.iterrows():
            tup = row.to_dict()

            for eachPath in self.paths:
                if(self.check_eligibility(tup, eachPath[0])):
                    self.whole_df[self.new_var_name].loc[index] = eachPath[1]
                    cnt += 1
                    break
                # else:
                #     self.whole_df[self.new_var_name].loc[index] = tup[old_var_name]
        
        cols = list(self.whole_df.columns.values)
        self.whole_df.fillna('NA', inplace=True)
        final_data = [list(_) for _ in self.whole_df.values]
        
        print("****CHANGED:***** ", cnt)
        
        return {
            "cols" : cols,
            "data" : final_data
        }