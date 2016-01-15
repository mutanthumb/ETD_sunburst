import csv
import xml.etree.ElementTree as ET
tree = ET.ElementTree(file='etd.xml')


#for elem in tree.iter():
#        print elem.tag, elem.attrib

header = ('college', 'dept', 'year', 'url')

with open('etds.tsv', 'w') as f:
    writer = csv.writer(f,  delimiter='\t')
    writer.writerow(header)

    for record in tree.iter("record"):

        #for elem in record.findall(".//{http://www.lyncode.com/xoai}element[@name='author']"):
            #author = elem.find('*{http://www.lyncode.com/xoai}field')
            #author = author.text

        for elem in record.findall(".//{http://www.lyncode.com/xoai}element[@name='issued']"):
            date = elem.find('*{http://www.lyncode.com/xoai}field')
            year = date.text

        #for elem in record:
            #url = "http://scholarworks.montana.edu/xmlui/handle/1/733/discover?filtertype_1=dateIssued&filter_relational_operator_1=equals&filter_1=1972&filtertype_2=department&filter_relational_operator_2=equals&filter_2=Aerospace+and+Mechanical+Engineering."
            #url = url.text

        #for elem in record.findall(".//{http://www.lyncode.com/xoai}element[@name='abstract']"):
            #abstract = elem.find('*{http://www.lyncode.com/xoai}field')
            #abstract = abstract.text

        #for elem in record.findall(".//{http://www.lyncode.com/xoai}element[@name='genre']"):
            #genre = elem.find('*{http://www.lyncode.com/xoai}field')
            #genre = genre.text

        for elem in record.findall(".//{http://www.lyncode.com/xoai}element[@name='department']"):
            dept = elem.find('*{http://www.lyncode.com/xoai}field')
            dept = dept.text # add to department {} ?

        for elem in record.findall(".//{http://www.lyncode.com/xoai}element[@name='publisher']"):
            pub = elem.find('*{http://www.lyncode.com/xoai}field')
            coll = pub.text # slice this at the "," to get the college
            college = coll.split(", ", 1)[1] # add to college {} ?

        #for elem in record.findall(".//{http://www.lyncode.com/xoai}element[@name='category']"):
            #gsc = elem.find('*{http://www.lyncode.com/xoai}field')
            #gsc = gsc.text #allow for multiple categories? Use as a filter?

        row = college, dept.encode('utf-8'), (year)
        writer.writerow(row)
