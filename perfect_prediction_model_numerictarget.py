import pandas as pd
import numpy as np

class predictionmodel_numtarget():

    def __init__(self) :
        self.csvfile=None
        self.derivedcode=""
    
    def generate_new_col_pycode(self,columnname):
        
        methodname=self.derivedcode[self.derivedcode.find('def'):self.derivedcode.find('(')].strip()
        methodname=methodname.split(" ")[1]
        self.derivedcode=self.derivedcode.replace("**args","row")
        self.derivedcode=self.derivedcode.replace("args","row")
        self.derivedcode=self.derivedcode+"\n"+methodname+"(row)"
        self.derivedcode=self.derivedcode.replace("return ", "finalarray.append")
        finalarray=[]
        df = self.csvfile
        # print("self.derivedcode",self.derivedcode)
        df.apply (lambda row: exec(self.derivedcode,{'row':row,'finalarray':finalarray}), axis=1)
        def toappend(row, finalarray):
            return finalarray[row.name]
        df[columnname]=df.apply (lambda row: toappend(row,finalarray), axis=1)
        return df


    def perfect_prediction_model_numtar(self):
        columnname="Prediction"
        df=self.generate_new_col_pycode(columnname)
        MSE = np.square(np.subtract(df.iloc[: , -2],df.iloc[: , -1])).mean()
        return MSE


