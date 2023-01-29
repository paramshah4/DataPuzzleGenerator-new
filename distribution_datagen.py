import random
# from matplotlib import pyplot as plt
import numpy as np


class datagenration_distributions() :

    def __init__(self) :
        pass

    def convert_to_csv(self,x,attrname):
        if len(x)==0:
            return
        
        else:
            cols = []
            cols.append(attrname)
            return {
            "cols" : cols,
            "data" : x
        }
        

    def powerlawdistribution(self,range0, range1,n,tuples,attrname):
        
        # x = []
        # if (float(range1)/float(tuples))<1 :
        #     if abs(float(range1)-float(tuples))*1.3<float(range1):
        #         range0=abs(float(range1)-float(tuples))*1.3
        #     else:
        #         range0=float(range1)/float(tuples)*float(range1)
        # else:
        #     range0=(float(range1)/float(tuples))*abs(float(range1)-float(tuples))
        range0=float(range0)
        range1=float(range1)
        n=float(n)
        tuples=int(tuples)
        if (n<0):
            n=-n
            n=n+4.5
            s = np.random.power(n, tuples)
            x=[None] * len(s)
            for i in range(len(s)):
                x[i]=round(range1-(abs(range1-range0)*s[i] ),2)
        elif(n>=0):
            n=n+4.5
            s = np.random.power(n, tuples)
            x=[None] * len(s)
            for i in range(len(s)):
                x[i]=round((abs(range1-range0)*s[i] )+ range0,2)
        # x.sort()
        
        data=self.convert_to_csv(x,attrname)
        # plt.hist(x,10)
        
        # plt.show()
        # plt.close()
        # print(x)
        return data
       
    # powerlawdistribution(1,10,4,100)

    def guassiandistribution(self,mean,sd,tuples,attrname):
        
        s = np.random.normal(float(mean), float(sd), int(tuples)).tolist()
        my_formatted_list = [ '%.2f' % elem for elem in s ]
        data=self.convert_to_csv(my_formatted_list,attrname)
        return data
        # bins=30
        # count, bins, ignored = plt.hist(s, 30, density=True)
        # plt.plot(bins, 1/(sigma * np.sqrt(2 * np.pi)) *np.exp( - (bins - mu)**2 / (2 * sigma**2) ),linewidth=2, color='r')
        # plt.show()

# guassiandistribution() 
# datagenration_distributions.powerlawdistribution(10,1000,5.5,7000)