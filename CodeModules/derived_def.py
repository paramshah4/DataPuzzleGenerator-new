def a(**args):
    return abs(args["Bride age"] - args["Groom age"])

def p(**args):
    if(args["Bride pers"] == args["Groom pers"]):
        return "Yes"
    
    return "No"

def i(**args):
    return (args["Bride salary"] + args["Groom salary"]) / (args["Bride age"] + args["Groom age"])