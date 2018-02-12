from time import gmtime, strftime

file=open("output.txt","w")


file.write(strftime("%Y-%m-%d %H:%M:%S", gmtime()))

file.close()
