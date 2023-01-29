from importlib import import_module
import importlib
import random

class numeric_datageneration():
    def __init__(self):
        self.map_dic = {}
        self.module = ""
        self.attributes_info={}
        self.psuedo_data=[]
        self.module_name=""



    def generate_data(self, map_dic, module_name, N, attributes_info):
        self.psuedo_data = []
        self.attributes_info={}
        self.map_dic=map_dic
        self.attributes_info=attributes_info
        self.module_name=module_name
        # print("map_dic", map_dic)
        # print("module_name", module_name)
        # print("N", N)
        # print("attributes_info", attributes_info)
        # print("type(attributes_info)",type(attributes_info))
        if(module_name!= None):
            try:
                self.module = import_module("CodeModules." + module_name)
                importlib.reload(self.module)
            except Exception as e:
                return {"error" : "Exception: " + str(e)}
        attr_name= self.attributes_info["derived_attribute"][0]
        for x in range(int(N)):
            temp_t = self.generate_random_tuple()
            # print("temp_t",temp_t)
            derivedval= self.get_derived_value(attr_name,temp_t)
            derived_kvpair={}
            derived_kvpair[attr_name]=derivedval
            temp_t.update(derived_kvpair)
            self.psuedo_data.append(temp_t)
        # print(self.psuedo_data)

        return self.convert_to_csv()


    def generate_random_tuple(self):
        curr= list(self.attributes_info["base"])
        # print("curr",curr)
        curr_tuple = {}
        while(curr):
            key = random.choice(curr)
            values=self.attributes_info[key]["values"]
            value = ""
            if(self.attributes_info[key]["type"]=="categorical"):
                value = random.choice(values)
            else:
                lower = int(values[0])
                upper = int(values[1])
                value = random.randint(lower, upper)
            curr_tuple[key] = value
            curr.remove(key)
        return curr_tuple

    def get_derived_value(self, attr_name, t):
        method_name = self.map_dic[attr_name]["method_name"]
        params = self.map_dic[attr_name]["parameters"]
        
        args_dic = {}
        for x in params:
            args_dic[x] = t[x]
      
        method_itself = getattr(self.module, method_name)
        try:
            new_val = method_itself(**args_dic)
        except Exception as e:
            # print("OCCURED!")
            new_val = "Exception: " + repr(e) + " for '" + attr_name + "' in .py file."
    
        # print("new_val", new_val)
        return new_val


    def convert_to_csv(self):
        if(len(self.psuedo_data) == 0):
            return
            
        cols = []

        for i in self.attributes_info["base"]:
            cols.append(i)
        

        final_data = []
        cols.sort()
        for i in self.attributes_info["derived_attribute"]:
            cols.append(i)

        for i in self.psuedo_data:
            curr = []
            for x in cols:
                curr.append(i[x])
            
            final_data.append(curr)
        
        # print("cols",cols)
        # print("final_data",final_data)
        
        return {
            "cols" : cols,
            "data" : final_data,
            "modulename": self.module_name
        }