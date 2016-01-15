# ETD_sunburst
This ETD sunburst was created from using various bits of "borrowed" code as well
as new code of my own, the main bits are attributed as follows:

Zoomable Sunburst code (the key part being data from csv rather than flare.json)
- Chapter 7 from Stephen A Thomas' great book,
"Data Visualization with JavaScript"
Chapter 7: http://jsdatav.is/chap07.html

Clickable tooltips - from d3noob: http://bl.ocks.org/d3noob/c37cb8e630aaef7df30d

Legend - Kerry Rodden: http://bl.ocks.org/kerryrodden/7090426

James Espeland my co-worker helped me figure out how to sort by "Year"
rather than value

Over all understanding of d3 from Scott Murray's great book, "Interactive data
visualization for the web" - http://chimera.labs.oreilly.com/books/1230000000345

Of course none of this would be possible without the d3.js library created by
Mike Bostock for information on d3.js go here: http://d3js.org/

---------------
The data was originally in the XOAI format and was pulled from our DSpace repository 
via OAI-PMH and the pyoaiharvester.py (https://github.com/vphill/pyoaiharvester) script usage example:
python pyoaiharvester.py -l http://URL/oai/request -o etd.xml -s col_1_733 -m xoai

Then the xml was parsed into a tsv file with xml_parser.py

The final result is here: http://scholarworks.montana.edu/
