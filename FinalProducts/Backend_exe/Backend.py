import pandas as pd
import time
import math
import numpy as np
import datetime as dt

start = time.time()


def sumCost(df,metric):
    # type: (object, object) -> object
    return df[metric].sum()


def compareCost(df, dfnew):
    if (sumCost(df) > sumCost(dfnew)):
        df = dfnew
    return


thousandSeparator = lambda x: '{:,.0f}'.format(x)
# rounding up functions
round3dp = lambda x: round(x, 3)
round1dp = lambda x: round(x, 1)
roundint = lambda x: round(x, 0)

absolute_folder = raw_input(
    "Enter folder path (E.g '/Users/username/Downloads'): ")  # folder name that python code and shipment files are in


def masterTariff(start):
    # Tariff Table File
    # take in csv shipment data from specific origin
    MTa = pd.read_csv(absolute_folder + "/Tariffs.csv", low_memory=False)

    # strip unwanted white spaces in column headers
    MTa.rename(columns=lambda x: x.strip(), inplace=True)

    # Cleaning the Amount column data, removing unneccessary elements(like ,) for later processing
    MTa['Amount'] = MTa['Amount'].astype(str)
    MTa['Amount'] = MTa['Amount'].str.replace(',', '')
    # Converting Amount to integer
    MTa['Amount'] = MTa['Amount'].astype(int)

    # Creation of Final File
    Final = MTa.groupby(['Route', 'Sh'])[['Amount']].mean()
    Final.reset_index(level='Sh', inplace=True)
    Final.reset_index(level='Route', inplace=True)


    # Truck Master File
    # take in csv shipment data from specific origin
    TM = pd.read_csv(absolute_folder + "/TruckMaster.csv", low_memory=False)

    # strip unwanted white spaces in column headers
    TM.rename(columns=lambda x: x.strip(), inplace=True)

    '''
    # # delete unneccessary column
    TM.drop('Vehicle Pallet Capacity (Pallet floor space)', axis=1, inplace=True)
    TM.drop('Vehicle Classification', axis=1, inplace=True)
    TM.drop('Truck Size', axis=1, inplace=True)
    TM.drop('Truck Type Short Form', axis=1, inplace=True)
    TM.drop('Unnamed: 10', axis=1, inplace=True)
    TM.drop('Truck Type', axis=1, inplace=True)
    TM.drop('Weight Tons', axis=1, inplace=True)
    TM.drop('Case Capacity', axis=1, inplace=True)
    TM.drop('Pallet', axis=1, inplace=True)
    TM.drop('Loose Case Loading/Unloading  Time (hr)', axis=1, inplace=True)
    TM.drop('Loose Case Loadiong /Unloading producivity (case/hr)', axis=1, inplace=True)
    TM.drop('Pallet Unloading producivity (Pallets/Hr)', axis=1, inplace=True)
    '''

    # Combining the 2 Dataframes, bringing the Truck info to the Tariff Table
    Final = pd.merge(Final, TM, how='left', left_on='Sh', right_on='Shipping Type Code')

    # Renaming the headers to short form
    Final.rename(columns={'Mod of Transport': 'MoT',
                          'Vehicle Weight Capacity (Kg)': 'Weight',
                          'Vehicle  Volume Capacity (M3)': 'Vol',
                          'Vehicle Type': 'Temp'}, inplace=True)

    # Removing any rows that have NA values
    Final.dropna(subset=['Route','Sh','Amount','Shipping Type Code','Shipping Type Description','Weight','Vol','MoT','Temp'], inplace=True)
    # Resetting the index to run in order after removing NA rows
    Final.reset_index(drop=True, inplace=True)

    # Renaming the MoT data
    Final['MoT'].replace(['Road'], 'Land', inplace=True)
    Final['MoT'].replace(['Water'], 'Sea', inplace=True)

    # Converting the volume and weight to integer and volume to cm3
    Final['Vol'] = Final['Vol'].astype(int) * 1000000
    Final['Weight'] = Final['Weight'].astype(int)

    # Sorting the Trucks by cost
    Final.sort_values(by=['Amount'], ascending=True, kind='mergesort', inplace=True)

    # Output Master Tariff table to CSV for deepdive
    Final.to_csv(absolute_folder + "/Collated Master Tariff Table.csv")

    print("Unique Entries in Master Tariff Table: %s" % len(Final.index))

    print "Total Program Run Time for Collated Master Tariff Table = ", time.time() - start

    return Final;

# SHIPMENT FILE
# take in csv shipment data from specific origin
df = pd.read_csv(absolute_folder + "/File.csv", low_memory=False)

# strip unwanted white spaces in column headers
df.rename(columns=lambda x: x.strip(), inplace=True)
'''
# delete unneccessary column
df.drop('Check Out Time', axis=1, inplace=True)
df.drop('Check Out Date', axis=1, inplace=True)
'''
'''
# Should be removed because should not exist in Template
df.drop('Java Area?', axis=1, inplace=True)
df.drop('Creation Month', axis=1, inplace=True)
df.drop('Baseline', axis=1, inplace=True)
df.drop('38 BINDR', axis=1, inplace=True)
df.drop('Unnamed: 45', axis=1, inplace=True)
df.drop('Non Shuttle', axis=1, inplace=True)
'''

# remove all rows that have missing elements and reindex afterwards
df.dropna(subset=['Route','Temp. Condition','MoT','Check in Date','Volume','Gross','Dlv.qty','Std KG','Std M3','LoadFill','BaseCost'],inplace=True)
#df.dropna(subset=['Check Out Time'], inplace=True)
df.reset_index(drop=True, inplace=True)

# add LF column
df['LF'] = df.LoadFill.apply(round3dp)

# add Vol column
df['Vol'] = df['Volume'] / 1000000
df['Vol'] = df.Vol.apply(round1dp)

# add Weight column
df['Weight'] = df['Gross']
df['Weight'] = df.Weight.apply(roundint)

# add TS column, describes the capacity of the truck used in tonnes
df['TS'] = df['Std KG'] / 1000
df['TS'] = df.TS.apply(round1dp)

# #add LF<1? column (might not be neccessary) outputs 1 or 0
# df['LF<1?'] = df['LF'].apply(lambda x: '1' if x <= 100 else 0)

df.rename(columns={'Temp. Condition': 'Temp'}, inplace=True)

# Cleaning the BaseCost column data, removing unneccessary elements(like ,) for later processing
df['BaseCost'] = df['BaseCost'].astype(str)
df['BaseCost'] = df['BaseCost'].str.replace(',', '')
df['BaseCost'] = df['BaseCost'].astype(int)

# Cleaning the Div.qty column data, removing unneccessary elements(like ,) for later processing
df['Dlv.qty'] = df['Dlv.qty'].astype(str)
df['Dlv.qty'] = df['Dlv.qty'].str.replace(',', '')
df['Dlv.qty'] = df['Dlv.qty'].astype(int)

# new columns for method implementation
# New Truck Type
df['New SH'] = df['ST']
# New Base Cost
df['New BC'] = df['BaseCost']
# Whether potential for savings present
df['Savings'] = 0
# New Volume, weight transported plus new Loadfill
df['New TVol'] = df['Std M3'] * 1000000
df['New TWeight'] = df['Std KG']
df['New LF'] = df['LF']


totalCount = 1

print("Total Shipments: %s" % len(df.index))


method = input("Select desired cost saving method(s) (0 for raw data sanitization, 1-Truck Downsizing, 2-Truck Consolidation, 3 for both) : ")

if (method==0):
    df.to_csv(absolute_folder + "/Sanitized Raw File.csv")
    df.to_csv(absolute_folder + "/Cost Saving Method 1 Deep Dive.csv")


if (method == 1 or method == 3):
    Final= masterTariff(start)

    df1 = df.copy(deep=True)  # df1 is for method 1

    for i in range(len(df1.index)):
        print("[%s/%s]" % (totalCount, len(df1.index)))
        totalCount = totalCount + 1
        currentRoute = df1.loc[i, 'Route']
        currentMoT = df1.loc[i, 'MoT']
        currentTemp = df1.loc[i, 'Temp']
        currentWeight = df1.loc[i,'Weight']
        currentVol = df1.loc[i,'Volume']
        df_test = Final[(Final.Route == currentRoute) & (Final.MoT == currentMoT) & (
                Final.Temp == currentTemp) & (Final.Vol >= currentVol) & (Final.Weight >= currentWeight)]
        if((df_test.empty != True) and (df_test['Amount'].values[0] < df1.loc[i,'BaseCost'])):
            df1.loc[i, 'New BC'] = df_test['Amount'].values[0]
            df1.loc[i, 'New SH'] = df_test['Sh'].values[0]
            df1.loc[i, 'New TVol'] = df_test['Vol'].values[0]
            df1.loc[i, 'New TWeight'] = df_test['Weight'].values[0]
            df1.loc[i, 'Savings'] = df1.loc[i, 'BaseCost'] - df1.loc[i, 'New BC']
            df1.loc[i, 'New LF'] = max(df1.loc[i, 'Volume'] / df1.loc[i, 'New TVol'],
                                      df1.loc[i, 'Weight'] / df1.loc[i, 'New TWeight'])


#    print "Total Program Run Time for Method 1 Savings = ", time.time() - start
    time_marker = time.time()

    # Summary Info for Cost Saving Method 1
    Mtd1_summary = df1
    Mtd1_summary['Count'] = 1
    Mtd1_summary = Mtd1_summary.groupby(['ST', 'New SH'])[['Savings', 'Count']].sum()
    Mtd1_summary.reset_index(level='New SH', inplace=True)
    Mtd1_summary.reset_index(level='ST', inplace=True)

    # Creating List for Truck Type and Description
    Truck_Des = Final[['Sh', 'Shipping Type Description']].drop_duplicates().reset_index(drop=True)

    # Inserting Old Truck Description
    Mtd1_summary = pd.merge(Mtd1_summary, Truck_Des, left_on='ST', right_on='Sh')
    Mtd1_summary.rename(columns={'ST': 'Old Truck Type', 'Shipping Type Description': 'Old Truck Type Description'},
                        inplace=True)
    Mtd1_summary.drop('Sh', axis=1, inplace=True)

    # Inserting New Truck Description
    Mtd1_summary = pd.merge(Mtd1_summary, Truck_Des, left_on='New SH', right_on='Sh')
    Mtd1_summary.rename(columns={'New SH': 'New Truck Type', 'Shipping Type Description': 'New Truck Type Description'},
                        inplace=True)
    Mtd1_summary.drop('Sh', axis=1, inplace=True)

    # Rearranging Columns
    Mtd1_summary = Mtd1_summary[
        ['Old Truck Type', 'Old Truck Type Description', 'New Truck Type', 'New Truck Type Description', 'Count',
         'Savings']]

    # Sorting the List by greatest cost savings
    Mtd1_summary.sort_values(by=['Savings'], ascending=False, kind='mergesort', inplace=True)

    Mtd1_summary.reset_index(drop=True, inplace=True)

    Mtd1_summary.index.name = 'Index'

    Mtd1_summary['Savings'] = Mtd1_summary.Savings.apply(thousandSeparator)
#    print "Total Program Run Time for Method 1 Summary Table = ", time.time() - time_marker

    df1.drop(['Count'], axis=1, inplace=True)

    # Output Files
    df1.to_csv(absolute_folder + "/Cost Saving Method 1 Deep Dive.csv")
    Mtd1_summary.to_csv(absolute_folder + "/m1consolidated.csv")

    print("Original Total Cost($): %s" % sumCost(df,"BaseCost"))  # Total cost of raw data
    print("New Total Cost from Truck Downsizing ($): %s" % sumCost(df1,"New BC"))  # Total cost after method 1
    print("Total Savings from Truck Downsizing ($): %s" % (sumCost(df1,"Savings")))
    print("Percentage Savings from Truck Downsizing: %s percent" % ((sumCost(df1,"Savings") * 100.0 / sumCost(df1,"BaseCost"))))



if (method == 2 or method == 3):

    Final= masterTariff(start)

    if(method==2):
        df.to_csv(absolute_folder + "/Cost Saving Method 1 Deep Dive.csv")

    df2 = df.copy(deep=True)  # df2 is for method 2

    df2['Check in Date'] = df2['Check in Date'].apply(lambda x:
                                                      dt.datetime.strptime(x,'%d/%m/%y'))

    df2['DaysFromStart'] = df2['Check in Date'] - min(df2['Check in Date'])

    df2['DaysFromStart']= df2['DaysFromStart'].dt.days+1

#    df2['DaysFromStart'] = ((df2['DaysFromStart'].astype(int)) // 86400000000000) + 1
#    print((df2.loc[1,'DaysFromStart']))

    df2.sort_values(by=['DaysFromStart'], ascending=True, kind='mergesort', inplace=True)

    startDate = input("For Truck Consolidation, enter the starting day from first date for analysis (First date in data = %s) (Minimum=1): " % (
        min(df2['Check in Date']).date()))
    consoDay = input("Enter number of days for shipment consolidation (Default=1): ")

    lastDate = max(df2.DaysFromStart)
    lastConsoDate = lastDate - ((lastDate - startDate + 1) % consoDay)

    metric = raw_input("Enter metric to be used (V - Volume, W - Weight): ")

    # Creation of Columns for method 2
    CRtable = Final.copy(deep=True)

    if (metric == 'V'):

        CRtable['CostRatio'] = CRtable.Amount / CRtable.Vol
        CRtable['LoadDensity'] = CRtable.Weight / CRtable.Vol

        CRtable.sort_values(by=['CostRatio'], ascending=True, kind='mergesort', inplace=True)
        CRtable.reset_index(drop=True, inplace=True)

        #	print(lastConsoDate)
        if (startDate + consoDay - 1 > lastDate):
            print ("Error: The date range for analysis is shorter than consolidation days.")
        else:
            df2_final = pd.DataFrame(
                columns=['Route', 'MoT', 'Temp', 'BaseCost', 'Vol', 'Weight', 'OldShipmentCount', 'Check in Date',
                         'New SH', 'New Cost'])
            for i in range(startDate, lastConsoDate + 1, consoDay):
                df_conso = df2[(df2.DaysFromStart >= i) & (df2.DaysFromStart < i + consoDay)]
                df_conso = df_conso.groupby(["Route", "MoT", "Temp"]).agg({'Shipment': 'count',
                                                                           'BaseCost': 'sum',
                                                                           'Volume': 'sum',
                                                                           'Weight': 'sum',
                                                                           'Check in Date': 'first',
                                                                           'ST': lambda x: ','.join(x)}).reset_index()
                df_conso.rename(columns={'Shipment': 'OldShipmentCount',
                                         'ST': 'Old_SH'}, inplace=True)
                df2_final = df2_final.append(df_conso)[df_conso.columns.tolist()]
            df2_final.reset_index(drop=True, inplace=True)
            df2_final['netVol'] = df2_final.Volume
            df2_final['netWeight'] = df2_final.Weight
            df2_final['New_SH'] = np.nan
            df2_final['New_BC'] = np.nan
            df2_final['NewShipmentCount'] = df2_final.OldShipmentCount
            df2_final['Savings'] = 0
            df2_final['Updated Base Cost'] =  df2_final['BaseCost']
            df2_final['Updated Shipment Count']=df2_final['OldShipmentCount']


            for i in range(len(df2_final.index)):
                print("[%s/%s]" % (i, len(df2_final.index)))
                if (df2_final.loc[i, 'OldShipmentCount'] != 1):
                    currentRoute = df2_final.loc[i, 'Route']
                    currentMoT = df2_final.loc[i, 'MoT']
                    currentTemp = df2_final.loc[i, 'Temp']
                    loadDensity = df2_final.loc[i, 'Weight'] / df2_final.loc[i, 'Volume']
                    df_test = CRtable[(CRtable.Route == currentRoute) & (CRtable.MoT == currentMoT) & (
                                CRtable.Temp == currentTemp) & (CRtable.LoadDensity >= loadDensity)]
                    if (df_test.empty != True):
                        truckType = df_test['Sh'].values[0]
                        truckVol = df_test['Vol'].values[0]
                        truckCost = df_test['Amount'].values[0]
                        df2_final.loc[i, 'NewShipmentCount'] = 0
                        df2_final.loc[i, 'New_BC'] = 0
                        while (df2_final.loc[i, 'netVol'] >= truckVol):
                            df2_final.loc[i, 'netVol'] = df2_final.loc[i, 'netVol'] - truckVol
                            df2_final.loc[i, 'netWeight'] -= (truckVol * loadDensity)
                            df2_final.loc[i, 'NewShipmentCount'] += 1
                            df2_final.loc[i, 'New_SH'] = truckType
                            df2_final.loc[i, 'New_BC'] += truckCost
                        for counter in range(int(df2_final.loc[i, 'NewShipmentCount']) - 1):
                            df2_final.loc[i, 'New_SH'] = df2_final.loc[i, 'New_SH'] + "," + truckType
                    if (df2_final.loc[i, 'netVol'] != 0):
                        df_test = df_test[(df_test.Vol >= df2_final.loc[i, 'netVol']) & (
                                    df_test.Weight >= df2_final.loc[i, 'netWeight'])]
                        if (df_test.empty != True):
                            df_test.sort_values(by=['Amount'], ascending=True, kind='mergesort', inplace=True)
                            if (pd.isnull(df2_final['New_SH'].loc[i])):
                                df2_final.loc[i, 'New_SH'] = (df_test['Sh'].values[0])
                            else:
                                df2_final.loc[i, 'New_SH'] = ((df2_final.loc[i, 'New_SH'])) + "," + (
                                df_test['Sh'].values[0])
                            df2_final.loc[i, 'NewShipmentCount'] += 1
                            df2_final.loc[i, 'netVol'] = max(0, df2_final.loc[i, 'netVol'] - df_test['Vol'].values[0])
                            df2_final.loc[i, 'netWeight'] = max(0, df2_final.loc[i, 'netWeight'] -
                                                                df_test['Weight'].values[0])
                            df2_final.loc[i, 'New_BC'] += df_test['Amount'].values[0]
                    df2_final.loc[i, 'Savings'] = max(0, (df2_final.loc[i, 'BaseCost'] - df2_final.loc[i, 'New_BC']))
                    if(df2_final.loc[i,'Savings']!=0):
                        df2_final.loc[i, 'Updated Shipment Count'] = df2_final.loc[i, 'NewShipmentCount']
                        df2_final.loc[i, 'Updated Base Cost'] = df2_final.loc[i, 'New_BC']



    elif (metric == 'W'):

        CRtable['CostRatio'] = CRtable.Amount / CRtable.Weight
        CRtable['LoadDensity'] = CRtable.Weight / CRtable.Vol

        CRtable.sort_values(by=['CostRatio'], ascending=True, kind='mergesort', inplace=True)
        CRtable.reset_index(drop=True, inplace=True)

        #	print(lastConsoDate)
        if (startDate + consoDay - 1 > lastDate):
            print ("Error: The date range for analysis is shorter than consolidation days.")
        else:
            df2_final = pd.DataFrame(
                columns=['Route', 'MoT', 'Temp', 'BaseCost', 'Vol', 'Weight', 'OldShipmentCount', 'Check in Date',
                         'New SH', 'New Cost'])
            for i in range(startDate, lastConsoDate + 1, consoDay):
                df_conso = df2[(df2.DaysFromStart >= i) & (df2.DaysFromStart < i + consoDay)]
                df_conso = df_conso.groupby(["Route", "MoT", "Temp"]).agg({'Shipment': 'count',
                                                                           'BaseCost': 'sum',
                                                                           'Volume': 'sum',
                                                                           'Weight': 'sum',
                                                                           'Check in Date': 'first',
                                                                           'ST': lambda x: ','.join(x)}).reset_index()

                df_conso.rename(columns={'Shipment': 'OldShipmentCount',
                                         'ST': 'Old_SH'}, inplace=True)

                df2_final = df2_final.append(df_conso)[df_conso.columns.tolist()]
            df2_final.reset_index(drop=True, inplace=True)
            df2_final['netVol'] = df2_final.Volume
            df2_final['netWeight'] = df2_final.Weight
            df2_final['New_SH'] = np.nan
            df2_final['New_BC'] = np.nan
            df2_final['NewShipmentCount'] = df2_final.OldShipmentCount
            df2_final['Savings'] = 0
            df2_final['Updated Base Cost'] =  df2_final['BaseCost']

            for i in range(len(df2_final.index)):
                print("[%s/%s]" % (i, len(df2_final.index)))
                if (df2_final.loc[i, 'OldShipmentCount'] != 1):
                    currentRoute = df2_final.loc[i, 'Route']
                    currentMoT = df2_final.loc[i, 'MoT']
                    currentTemp = df2_final.loc[i, 'Temp']
                    loadDensity = df2_final.loc[i, 'Weight'] / df2_final.loc[i, 'Volume']
                    df_test = CRtable[(CRtable.Route == currentRoute) & (CRtable.MoT == currentMoT) & (
                                CRtable.Temp == currentTemp) & (CRtable.LoadDensity <= loadDensity)]
                    if (df_test.empty != True):
                        truckType = df_test['Sh'].values[0]
                        truckVol = df_test['Vol'].values[0]
                        truckWeight = df_test['Weight'].values[0]
                        truckCost = df_test['Amount'].values[0]
                        df2_final.loc[i, 'NewShipmentCount'] = 0
                        df2_final.loc[i, 'New_BC'] = 0
                        while (df2_final.loc[i, 'netWeight'] >= truckWeight):
                            df2_final.loc[i, 'netWeight'] = df2_final.loc[i, 'netWeight'] - truckWeight
                            df2_final.loc[i, 'netVol'] -= (truckWeight / loadDensity)
                            df2_final.loc[i, 'NewShipmentCount'] += 1
                            df2_final.loc[i, 'New_SH'] = truckType
                            df2_final.loc[i, 'New_BC'] += truckCost
                        for counter in range(int(df2_final.loc[i, 'NewShipmentCount']) - 1):
                            df2_final.loc[i, 'New_SH'] = df2_final.loc[i, 'New_SH'] + "," + truckType

                    if (df2_final.loc[i, 'netWeight'] != 0):
                        df_test = df_test[(df_test.Weight >= df2_final.loc[i, 'netWeight']) & (
                                    df_test.Vol >= df2_final.loc[i, 'netVol'])]
                        if (df_test.empty != True):
                            df_test.sort_values(by=['Amount'], ascending=True, kind='mergesort', inplace=True)
                            if (pd.isnull(df2_final['New_SH'].loc[i])):
                                df2_final.loc[i, 'New_SH'] = (df_test['Sh'].values[0])
                            else:
                                df2_final.loc[i, 'New_SH'] = ((df2_final.loc[i, 'New_SH'])) + "," + (
                                df_test['Sh'].values[0])
                            df2_final.loc[i, 'NewShipmentCount'] += 1
                            df2_final.loc[i, 'netVol'] = max(0, df2_final.loc[i, 'netVol'] - df_test['Vol'].values[0])
                            df2_final.loc[i, 'netWeight'] = max(0, df2_final.loc[i, 'netWeight'] -
                                                                df_test['Weight'].values[0])
                            df2_final.loc[i, 'New_BC'] += df_test['Amount'].values[0]
                    df2_final.loc[i, 'Savings'] = max(0, (df2_final.loc[i, 'BaseCost'] - df2_final.loc[i, 'New_BC']))
                    if (df2_final.loc[i, 'Savings'] != 0):
                        df2_final.loc[i, 'Updated Shipment Count'] = df2_final.loc[i, 'NewShipmentCount']
                        df2_final.loc[i, 'Updated Base Cost'] = df2_final.loc[i, 'New_BC']

    else:
        print("Error: Please enter a valid metric!")

                    #	df2.to_csv("/Users/jackychow/Downloads/df2.csv")
    #	CRtable.to_csv(absolute_folder + "/CR_final.csv")

    if (metric == 'V') or (metric =='W'):
        print("Original Total Cost($): %s" % sumCost(df,"BaseCost"))  # Total cost of raw data
        print("New Total Cost from Truck Consolidation ($): %s" %(sumCost(df2_final,"BaseCost")-sumCost(df2_final,"Savings")))  # Total cost after method 1
        print("Total Savings from Truck Consolidation ($): %s" % (sumCost(df2_final,"Savings")))
        print("Percentage Savings from Truck Consolidation: %s percent" % (sumCost(df2_final,"Savings") * 100.0 / sumCost(df2_final,"BaseCost")))

        df2_final.sort_values(by=['Savings'], ascending=False, kind='mergesort', inplace=True)
        df2_final.reset_index(drop=True, inplace=True)
        df2_final.drop(['netVol','netWeight'], axis=1, inplace=True)

        df2_final.index.name = 'Index'

        df2_final.to_csv(absolute_folder + "/Cost Saving Method 2 Deep Dive.csv")

        df2_final['Savings'] = df2_final.Savings.apply(thousandSeparator)
        df2_final.rename(columns={'NewShipmentCount': 'New Shipment Count',
                                  'OldShipmentCount': 'Old Shipment Count' ,
                                  'MoT': 'Mode of Transport',
                                  'Temp': 'Temperature Condition'},
                            inplace=True)

        df2_final.to_csv(absolute_folder + "/m2consolidated.csv")




print "Total Program Run Time = ", (time.time() - start) // 60, "Min ", (time.time() - start) % 60, "Sec"

if (method!=0) and (method != 1) and (method != 2) and (method != 3):
    print("Error: Please enter a valid method number!")


'''
IGNORE THIS SPACE

#print(df.describe())
#print(df['Scope'].value_counts())
#data=open('sdptest.csv',mode='r')
#print(data.readline())
#print(data.readline())
#print(data.readline())


routes=set()
for row in df.itertuples():
	if row.Route not in routes:
		routes.add(row.Route)
		print row.Route
print(len(routes))
'''

'''
test=[]
for i in df1.itertuples():
	print("[%s/%s]"%(totalCost,len(df1.index)))
	totalCost=totalCost+1
	for row in tf.itertuples():
		if ((row.Route==i.Route) and(row.Weight>=i.Weight)and(row.Temp==i.Temp)and(row.Vol>=i.Volume)and(i.MoT==row.MoT)):
			if ((row.AvgAmount<i.BaseCost)and(i.ST!=row.Sh)):
				test.append(row.AvgAmount)
				df1.set_value(i,'New BC',row.AvgAmount)
				df1.set_value(i,'New SH',row.Sh) #TBC
				df1.set_value(i,'Savings',i.BaseCost - row.AvgAmount)
				df1.set_value(i,'New TVol',row.Vol)
				df1.set_value(i,'New TWeight', row.Weight)
				break

print(test)
#df1['New LF'] = max(df1['Volume']/df1['New TVol'],df1['Weight']/df1['New TWeight'])
'''

'''
for i in range(len(df1.index)):
    print("[%s/%s]" % (totalCount, len(df1.index)))
    totalCount = totalCount + 1
    for j in range(len(Final.index)):
        if ((Final.ix[j, 'Route'] == df1.ix[i, 'Route'])
                and (Final.ix[j, 'Weight'] >= df1.ix[i, 'Weight'])
                and (Final.ix[j, 'Vol'] >= df1.ix[i, 'Volume'])
                and (Final.ix[j, 'Temp'] == df1.ix[i, 'Temp'])
                and (df1.ix[i, 'MoT'] == Final.ix[j, 'MoT'])):
            if ((Final.ix[j, 'Amount'] < df1.ix[i, 'BaseCost'])
                    and (df1.ix[i, 'ST'] != Final.ix[j, 'Sh'])):
                print(Final.ix[j, 'Amount'])
                df1.ix[i, 'New BC'] = Final.ix[j, 'Amount']
                df1.ix[i, 'New SH'] = Final.ix[j, 'Sh']
                df1.ix[i, 'Savings'] = df1.ix[i, 'BaseCost'] - Final.ix[j, 'Amount']
                df1.ix[i, 'New TVol'] = Final.ix[j, 'Vol']
                df1.ix[i, 'New TWeight'] = Final.ix[j, 'Weight']
                df1.ix[i, 'New LF'] = max(df1.ix[i, 'Volume'] / df1.ix[i, 'New TVol'],
                                          df1.ix[i, 'Weight'] / df1.ix[i, 'New TWeight'])
                break
                '''