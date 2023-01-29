import tree_helper as treebuilder
import pandas as pd
import numpy as np
from io import BytesIO
tree_object = treebuilder.Tree()
import perfect_prediction_model_numerictarget as generatederivedcolcode
ppm_numtar_object=generatederivedcolcode.predictionmodel_numtarget()

class predictionmodel():

    def __init__(self):
        self.csv_file = None
        self.json_file = None
        self.globalPath = []
        self.values = []
        self.derivedcode=""

    def clear_previous(self):

        self.globalPath = []
        self.values = []

    def perfect_prediction_model(self):
        self.clear_previous()
        tree_object.main_method(self.json_file)
        self.children1(tree_object.root_id, [])
        conditions = (','.join(self.globalPath))
        # print("conditions", conditions)
        # print("values", self.values)
        accuracy = self.new_column_generation(conditions, self.values)
        return accuracy

    def children1(self, id, path):
        path.append(id)
        if(len(tree_object.dic[id].children) == 0):
            finalpath = self.processPath(path)
            if(len(finalpath) > 0):
                finalpath.pop(0)
                r, values = self.conditions_making(finalpath)
                # print("r", r)
                self.globalPath.append(r)
        for x in tree_object.dic[id].children:
            pathCopy = [y for y in path]
            self.children1(x.val, pathCopy)

    def processPath(self, path):
        newPath = []
        leafindex = path[len(path) - 1]
        distribution = (tree_object.dic[leafindex].hasDistribution)
        if(distribution != tree_object.target['distribution']):
            for i in range(len(path)):
                id = path[i]
                node = tree_object.tree[str(id)]
                newPath.append(node["name"])
                if (i == len(path) - 1):
                    probs = distribution.split(",")
                    index = probs.index(max(probs))
                    result = tree_object.target['values'][int(index)]
                    newPath.append(result)

        # print("newPath")
        # print(newPath)
        return newPath

    def conditions_making(self, finalpath):
        for i in range(len(finalpath)):
            if(finalpath[i].count("NOT") == 0):
                if (i == 0):
                    x = "("+self.make_string(finalpath[i])+")"
                elif(i != len(finalpath) - 1):
                    if('x' in locals()):
                        x += " & (" + self.make_string(finalpath[i]) + ")"
                    else:
                        x = "("+self.make_string(finalpath[i])+")"
                elif(i == len(finalpath) - 1):
                    self.values.append(finalpath[i])
        # print(x)
        return x, self.values

    def make_string(self, path):
        if(path.count("NOT") == 0):
            if(">=" in path):
                x = "df['"+path.split('>=')[0].strip() + \
                    "'] >= " + path.split('>=')[1]
            elif("=" in path):
                x = "df['"+path.split('=')[0].strip()+"'] == '" + \
                    path.split('=')[1].strip() + "'"
            elif("<" in path):
                x = "df['"+path.split('<')[0].strip() + \
                    "'] <" + path.split('<')[1]
            return x
    def generate_new_col_derived(self,df):
        ppm_numtar_object.derivedcode=self.derivedcode
        for x in tree_object.derived_numerical:
            ppm_numtar_object.csvfile=df
            columnname=x
            df=ppm_numtar_object.generate_new_col_pycode(columnname)
            cols = list(df.columns)
            cols =  cols[:-2] + [cols[-1]] + [cols[-2]]
            df=df[cols]
        return df


    def new_column_generation(self, conditions, values):
        df = self.csv_file
        if(len(tree_object.derived_numerical)>0 ):
            df=self.generate_new_col_derived(df)
        if (len(conditions)!=0 and len(values)!=0):
            df['Prediction'] = np.select(eval("["+conditions+"]"), values)
        else:
            df['Prediction'] ="0"
        target_probs=tree_object.target['distribution'].split(",")
        index = target_probs.index(max(target_probs))
        default = tree_object.target['values'][int(index)]
        df.loc[df['Prediction'] == "0", 'Prediction'] = default
        # print(df)
        df['ForMeanCalc'] = np.where((df.iloc[: , -2] == df.iloc[: , -1]), 1, 0)
        accuracy = df["ForMeanCalc"].mean()*100
        return str(round(accuracy, 2))
